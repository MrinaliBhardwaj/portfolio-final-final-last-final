// UNDERTOW's renderer — a TouchDesigner network transposed to raw WebGL2.
// Three passes, like TOPs wired together:
//   1. a ping-pong heightfield (the classic ripple feedback TOP), quarter-res
//   2. the lotus itself — a real 3D procedural plant (see lotus3d.js),
//      rendered twice into small textures: lit, and phosphor wireframe
//   3. one fullscreen composite: the void, the water, the flower above the
//      waterline and its two reflections below — the faithful dim one, and
//      the disobedient wireframe with a mind of its own.
// No three.js: a fullscreen-quad pipeline plus one hand-rolled mesh pass is
// lighter than a scene graph on a weak GPU.
import { WATERLINE } from "./game.js";
import { createLotusScene, LOTUS_FRAME } from "./lotus3d.js";

const MAX_DROPS = 8;
const MAX_MOTES = 48;

const VERT = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

// -------- pass 1: the ripple heightfield --------
// rg = (height, previous height); the classic cellular wave step
const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uTexel;
uniform float uDamp;
uniform float uSimAspect;
uniform vec4 uDrops[${MAX_DROPS}]; // xy: pos (sim uv), z: radius, w: strength
uniform int uDropCount;
in vec2 vUv;
out vec4 outColor;
void main(){
  vec2 c = texture(uField, vUv).rg;
  float l = texture(uField, vUv - vec2(uTexel.x, 0.0)).r;
  float r = texture(uField, vUv + vec2(uTexel.x, 0.0)).r;
  float d = texture(uField, vUv - vec2(0.0, uTexel.y)).r;
  float u = texture(uField, vUv + vec2(0.0, uTexel.y)).r;
  float next = (l + r + u + d) * 0.5 - c.g;
  next *= uDamp;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    if (i >= uDropCount) break;
    vec2 dv = (vUv - uDrops[i].xy) * vec2(uSimAspect, 1.0);
    float dd = dot(dv, dv);
    next += uDrops[i].w * exp(-dd / (uDrops[i].z * uDrops[i].z));
  }
  float edge = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x)
             * smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  next *= edge;
  outColor = vec4(next, c.r, 0.0, 1.0);
}`;

// -------- pass 3: the world --------
const DRAW_FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uAspect;
uniform sampler2D uSim;
uniform float uSimOn;
uniform vec2 uSimTexel;
uniform sampler2D uLit;   // the flower, lit
uniform sampler2D uWire;  // the flower as the reflection renders it

uniform float uSync;
uniform float uProgress;
uniform float uFlash;
uniform float uBurst;
uniform float uDisagree;

uniform vec3 uAbove;    // x, y (uv, y up), on
uniform vec3 uBelow;
uniform vec3 uGhost;
uniform float uFly;     // 1 = pointer mode: draw a dragonfly, not a palm-light
uniform vec4 uFirefly;  // guide firefly: x, y, on, held
uniform float uSurge;   // the reflection's doubt, 0..1
uniform float uStageGlow; // stage 1: the meeting ring calls attention

uniform vec4 uMotes[${MAX_MOTES}]; // x, hue, seed, unused
uniform int uMoteCount;

uniform float uGrainAmt;
uniform float uCalm;

in vec2 vUv;
out vec4 outColor;

const float WL = ${WATERLINE.toFixed(4)};
const vec3 PHOS = vec3(0.294, 0.898, 0.553);   // #4be58c — the tech world
const vec3 GOLD = vec3(1.0, 0.78, 0.42);
// the exact frame lotus3d renders into, in flower coords (y rel. waterline)
const vec2 FRAME0 = vec2(${LOTUS_FRAME.x0.toFixed(4)}, ${LOTUS_FRAME.y0.toFixed(4)});
const float FRAME_SIZE = ${LOTUS_FRAME.size.toFixed(4)};

float hash1(float n){ return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i), b = hash2(i + vec2(1, 0));
  float c = hash2(i + vec2(0, 1)), d = hash2(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 toFlowerFrame(vec2 uv){
  return vec2((uv.x - 0.5) * uAspect, uv.y - WL);
}

// sample one of the flower textures at a flower-frame position; masked
// outside the frame (clamped uv keeps derivatives clean at the border)
vec4 flowerTex(sampler2D t, vec2 q){
  vec2 quv = (q - FRAME0) / FRAME_SIZE;
  vec2 cuv = clamp(quv, 0.0, 1.0);
  float inside = step(abs(quv.x - 0.5), 0.5) * step(abs(quv.y - 0.5), 0.5);
  return texture(t, cuv) * inside;
}

vec3 flowerGlow(vec2 q, float lod){
  vec2 quv = clamp((q - FRAME0) / FRAME_SIZE, 0.02, 0.98);
  vec4 s = textureLod(uLit, quv, lod);
  return s.rgb * s.a;
}

// win burst — a handful of sparks leaving the heart
vec3 sparks(vec3 col, vec2 q, vec3 tint){
  if (uBurst <= 0.001 || uBurst >= 0.999) return col;
  float fade = 1.0 - uBurst;
  for (int i = 0; i < 12; i++){
    float fi = float(i);
    float an = fi * 2.399963 + 0.7;
    float sp = 0.06 + 0.20 * hash1(fi + 5.0);
    vec2 pos = vec2(0.0, 0.42) + vec2(cos(an), sin(an) * 0.85) * (0.03 + uBurst * sp);
    vec2 dv = q - pos;
    col += tint * exp(-dot(dv, dv) * 30000.0) * fade * 1.3;
  }
  return col;
}

const vec2 MOON = vec2(0.76, ${(WATERLINE + 0.335).toFixed(4)});

// low treeline on the far shore
float hillH(float x){
  float h = vnoise(vec2(x * 3.0 * uAspect, 2.3)) * 0.6
          + vnoise(vec2(x * 7.0 * uAspect, 9.1)) * 0.4;
  return 0.014 + 0.070 * h * h;
}

float starLayer(vec2 uv, float n){
  vec2 g = uv * vec2(n * uAspect, n);
  vec2 id = floor(g);
  float h = hash2(id);
  vec2 sp = vec2(hash2(id + 7.1), hash2(id + 3.7)) * 0.6 + 0.2;
  float d = length(fract(g) - sp);
  float tw = 0.5 + 0.5 * sin(uTime * (0.6 + h * 2.4) + h * 40.0);
  tw = mix(tw, 0.7, uCalm * 0.6);
  return smoothstep(0.09, 0.0, d) * tw * step(h, 0.24) * (0.4 + 0.6 * hash2(id + 1.3));
}

vec3 renderAbove(vec2 uv){
  float airT = (uv.y - WL) / (1.0 - WL);
  // night sky: deep teal-ink, breathing faintly warm at the horizon
  vec3 col = mix(vec3(0.014, 0.032, 0.030), vec3(0.004, 0.006, 0.020), smoothstep(0.0, 1.0, airT));
  col += vec3(0.10, 0.15, 0.14) * exp(-airT * 6.0) * 0.5;

  // a slow nebula, barely there
  float neb = vnoise(uv * vec2(2.2 * uAspect, 2.0) + vec2(uTime * 0.004, 0.0))
            * vnoise(uv * vec2(5.0 * uAspect, 4.5) - vec2(uTime * 0.006, 0.3));
  float nebMask = smoothstep(0.12, 0.7, airT);
  col += vec3(0.14, 0.22, 0.36) * neb * neb * 0.30 * nebMask;
  col += vec3(0.26, 0.16, 0.34) * neb * 0.06 * nebMask;

  // stars, two depths, fading toward the horizon
  float starMask = smoothstep(0.08, 0.45, airT);
  col += vec3(0.85, 0.90, 1.0) * starLayer(uv, 22.0) * 0.5 * starMask;
  col += vec3(0.80, 0.86, 1.0) * starLayer(uv + 13.7, 45.0) * 0.22 * starMask;

  // the moon, mottled and haloed
  {
    vec2 dv = (uv - MOON) * vec2(uAspect, 1.0);
    float d = length(dv);
    float mott = vnoise(dv * 34.0 + 3.7) * 0.6 + vnoise(dv * 80.0 + 9.0) * 0.4;
    vec3 mc = vec3(0.93, 0.90, 0.80) * (0.92 - 0.13 * mott);
    col = mix(col, mc, smoothstep(0.052, 0.048, d));
    col += vec3(0.72, 0.70, 0.58) * exp(-d * 9.0) * 0.24;
    col += vec3(0.55, 0.55, 0.48) * exp(-d * 30.0) * 0.30;
  }

  // slow mist, drifting like breath over the water
  float mist = vnoise(uv * vec2(3.0 * uAspect, 2.2) + vec2(uTime * 0.016, 0.0));
  mist += 0.5 * vnoise(uv * vec2(7.0 * uAspect, 5.0) - vec2(uTime * 0.01, 0.0));
  col += vec3(0.05, 0.085, 0.09) * mist * 0.17 * (1.0 - airT * 0.6);

  // the far shore swallows the sky at the line
  float sil = smoothstep(hillH(uv.x) + 0.005, hillH(uv.x) - 0.003, uv.y - WL);
  col = mix(col, vec3(0.006, 0.014, 0.013), sil * 0.92);

  // fireflies over the water — small, blinking, unbothered
  if (airT < 0.45){
    for (int i = 0; i < 7; i++){
      float fi = float(i);
      vec2 fp = vec2(
        fract(hash1(fi + 3.0) + uTime * 0.008 * (0.4 + hash1(fi)) + 0.04 * sin(uTime * 0.11 + fi * 2.1)),
        WL + 0.05 + 0.20 * hash1(fi + 11.0) + 0.018 * sin(uTime * 0.37 + fi * 3.0));
      vec2 dv = (uv - fp) * vec2(uAspect, 1.0);
      float blink = pow(0.5 + 0.5 * sin(uTime * (0.5 + hash1(fi + 7.0)) + fi * 5.0), 3.0);
      col += vec3(1.0, 0.90, 0.45) * exp(-dot(dv, dv) * 250000.0) * blink * 0.55;
    }
  }

  vec2 q = toFlowerFrame(uv);
  // a soft halo of the flower's own light, then the flower itself
  col += flowerGlow(q, 4.5) * (0.22 + 1.1 * uFlash);
  vec4 fl = flowerTex(uLit, q);
  col = mix(col, fl.rgb, fl.a);
  col = sparks(col, q, vec3(1.0, 0.85, 0.55));

  // the guide firefly — the one that matters
  if (uFirefly.z > 0.5){
    vec2 dv = (uv - uFirefly.xy) * vec2(uAspect, 1.0);
    float d2 = dot(dv, dv);
    float breathe = 0.75 + 0.25 * sin(uTime * 3.1);
    col += vec3(1.0, 0.86, 0.40) * exp(-d2 * 60000.0) * (0.9 + 0.9 * uFirefly.w) * breathe;
    col += vec3(1.0, 0.95, 0.75) * exp(-d2 * 400000.0) * 1.2;
  }
  return col;
}

vec3 renderBelow(vec2 uv){
  float depth = (WL - uv.y) / WL; // 0 at the line, 1 at the bottom
  vec2 suv = vec2(uv.x, uv.y / WL);

  // ripple field: height + gradient
  vec2 grad = vec2(0.0);
  if (uSimOn > 0.5){
    float hx = texture(uSim, suv + vec2(uSimTexel.x, 0.0)).r
             - texture(uSim, suv - vec2(uSimTexel.x, 0.0)).r;
    float hy = texture(uSim, suv + vec2(0.0, uSimTexel.y)).r
             - texture(uSim, suv - vec2(0.0, uSimTexel.y)).r;
    grad = vec2(hx, hy);
  }

  // the water is never dead-still: micro-waves under everything
  grad += vec2(
    vnoise(vec2(uv.x * 40.0 * uAspect, uv.y * 90.0 - uTime * 0.35)) - 0.5,
    vnoise(vec2(uv.x * 34.0 * uAspect + 7.0, uv.y * 80.0 - uTime * 0.28)) - 0.5
  ) * 0.006 * (0.35 + depth) * (1.0 - uCalm * 0.5);

  // the reflected coordinate, bent by the ripples
  vec2 ruv = vec2(uv.x, 2.0 * WL - uv.y);
  ruv += grad * (0.25 + 0.35 * depth);
  ruv.x += sin(uv.y * 42.0 + uTime * 0.7) * 0.0012 * depth * (1.0 - uCalm * 0.7);

  // water body
  vec3 col = mix(vec3(0.012, 0.045, 0.037), vec3(0.002, 0.009, 0.009), smoothstep(0.0, 1.0, depth));
  // shimmer where the surface bends — the phosphor world leaking through
  col += PHOS * (abs(grad.x) + abs(grad.y)) * 3.0 * (0.3 + 0.7 * (1.0 - depth));

  // the far shore, upside down and trembling near the line
  float hhR = hillH(ruv.x);
  float silR = smoothstep(hhR + 0.008, hhR - 0.003, WL - uv.y);
  col = mix(col, vec3(0.005, 0.012, 0.011), silR * 0.65 * (1.0 - depth));

  // the moon lays a path of light on the water
  {
    float colX = exp(-pow((uv.x - MOON.x) * uAspect + grad.x * 3.0, 2.0)
                   / (0.003 + 0.030 * depth));
    float glint = pow(clamp(abs(grad.y) * 26.0, 0.0, 1.0), 2.0);
    col += vec3(0.95, 0.90, 0.72)
         * colX * (0.045 * (1.0 - depth * 0.6) + glint * 0.55 * (1.0 - depth * 0.35));
    // and its face, dim and wavering, just under the shore
    vec2 dvr = (uv - vec2(MOON.x, 2.0 * WL - MOON.y)) * vec2(uAspect, 1.0) + grad * 2.0;
    col += vec3(0.45, 0.44, 0.36) * smoothstep(0.055, 0.030, length(dvr)) * 0.10 * (1.0 - depth * 0.5);
  }

  vec2 rq = toFlowerFrame(ruv);

  // the faithful reflection: what the water *should* show — dim, and
  // smearing softer the deeper it sinks
  {
    vec2 quv = (rq - FRAME0) / FRAME_SIZE;
    vec2 cuv = clamp(quv, 0.0, 1.0);
    float inside = step(abs(quv.x - 0.5), 0.5) * step(abs(quv.y - 0.5), 0.5);
    vec4 fr = textureLod(uLit, cuv, depth * 3.5) * inside;
    col = mix(col, fr.rgb * 0.48 * (1.0 - depth * 0.4), fr.a * 0.85);
  }

  // the disobedient one: the wireframe with its own state, glitching
  // sideways while it disagrees — and storming when it doubts
  vec2 gq = rq;
  float chaos = clamp(uDisagree + uSurge * 1.2, 0.0, 1.6);
  float band = step(0.965 - uSurge * 0.10, hash2(vec2(floor(uv.y * 90.0), floor(uTime * 8.0))));
  gq.x += (hash2(vec2(floor(uv.y * 90.0), floor(uTime * 8.0) + 40.0)) - 0.5)
        * 0.09 * chaos * band * (1.0 - uCalm * 0.8);
  vec4 fw = flowerTex(uWire, gq);
  float flicker = 1.0 - uSurge * 0.5 * step(0.5, hash1(floor(uTime * 24.0)));
  col += fw.rgb * fw.a * (0.85 + 0.3 * uSync) * flicker;
  col = sparks(col, rq, PHOS * 0.8);

  // the guide firefly's twin: a phosphor glint on the water
  if (uFirefly.z > 0.5){
    vec2 dv = (uv - vec2(uFirefly.x, 2.0 * WL - uFirefly.y)) * vec2(uAspect, 1.0) + grad * 2.5;
    col += PHOS * exp(-dot(dv, dv) * 200000.0) * 0.5 * (0.75 + 0.25 * sin(uTime * 3.1));
  }

  // scanlines — this world renders on a tube
  col *= 0.965 + (0.035 + 0.03 * uSurge) * sin(gl_FragCoord.y * 1.5708) * (1.0 - uCalm * 0.6);
  return col;
}

void main(){
  vec2 uv = vUv;
  float px = 1.6 / uRes.y;
  vec3 col = (uv.y > WL) ? renderAbove(uv) : renderBelow(uv);

  // ---- the waterline: boundary, and the agreement meter itself ----
  float lineD = abs(uv.y - WL);
  float core = exp(-lineD * uRes.y * 0.55);
  float glow = exp(-lineD * 60.0);
  float inMeter = 1.0 - smoothstep(uProgress * 0.5 - 0.015, uProgress * 0.5 + 0.015, abs(uv.x - 0.5));
  vec3 lineCol = mix(vec3(0.14, 0.34, 0.30), GOLD, max(inMeter, uFlash));
  // while the reflection doubts, the line itself trembles
  float tremor = 1.0 + uSurge * 0.6 * sin(uv.x * 120.0 + uTime * 30.0) * (1.0 - uCalm);
  col += lineCol * (core * (0.45 + 0.85 * uSync + 2.4 * uFlash)
                  + glow * (0.05 + 0.22 * uSync + 0.7 * uFlash)) * tremor;

  // ---- remembered lights: one mote per agreement ever made here ----
  if (lineD < 0.09){
    for (int i = 0; i < ${MAX_MOTES}; i++){
      if (i >= uMoteCount) break;
      vec4 m = uMotes[i];
      float bob = sin(uTime * 0.6 + m.z * 6.2832);
      float tw = 0.6 + 0.4 * sin(uTime * 1.7 + m.z * 41.0);
      vec3 c = mix(vec3(1.0, 0.82, 0.5), vec3(1.0, 0.6, 0.56), m.y);
      vec2 dv = (uv - vec2(m.x, WL + 0.022 + 0.013 * bob)) * vec2(uAspect, 1.0);
      col += c * exp(-dot(dv, dv) * 90000.0) * 0.8 * tw;
      vec2 dr = (uv - vec2(m.x, WL - 0.022 - 0.013 * bob)) * vec2(uAspect, 1.0);
      col += c * exp(-dot(dr, dr) * 140000.0) * 0.22 * tw;
    }
  }

  // ---- the visitors: a light above, a reticle below, a ghost to meet ----
  if (uAbove.z > 0.5){
    vec2 dv = (uv - uAbove.xy) * vec2(uAspect, 1.0);
    if (uFly > 0.5){
      // pointer mode: a dragonfly instead of a palm-light
      vec2 dq = dv * 52.0;
      float body = length(dq * vec2(6.0, 1.5)) - 0.55;
      float flut = 0.55 + 0.35 * sin(uTime * 28.0) * (1.0 - uCalm * 0.8);
      vec3 pale = vec3(0.78, 0.92, 0.94);
      for (int s = 0; s < 2; s++){
        float sg = s == 0 ? -1.0 : 1.0;
        vec2 wq = dq - vec2(sg * 0.35, 0.25);
        float ca = cos(sg * flut), sa = sin(sg * flut);
        wq = mat2(ca, -sa, sa, ca) * wq;
        float wing = length(wq * vec2(1.5, 4.4)) - 0.55;
        col += pale * 0.5 * smoothstep(0.10, 0.0, wing);
      }
      col += pale * smoothstep(0.08, 0.0, body);
      col += pale * exp(-dot(dv, dv) * 26000.0) * 0.18;
    } else {
      col += vec3(1.0, 0.85, 0.7) * exp(-dot(dv, dv) * 22000.0) * 0.5;
      float ring = smoothstep(px * 1.6, 0.0, abs(length(dv) - 0.016));
      col += vec3(1.0, 0.9, 0.8) * ring * 0.35;
    }
  }
  if (uBelow.z > 0.5){
    vec2 dv = (uv - uBelow.xy) * vec2(uAspect, 1.0);
    float ring = smoothstep(px * 1.8, 0.0, abs(length(dv) - 0.02));
    col += PHOS * (ring * 0.8 + exp(-dot(dv, dv) * 60000.0) * 0.6);
  }
  if (uGhost.z > 0.5){
    vec2 dv = (uv - uGhost.xy) * vec2(uAspect, 1.0);
    float dash = 0.55 + 0.45 * sin(atan(dv.y, dv.x) * 10.0 - uTime * 1.6);
    float ring = smoothstep(px * 2.2, 0.0, abs(length(dv) - 0.026));
    // in the first act the ring calls out, pulsing wide
    float call = uStageGlow * (0.5 + 0.5 * sin(uTime * 2.2));
    float halo = smoothstep(px * 6.0, 0.0, abs(length(dv) - 0.026 - 0.012 * call));
    col += GOLD * (ring * (0.2 + 0.55 * uSync + 0.5 * uStageGlow) + halo * call * 0.25);
  }

  // ---- finish: vignette, grain, soft rolloff ----
  vec2 vc = (uv - vec2(0.5, 0.47)) * vec2(uAspect * 0.8, 1.0);
  col *= 1.0 - 0.34 * smoothstep(0.35, 0.95, length(vc));
  float grain = hash2(uv * uRes + fract(uTime) * vec2(17.0, 31.0)) - 0.5;
  col += grain * 0.032 * uGrainAmt;
  col = col / (1.0 + col * 0.12);
  outColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("pond shader: " + log);
  }
  return sh;
}

function link(gl, vsSrc, fsSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error("pond link: " + gl.getProgramInfoLog(p));
  }
  return p;
}

// the tier ladder: step down when frames run long; never step back up
// (oscillation looks worse than a steady lower tier)
const TIERS = [
  { dpr: 1.5, lotus: 768, grain: 1, simDiv: 4 },
  { dpr: 1.15, lotus: 640, grain: 1, simDiv: 4 },
  { dpr: 1.0, lotus: 512, grain: 1, simDiv: 5 },
  { dpr: 0.8, lotus: 384, grain: 0, simDiv: 6 },
];

export function createPond(canvas, { calm = false } = {}) {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  let lost = false;
  let raf = 0;
  let tier = 0;
  let simOn = false;
  let simW = 0;
  let simH = 0;
  let progSim = null;
  let progDraw = null;
  let vao = null;
  let lotus = null;
  let fieldTex = [null, null];
  let fieldFbo = [null, null];
  let fieldSrc = 0;
  let U = {}; // draw uniforms
  let US = {}; // sim uniforms

  const drops = [];
  const moteBuf = new Float32Array(MAX_MOTES * 4);
  let frameCb = null;
  let lastT = 0;
  let fpsEma = 60;
  let frames = 0;
  let running = false;

  function uniforms(prog, names) {
    const out = {};
    for (const n of names) out[n] = gl.getUniformLocation(prog, n);
    return out;
  }

  function initGL() {
    const floatExt = gl.getExtension("EXT_color_buffer_float");
    simOn = !!floatExt;

    progSim = link(gl, VERT, SIM_FRAG);
    progDraw = link(gl, VERT, DRAW_FRAG);
    lotus = createLotusScene(gl);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    U = uniforms(progDraw, [
      "uRes", "uTime", "uAspect", "uSim", "uSimOn", "uSimTexel", "uLit", "uWire",
      "uSync", "uProgress", "uFlash", "uBurst", "uDisagree",
      "uAbove", "uBelow", "uGhost", "uFly", "uFirefly", "uSurge", "uStageGlow",
      "uMotes[0]", "uMoteCount", "uGrainAmt", "uCalm",
    ]);
    US = uniforms(progSim, [
      "uField", "uTexel", "uDamp", "uSimAspect", "uDrops[0]", "uDropCount",
    ]);

    resize(true);
  }

  function makeField() {
    for (let i = 0; i < 2; i++) {
      if (fieldTex[i]) gl.deleteTexture(fieldTex[i]);
      if (fieldFbo[i]) gl.deleteFramebuffer(fieldFbo[i]);
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RG16F, simW, simH);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      fieldTex[i] = t;
      fieldFbo[i] = f;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    fieldSrc = 0;
  }

  function resize(force) {
    const t = TIERS[tier];
    const dpr = Math.min(window.devicePixelRatio || 1, t.dpr);
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (!force && canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    if (lotus) lotus.setRes(t.lotus);
    if (simOn) {
      simW = Math.min(420, Math.max(96, Math.round(w / t.simDiv)));
      simH = Math.max(64, Math.round(simW * ((h * WATERLINE) / w)));
      makeField();
    }
  }

  function stepSim() {
    const dst = 1 - fieldSrc;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fieldFbo[dst]);
    gl.viewport(0, 0, simW, simH);
    gl.useProgram(progSim);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fieldTex[fieldSrc]);
    gl.uniform1i(US.uField, 0);
    gl.uniform2f(US.uTexel, 1 / simW, 1 / simH);
    gl.uniform1f(US.uDamp, 0.982);
    gl.uniform1f(US.uSimAspect, simW / simH);
    const n = Math.min(drops.length, MAX_DROPS);
    if (n) {
      const arr = new Float32Array(MAX_DROPS * 4);
      for (let i = 0; i < n; i++) arr.set(drops[i], i * 4);
      gl.uniform4fv(US["uDrops[0]"], arr);
    }
    gl.uniform1i(US.uDropCount, n);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    drops.length = 0;
    fieldSrc = dst;
  }

  function draw(s, time) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(progDraw);
    gl.bindVertexArray(vao);
    const t = TIERS[tier];
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uAspect, canvas.width / canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, simOn ? fieldTex[fieldSrc] : null);
    gl.uniform1i(U.uSim, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, lotus.textures.lit);
    gl.uniform1i(U.uLit, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, lotus.textures.wire);
    gl.uniform1i(U.uWire, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(U.uSimOn, simOn ? 1 : 0);
    gl.uniform2f(U.uSimTexel, simOn ? 1 / simW : 0, simOn ? 1 / simH : 0);

    gl.uniform1f(U.uSync, s.sync);
    gl.uniform1f(U.uProgress, s.progress);
    gl.uniform1f(U.uFlash, s.bloomFlash);
    gl.uniform1f(U.uBurst, s.burstT);
    gl.uniform1f(U.uDisagree, s.disagree);

    gl.uniform3f(U.uAbove, s.above.x, s.above.y, s.above.on);
    gl.uniform3f(U.uBelow, s.below.x, s.below.y, s.below.on);
    gl.uniform3f(U.uGhost, s.ghost.x, s.ghost.y, s.ghost.on);
    gl.uniform1f(U.uFly, s.pointerFly ? 1 : 0);
    gl.uniform4f(U.uFirefly, s.firefly.x, s.firefly.y, s.firefly.on, s.firefly.held);
    gl.uniform1f(U.uSurge, s.surge);
    gl.uniform1f(U.uStageGlow, s.stageGlow);

    const mn = Math.min(s.motes.length, MAX_MOTES);
    for (let i = 0; i < mn; i++) {
      moteBuf[i * 4] = s.motes[i].x;
      moteBuf[i * 4 + 1] = s.motes[i].h;
      moteBuf[i * 4 + 2] = hash01(i * 7.31);
      moteBuf[i * 4 + 3] = 0;
    }
    gl.uniform4fv(U["uMotes[0]"], moteBuf);
    gl.uniform1i(U.uMoteCount, mn);

    gl.uniform1f(U.uGrainAmt, t.grain);
    gl.uniform1f(U.uCalm, calm ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function hash01(n) {
    const x = Math.sin(n) * 43758.5453;
    return x - Math.floor(x);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (lost || !frameCb) return;
    const time = now / 1000;
    let dt = lastT ? time - lastT : 1 / 60;
    lastT = time;
    dt = Math.min(dt, 0.05);

    resize(false);
    const state = frameCb(dt, time);
    if (!state) return;
    if (simOn) stepSim();
    lotus.render(state.lotusA, state.lotusB, state.bloomFlash, time);
    draw(state, time);

    // tier watchdog: a slow machine steps down, once, calmly
    const ms = dt * 1000;
    fpsEma += (1000 / Math.max(ms, 1) - fpsEma) * 0.04;
    frames++;
    if (frames > 150 && fpsEma < 34 && tier < TIERS.length - 1) {
      tier++;
      frames = 0;
      resize(true);
    }
  }

  function start(cb) {
    frameCb = cb;
    if (!running) {
      running = true;
      lastT = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function resume() {
    if (!running && frameCb) {
      running = true;
      lastT = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  // manual frame + readback for headless verification (?sim): a hidden tab
  // never fires rAF, so the dev harness steps the world by hand
  function stepOnce(dtSec = 1 / 60) {
    if (!frameCb || lost) return;
    const time = (lastT || 0) + dtSec;
    lastT = time;
    resize(false);
    const state = frameCb(dtSec, time);
    if (!state) return;
    if (simOn) stepSim();
    lotus.render(state.lotusA, state.lotusB, state.bloomFlash, time);
    draw(state, time);
  }

  function snapshot() {
    stepOnce();
    const w = canvas.width;
    const h = canvas.height;
    const px = new Uint8Array(w * h * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const c2 = document.createElement("canvas");
    c2.width = w;
    c2.height = h;
    const ctx = c2.getContext("2d");
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      img.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    }
    ctx.putImageData(img, 0, 0);
    return c2.toDataURL("image/png");
  }

  // drops arrive in screen uv (y up); the field only covers the water
  function addDrop(x, yUv, radius, strength) {
    if (!simOn || drops.length >= MAX_DROPS) return;
    const sy = Math.min(0.985, Math.max(0.015, yUv / WATERLINE));
    drops.push([x, sy, radius, strength]);
  }

  function onLost(e) {
    e.preventDefault();
    lost = true;
  }
  function onRestored() {
    lost = false;
    initGL();
  }
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  const onVis = () => {
    if (document.hidden) pause();
    else resume();
  };
  document.addEventListener("visibilitychange", onVis);

  try {
    initGL();
  } catch (err) {
    document.removeEventListener("visibilitychange", onVis);
    console.error(err);
    return null;
  }

  return {
    start,
    addDrop,
    stepOnce,
    snapshot,
    stats: () => ({ fps: Math.round(fpsEma), tier, sim: simOn ? `${simW}x${simH}` : "off" }),
    dispose() {
      pause();
      frameCb = null;
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      // release GPU objects but do NOT loseContext(): React strict-mode
      // remounts reuse the same canvas, and getContext would hand the next
      // engine a context that is lost for good
      for (const t of fieldTex) if (t) gl.deleteTexture(t);
      for (const f of fieldFbo) if (f) gl.deleteFramebuffer(f);
      if (progSim) gl.deleteProgram(progSim);
      if (progDraw) gl.deleteProgram(progDraw);
      if (vao) gl.deleteVertexArray(vao);
      if (lotus) lotus.dispose();
      fieldTex = [null, null];
      fieldFbo = [null, null];
    },
  };
}
