// The pond's voice: a low hum that swells as the worlds agree, and one soft
// bell when they do. Built lazily on the first toggle (a user gesture, so the
// AudioContext is allowed to start), torn down with the world.
export function createHum() {
  let ctx = null;
  let master = null;
  let filter = null;
  let on = false;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 260;
    filter.connect(master);
    master.connect(ctx.destination);

    // three near-harmonic sines, slightly detuned so the drone breathes
    for (const [freq, gain] of [
      [55, 0.5],
      [110.4, 0.2],
      [164.6, 0.09],
    ]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g);
      g.connect(filter);
      o.start();
    }
  }

  return {
    setOn(next) {
      on = next;
      if (on && !ctx) build();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(on ? 0.05 : 0, ctx.currentTime + 0.8);
    },
    // agreement raises the pitch of the water, gently
    setSync(sync) {
      if (!ctx || !on) return;
      master.gain.linearRampToValueAtTime(0.045 + 0.05 * sync, ctx.currentTime + 0.4);
      filter.frequency.linearRampToValueAtTime(260 + 700 * sync, ctx.currentTime + 0.4);
    },
    chime() {
      if (!ctx || !on) return;
      const t0 = ctx.currentTime;
      for (const [freq, gain, len] of [
        [660, 0.07, 2.6],
        [990, 0.045, 2.2],
        [1318, 0.025, 1.7],
      ]) {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t0);
        o.stop(t0 + len);
      }
    },
    dispose() {
      if (ctx) ctx.close().catch(() => {});
      ctx = null;
    },
  };
}
