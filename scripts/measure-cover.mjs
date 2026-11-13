// THE FIRST SCROLL, MEASURED.
//
//   node scripts/measure-cover.mjs http://localhost:4173 [more urls…]
//        [--wait=1500] [--throttle=4] [--secs=2.6] [--rounds=3] [--size=1366x768]
//
// A cold visit in headless Chrome: fresh profile, CPU throttled, wait as long as
// a person would before touching the wheel, then ONE compositor-driven wheel
// gesture down the whole track — the browser scrolls it the way a hand does, so
// a blocked main thread shows up as the lotus falling behind the scroll rather
// than as the harness itself stalling (which is what an in-page scrollTo loop,
// or one CDP call per step, measures instead).
//
// What it reports, per run:
//   · main-thread frame intervals across the scroll (the lotus is painted from
//     requestAnimationFrame, so a long interval IS a frozen flower)
//   · every long animation frame, with the script that caused it
//   · how many full-size lotus frames had arrived when the scroll began
//
// Several URLs are run INTERLEAVED, round-robin. This machine's throughput
// swings 2-4x minute to minute, so only numbers from the same round compare.
//
// Node 24, no dependencies: global fetch + WebSocket.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const urls = args.filter((a) => !a.startsWith("--"));
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};
const WAIT = Number(opt("wait", 1500));
const THROTTLE = Number(opt("throttle", 4));
const SECS = Number(opt("secs", 2.6));
const ROUNDS = Number(opt("rounds", 3));
const [W, H] = opt("size", "1366x768").split("x").map(Number);
const VERBOSE = args.includes("--verbose");
// --profile: a sampling CPU profile of the scroll window, by function.
// --trace:   the renderer main thread's self time by trace event (layout,
//            paint, decode, GC…) — what the profile can only call "(program)".
const PROFILE = args.includes("--profile");
const TRACE = args.includes("--trace");
// --screen: what reached the SCREEN. Counts the frames the display compositor
//           actually swapped during the scroll, and the gaps between them. The
//           starfield moves every frame, so a gap is a visible freeze — whoever
//           caused it, page or GPU. Light tracing, so it barely perturbs the run.
const SCREEN = args.includes("--screen");
// --gpu: the GPU process's two threads, self time by event and their longest
//        tasks — for when the screen freezes and the page was not the cause.
const GPU = args.includes("--gpu");
// --before=<file>: JavaScript (the body of an async function) run in the page
//        after the wait and before the scroll — for trying a change without a
//        rebuild. Tracing starts after it, so its own cost is not counted.
const BEFORE = opt("before", "");

if (!urls.length) {
  console.error("usage: node scripts/measure-cover.mjs <url> [url…] [--wait=1500] [--throttle=4]");
  process.exit(1);
}

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// runs before any page script, so nothing about the load is missed
const INSTRUMENT = `
(() => {
  const m = (window.__m = { raf: [], loaf: [], flips: [] });
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        m.loaf.push({
          start: e.startTime, dur: e.duration, block: e.blockingDuration,
          render: e.renderStart, layout: e.styleAndLayoutStart,
          scripts: e.scripts.map((s) => ({
            type: s.invokerType, inv: s.invoker, fn: s.sourceFunctionName,
            src: (s.sourceURL || "").split("/").pop(), dur: s.duration,
            forced: s.forcedStyleAndLayoutDuration,
          })),
        });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
  // EVERY REACT COMMIT, AND WHAT RE-RENDERED IN IT. React reports each commit to
  // a devtools hook if one exists before it loads — in production builds too —
  // and PerformedWork (flag 1) marks the function components that actually ran.
  m.commits = [];
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true, renderers: new Map(), inject() { return 1; },
    onCommitFiberUnmount() {}, onPostCommitFiberRoot() {}, onScheduleFiberRoot() {},
    onCommitFiberRoot(_id, root) {
      // A fiber's hook list is rebuilt every time its component runs, so a
      // changed memoizedState means "this one rendered in this commit". The
      // flag React sets for that is no use here: it is never cleared on a
      // fiber that later bails out. "roots" are the renders nobody above them
      // caused — the components whose own state changed.
      const names = {}, roots = {};
      let count = 0;
      const walk = (f, under) => {
        for (; f; f = f.sibling) {
          let ran = false;
          if (typeof f.type === "function") {
            const prev = seen.has(f) ? seen.get(f) : f.alternate && seen.get(f.alternate);
            ran = prev !== undefined && prev !== f.memoizedState;
            if (!seen.has(f) && !(f.alternate && seen.has(f.alternate))) ran = "mount";
            // which hook moved: the list is positional, so the index is stable
            let why = "";
            if (ran === true && !under) {
              const show = (v) => (v === null || typeof v !== "object" ? String(v) : Array.isArray(v) ? "[" + v.length + "]" : "{}");
              let a = prev, b = f.memoizedState, i = 0;
              for (; a && b; a = a.next, b = b.next, i++) {
                if (a.queue && a.memoizedState !== b.memoizedState) why += " #" + i + ":" + show(a.memoizedState) + ">" + show(b.memoizedState);
              }
            }
            seen.set(f, f.memoizedState);
            if (f.alternate) seen.set(f.alternate, f.memoizedState);
            if (ran) {
              count++;
              const n = (f.type.displayName || f.type.name || "?") + (ran === "mount" ? "+" : "");
              names[n] = (names[n] || 0) + 1;
              if (!under) roots[n + why] = (roots[n + why] || 0) + 1;
            }
          }
          if (f.child) walk(f.child, under || !!ran);
        }
      };
      try { walk(root.current, false); } catch {}
      m.commits.push({ t: performance.now(), count, names, roots });
    },
  };
  const seen = new WeakMap();
  const tick = (t) => { m.raf.push([t, window.scrollY]); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();
`;

// Full-size lotus frames that have landed. The page reports it on the canvas
// (the worker that fetches them has its own resource timeline, which the
// document cannot see); builds from before that are read off resource timing.
const FRAMES_IN = `() => {
  const c = document.querySelector(".cover-video-canvas");
  if (c && c.dataset.frames) return Number(c.dataset.frames);
  return performance.getEntriesByType("resource").filter((r) => r.name.includes("/lotus/f") && r.responseEnd > 0).length;
}`;

async function run(url, port) {
  const profile = mkdtempSync(join(tmpdir(), "cover-measure-"));
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    `--window-size=${W},${H}`, "--no-first-run", "--no-default-browser-check",
    "--disable-extensions", "--mute-audio", "about:blank",
  ], { stdio: "ignore" });

  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      await sleep(200);
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        target = list.find((t) => t.type === "page");
      } catch {}
    }
    if (!target) throw new Error("chrome never listed a page");

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let seq = 0;
    const pending = new Map();
    const events = [];
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method === "Tracing.dataCollected") traceEvents.push(...msg.params.value);
      else if (msg.method) events.push(msg.method);
    };
    const traceEvents = [];
    const send = (method, params = {}) =>
      new Promise((res, rej) => {
        const id = ++seq;
        pending.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "evaluate failed");
      return r.result.value;
    };

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
    await send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENT });
    await send("Page.navigate", { url });
    for (let i = 0; i < 150 && !events.includes("Page.loadEventFired"); i++) await sleep(100);
    await sleep(WAIT);

    const before = await evaluate(`(() => {
      const track = document.querySelector(".cover-track");
      return {
        span: track ? track.offsetTop + track.offsetHeight - innerHeight : 0,
        t: performance.now(), framesIn: (${FRAMES_IN})(),
        scrollY: scrollY,
      };
    })()`);
    if (!before.span) throw new Error("no .cover-track on the page");

    if (BEFORE) {
      const body = process.getBuiltinModule("node:fs").readFileSync(BEFORE, "utf8");
      await evaluate(`(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); ${body} })()`);
    }
    if (PROFILE) {
      await send("Profiler.enable");
      await send("Profiler.setSamplingInterval", { interval: 500 });
      await send("Profiler.start");
    }
    if (GPU) {
      await send("Tracing.start", {
        transferMode: "ReportEvents",
        traceConfig: { includedCategories: ["viz", "benchmark", "gpu", "skia.gpu", "gpu.angle", "cc", "toplevel", "disabled-by-default-skia.gpu", "disabled-by-default-gpu.angle", "disabled-by-default-skia.shaders", "disabled-by-default-skia.gpu.cache"] },
      });
    } else if (SCREEN && !TRACE) {
      await send("Tracing.start", {
        transferMode: "ReportEvents",
        traceConfig: { includedCategories: ["viz", "benchmark"] },
      });
    }
    if (TRACE) {
      await send("Tracing.start", {
        transferMode: "ReportEvents",
        traceConfig: { includedCategories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.invalidationTracking", "v8", "blink", "cc", "loading"] },
      });
    }
    await send("Input.synthesizeScrollGesture", {
      x: Math.round(W / 2), y: Math.round(H / 2),
      yDistance: -before.span, speed: Math.round(before.span / SECS),
      gestureSourceType: "mouse", preventFling: true,
    });
    await sleep(1800);

    let profile = null;
    if (PROFILE) profile = (await send("Profiler.stop")).profile;
    if (TRACE || SCREEN || GPU) {
      await send("Tracing.end");
      for (let i = 0; i < 300 && !events.includes("Tracing.tracingComplete"); i++) await sleep(100);
    }
    const m = await evaluate(`(() => ({ ...window.__m, t: performance.now(), scrollY: scrollY,
      framesIn: (${FRAMES_IN})() }))()`);
    ws.close();

    // the scroll window: from the gesture's start until the page stops moving,
    // plus the settle that follows it
    const t0 = before.t;
    let tEnd = t0;
    for (const [t, y] of m.raf) if (t > t0 && y < before.span - 1) tEnd = t;
    const settleEnd = tEnd + 1200;
    const win = m.raf.filter(([t]) => t >= t0 && t <= settleEnd);
    const gaps = [];
    for (let i = 1; i < win.length; i++) gaps.push(win[i][0] - win[i - 1][0]);
    gaps.sort((a, b) => a - b);
    const pct = (p) => gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * p))] ?? 0;
    const loaf = m.loaf.filter((e) => e.start + e.dur >= t0 && e.start <= settleEnd);
    return {
      profile: profile && summariseProfile(profile),
      trace: TRACE ? summariseTrace(traceEvents) : null,
      screen: SCREEN || GPU ? summariseScreen(traceEvents) : null,
      gpu: GPU ? summariseThreads(traceEvents, ["CrGpuMain", "VizCompositorThread", "Compositor"]) : null,
      shaders: GPU ? summariseShaders(traceEvents) : null,
      note: m.desk || "", url, span: before.span, reached: m.scrollY, scrollMs: Math.round(tEnd - t0),
      framesAtStart: before.framesIn, framesAtEnd: m.framesIn,
      frames: gaps.length, p50: pct(0.5), p95: pct(0.95), max: gaps.at(-1) ?? 0,
      over50: gaps.filter((g) => g > 50).length, over100: gaps.filter((g) => g > 100).length,
      frozenMs: Math.round(gaps.filter((g) => g > 50).reduce((a, b) => a + b, 0)),
      loaf: loaf.map((e) => ({ ...e, at: Math.round(e.start - t0), frac: +(((m.raf.findLast(([t]) => t <= e.start) || [0, 0])[1]) / before.span).toFixed(2) })),
      loadLoaf: m.loaf.filter((e) => e.start < t0).reduce((a, e) => a + e.dur, 0),
      commits: (m.commits || []).filter((c) => c.t >= t0 - 50 && c.t <= settleEnd).map((c) => ({
        ...c, at: Math.round(c.t - t0),
        frac: +(((m.raf.findLast(([t]) => t <= c.t) || [0, 0])[1]) / before.span).toFixed(2),
      })),
    };
  } finally {
    chrome.kill();
    await sleep(400);
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

// self time per function, and inclusive time for anything that looks like a
// React component or a named app function (capitalised, or from our own code)
function summariseProfile(p) {
  const byId = new Map(p.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of p.nodes) for (const c of n.children || []) parent.set(c, n.id);
  const self = new Map();
  const total = new Map();
  const dts = p.timeDeltas || [];
  let all = 0;
  p.samples.forEach((id, i) => {
    const dt = (dts[i] || 0) / 1000;
    all += dt;
    const n = byId.get(id);
    const key = `${n.callFrame.functionName || "(anon)"} ${(n.callFrame.url || "").split("/").pop()}:${n.callFrame.lineNumber}`;
    self.set(key, (self.get(key) || 0) + dt);
    const seen = new Set();
    for (let cur = id; cur != null; cur = parent.get(cur)) {
      const name = byId.get(cur).callFrame.functionName;
      if (name && !seen.has(name)) { seen.add(name); total.set(name, (total.get(name) || 0) + dt); }
    }
  });
  const top = (map, k) => [...map].sort((a, b) => b[1] - a[1]).slice(0, k);
  return { all, self: top(self, 28), total: top(new Map([...total].filter(([n]) => /^[A-Z]/.test(n) || /^(render|commit|update|flush|perform|begin|complete|reconcile|mount|paint|loop|measure)/.test(n))), 45) };
}

// Frames the display compositor swapped to the screen, from the moment the
// gesture began until SETTLE_MS after the last one of the scroll.
function summariseScreen(evs) {
  const swaps = evs.filter((e) => e.name === "Display::DrawAndSwap" && (e.ph === "X" || e.ph === "B")).map((e) => e.ts / 1000).sort((a, b) => a - b);
  if (swaps.length < 2) return { swaps: swaps.length };
  const gaps = [];
  for (let i = 1; i < swaps.length; i++) gaps.push(swaps[i] - swaps[i - 1]);
  const sorted = [...gaps].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const states = {};
  for (const e of evs) {
    if (e.name !== "PipelineReporter") continue;
    const st = e.args?.chrome_frame_reporter?.state;
    if (st) states[st.replace("STATE_", "").toLowerCase()] = (states[st.replace("STATE_", "").toLowerCase()] || 0) + 1;
  }
  return {
    swaps: swaps.length, secs: (swaps.at(-1) - swaps[0]) / 1000,
    p50: pct(0.5), p95: pct(0.95), max: sorted.at(-1),
    over34: gaps.filter((g) => g > 34).length, over100: gaps.filter((g) => g > 100).length,
    frozen: gaps.filter((g) => g > 34).reduce((a, b) => a + b, 0), states,
  };
}

// EVERY SHADER PROGRAM COMPILED, AND WHAT IT WAS FOR. A program is linked the
// first time a new kind of draw reaches the GPU, the GPU thread waits for it,
// and nothing is presented meanwhile. Skia traces the generated source; the
// effect is recognisable from the processor names inside it.
function summariseShaders(evs) {
  const waits = evs.filter((e) => e.ph === "X" && e.name === "Program::MainLinkLoadEvent::wait").sort((a, b) => a.ts - b.ts);
  const t0 = evs.reduce((m, e) => (e.ts && e.ts < m ? e.ts : m), Infinity);
  const texts = evs.filter((e) => e.cat && e.cat.includes("skia.shaders") && e.args).map((e) => ({ ts: e.ts, text: JSON.stringify(e.args) }));
  const MARKS = ["Blur", "Gaussian", "Convolution", "Displacement", "Turbulence", "Noise", "Lighting", "Specular", "Morphology", "Matrix", "ColorFilter", "Gradient", "RRect", "Circle", "Ellipse", "Arithmetic", "Blend", "Bicubic", "Mipmap", "YUV", "Dither", "Clamp", "Decal", "Shadow", "Luma", "Table", "Runtime", "DistanceField", "Bitmap", "Dash"];
  let prev = -Infinity;
  if (process.env.DUMP_SHADERS) {
    const fs = process.getBuiltinModule("node:fs");
    const sh = evs.filter((e) => e.cat && e.cat.includes("skia.shaders"));
    fs.writeFileSync(process.env.DUMP_SHADERS, JSON.stringify({ t0, waits: waits.map((w) => [w.ts, w.dur]), sh: sh.map((e) => ({ ts: e.ts, ph: e.ph, name: e.name, args: e.args })) }));
  }
  return {
    textEvents: texts.length,
    programs: waits.map((w) => {
      const mine = texts.filter((t) => t.ts > prev && t.ts <= w.ts + w.dur).map((t) => t.text).join(" ");
      prev = w.ts + w.dur;
      const found = MARKS.filter((m) => mine.includes(m));
      return { at: Math.round((w.ts - t0) / 1000), ms: Math.round(w.dur / 1000), marks: found.join(","), size: mine.length };
    }),
  };
}

// named threads: self time by event, and each one's longest top-level tasks
function summariseThreads(evs, names) {
  const threads = new Map();
  for (const e of evs) if (e.ph === "M" && e.name === "thread_name") threads.set(`${e.pid}:${e.tid}`, e.args.name);
  const out = {};
  for (const want of names) {
    const lists = new Map();
    for (const e of evs) {
      if (e.ph !== "X" || !e.dur) continue;
      const k = `${e.pid}:${e.tid}`;
      if (threads.get(k) !== want) continue;
      (lists.get(k) || lists.set(k, []).get(k)).push(e);
    }
    const list = [...lists.values()].sort((a, b) => b.length - a.length)[0] || [];
    list.sort((a, b) => a.ts - b.ts || b.dur - a.dur);
    const self = new Map();
    const tops = [];
    const stack = [];
    let open = null;
    for (const e of list) {
      while (stack.length && stack.at(-1).ts + stack.at(-1).dur <= e.ts) stack.pop();
      if (stack.length) stack.at(-1).child += e.dur;
      e.child = 0;
      stack.push(e);
    }
    for (const e of list) {
      const own = Math.max(0, e.dur - e.child) / 1000;
      self.set(e.name, (self.get(e.name) || 0) + own);
      if (!open || e.ts >= open.ts + open.dur) { open = { ts: e.ts, dur: e.dur, inside: new Map() }; tops.push(open); }
      open.inside.set(e.name, (open.inside.get(e.name) || 0) + own);
    }
    const t0 = list[0]?.ts || 0;
    out[want] = {
      self: [...self].sort((a, b) => b[1] - a[1]).slice(0, 14),
      longest: tops.sort((a, b) => b.dur - a.dur).slice(0, 7).map((t) => `+${Math.round((t.ts - t0) / 1000)}ms ${Math.round(t.dur / 1000)}ms: ` + [...t.inside].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, v]) => `${n} ${Math.round(v)}`).join(" · ")),
    };
  }
  return out;
}

// renderer main thread, self time by event name
function summariseTrace(evs) {
  const threads = new Map();
  for (const e of evs) if (e.ph === "M" && e.name === "thread_name") threads.set(`${e.pid}:${e.tid}`, e.args.name);
  const count = new Map();
  for (const e of evs) { const k = `${e.pid}:${e.tid}`; if (threads.get(k) === "CrRendererMain") count.set(k, (count.get(k) || 0) + 1); }
  const main = [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
  const out = {};
  for (const [label, pick] of [["main", (k) => k === main], ["other", (k) => k !== main && k.split(":")[0] === main?.split(":")[0]]]) {
    const xs = evs.filter((e) => e.ph === "X" && e.dur && pick(`${e.pid}:${e.tid}`));
    const perThread = new Map();
    for (const e of xs) { const k = `${e.pid}:${e.tid}`; (perThread.get(k) || perThread.set(k, []).get(k)).push(e); }
    const self = new Map();
    for (const list of perThread.values()) {
      list.sort((a, b) => a.ts - b.ts || b.dur - a.dur);
      const stack = [];
      for (const e of list) {
        while (stack.length && stack.at(-1).ts + stack.at(-1).dur <= e.ts) stack.pop();
        if (stack.length) stack.at(-1).child += e.dur;
        e.child = 0;
        stack.push(e);
      }
      for (const e of list) self.set(e.name, (self.get(e.name) || 0) + Math.max(0, e.dur - e.child) / 1000);
    }
    out[label] = [...self].sort((a, b) => b[1] - a[1]).slice(0, 26);
    // the main thread's longest single tasks, and what was inside each
    if (label === "main") {
      const list = [...perThread.values()][0] || [];
      const t0 = list[0]?.ts || 0;
      const tops = [];
      let open = null;
      for (const e of list) {
        if (!open || e.ts >= open.ts + open.dur) { open = { ts: e.ts, dur: e.dur, name: e.name, inside: new Map() }; tops.push(open); }
        const own = Math.max(0, e.dur - e.child) / 1000;
        const detail = e.name === "FunctionCall" ? ` ${e.args?.data?.functionName || ""}` : e.name === "Decode Image" || e.name === "Decode LazyPixelRef" ? "" : "";
        open.inside.set(e.name + detail, (open.inside.get(e.name + detail) || 0) + own);
      }
      // why style was recalculated inside each: instant events on the same thread
      const inst = evs.filter((e) => `${e.pid}:${e.tid}` === main && (e.name === "StyleRecalcInvalidationTracking" || e.name === "ScheduleStyleInvalidationTracking" || e.name === "UpdateLayoutTree"));
      for (const t of tops) {
        const why = new Map();
        for (const e of inst) {
          if (e.ts < t.ts || e.ts > t.ts + t.dur) continue;
          const d = e.args?.data || {};
          let k = null;
          if (e.name === "UpdateLayoutTree") k = e.args?.elementCount != null ? `ELEMENTS ${e.args.elementCount}` : null;
          else if (e.name === "StyleRecalcInvalidationTracking") k = `recalc:${d.reason || "?"}${d.extraData ? "/" + d.extraData : ""} <${(d.nodeName || "").slice(0, 40)}>`;
          else k = `sched:${d.changedClass ? "." + d.changedClass : d.changedAttribute ? "[" + d.changedAttribute + "]" : d.changedId ? "#" + d.changedId : d.changedPseudo || "?"} on <${(d.nodeName || "").slice(0, 30)}>`;
          if (k) why.set(k, (why.get(k) || 0) + 1);
        }
        t.why = [...why].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${k} x${n}`);
      }
      out.longest = tops.sort((a, b) => b.dur - a.dur).slice(0, 5).map((t) => ({ why: t.why,
        at: Math.round((t.ts - t0) / 1000), dur: Math.round(t.dur / 1000),
        inside: [...t.inside].sort((a, b) => b[1] - a[1]).slice(0, 9).map(([n, v]) => `${n} ${Math.round(v)}`),
      }));
    }
  }
  return out;
}

const f = (n) => String(Math.round(n)).padStart(5);
console.log(`cold visit · ${W}x${H} · ${THROTTLE}x CPU · wait ${WAIT}ms · ${SECS}s scroll · ${ROUNDS} round(s)\n`);
console.log("round  url                      frames   p50   p95   max  >50ms >100ms frozen  hi-res@start");
let port = 9500 + Math.floor(Math.random() * 300);
const all = [];
for (let r = 1; r <= ROUNDS; r++) {
  for (const url of urls) {
    try {
      const x = await run(url, port++);
      all.push({ r, ...x });
      console.log(
        `${String(r).padStart(5)}  ${url.replace(/^https?:\/\//, "").padEnd(24)}${f(x.frames)} ${f(x.p50)} ${f(x.p95)} ${f(x.max)} ${f(x.over50)}  ${f(x.over100)} ${f(x.frozenMs)}   ${x.framesAtStart}/40 -> ${x.framesAtEnd}/40` +
        (x.reached < x.span - 2 ? `   (!) scroll stopped at ${Math.round(x.reached)}/${x.span}` : "")
      );
      if (VERBOSE) {
        for (const e of x.loaf.sort((a, b) => b.dur - a.dur).slice(0, 6)) {
          const who = e.scripts.sort((a, b) => b.dur - a.dur).slice(0, 3)
            .map((s) => `${s.type}:${s.fn || s.inv || "?"}@${s.src} ${Math.round(s.dur)}ms${s.forced > 1 ? ` (forced layout ${Math.round(s.forced)})` : ""}`).join(" | ");
          const scripted = e.scripts.reduce((a, s) => a + s.dur, 0);
          console.log(`         +${String(e.at).padStart(5)}ms @${e.frac}  ${f(e.dur)}ms  script ${f(scripted)}  render+paint ${f(e.start + e.dur - (e.render || e.start + e.dur))}  ${who}`);
        }
      }
      if (x.note) console.log(`         note: ${x.note}`);
      if (x.screen) {
        const c = x.screen;
        console.log(`         on screen: ${c.swaps} frames in ${c.secs?.toFixed(1)}s (${(c.swaps / c.secs).toFixed(0)} fps) · gap p50 ${f(c.p50)} p95 ${f(c.p95)} max ${f(c.max)}ms · ${c.over34} gaps >34ms, ${c.over100} >100ms · ${f(c.frozen)}ms spent in gaps   ${JSON.stringify(c.states)}`);
      }
      if (x.shaders) {
        const ps = x.shaders.programs;
        console.log(`         shaders: ${ps.length} programs linked during the scroll, ${ps.reduce((a, p) => a + p.ms, 0)}ms of the GPU thread waiting on them`);
        if (args.includes("--shader-times")) console.log("           at " + ps.filter((p) => p.ms >= 15).map((p) => `+${p.at}:${p.ms}`).join(" "));
      }
      if (x.gpu && args.includes("--gpu-threads")) {
        for (const [name, t] of Object.entries(x.gpu)) {
          console.log(`
   ${name} — self time`);
          for (const [k, v] of t.self) console.log(`     ${f(v)}ms  ${k}`);
          console.log(`   ${name} — longest tasks`);
          for (const l of t.longest) console.log(`     ${l}`);
        }
      }
      if (VERBOSE || args.includes("--commits")) {
        console.log(`   ${x.commits.length} React commits during the scroll`);
        for (const c of x.commits) {
          const list = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([n, k]) => (k > 1 ? `${n}x${k}` : n)).join(" ");
          console.log(`         +${String(c.at).padStart(5)}ms @${c.frac}  ${String(c.count).padStart(4)} components ran — started by: ${list(c.roots)}   [${list(c.names)}]`);
        }
      }
      if (x.profile) {
        console.log(`
   CPU profile, ${Math.round(x.profile.all)}ms sampled — self time`);
        for (const [k, v] of x.profile.self) console.log(`     ${f(v)}ms  ${k}`);
        console.log(`   inclusive, named`);
        for (const [k, v] of x.profile.total) console.log(`     ${f(v)}ms  ${k}`);
      }
      if (x.trace) {
        console.log(`
   the main thread's longest tasks (ms into the trace, duration, self time inside)`);
        for (const t of x.trace.longest || []) {
          console.log(`     +${String(t.at).padStart(5)}  ${String(t.dur).padStart(5)}ms  ${t.inside.join(" · ")}`);
          if (t.why?.length) console.log(`              style: ${t.why.join(" | ")}`);
        }
        for (const label of ["main", "other"]) {
          console.log(`
   trace self time — renderer ${label} thread(s)`);
          for (const [k, v] of x.trace[label]) console.log(`     ${f(v)}ms  ${k}`);
        }
      }
    } catch (err) {
      console.log(`${String(r).padStart(5)}  ${url}  FAILED: ${err.message}`);
    }
  }
}
