// STILL WATER's renderer — four passes, cinema first:
//   1. ripple heightfield (ping-pong feedback, quarter-res)
//   2. composite → scene FBO: night sky, moon, far shore, mist, the FILMED
//      lotus (photoreal by construction) and its rippled reflection, water,
//      fireflies, falling petals, remembered motes
//   3. the spirit lotus (pure light, additive points) into the same FBO
//   4. post → screen: mip bloom, anamorphic streaks, ACES-ish curve, grade,
//      vignette, grain — the pass that makes frames read as footage, not
//      as a tech demo
import { WATERLINE } from "./game.js";
import { createSpirit } from "./spirit.js";
import { createFlowerTexture } from "./flower.js";

const MAX_DROPS = 8;
const MAX_MOTES = 48;
const MAX_FLIES = 14;
const FLOWER_URL = "/lotus-bloom.mp4";

const VERT = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

// -------- pass 1: the ripple heightfield --------
const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uTexel;
uniform float uDamp;
uniform float uSimAspect;
uniform vec4 uDrops[${MAX_DROPS}];
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
    next += uDrops[i].w * exp(-dot(dv, dv) / (uDrops[i].z * uDrops[i].z));
  }
  float edge = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x)
             * smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  next *= edge;
  outColor = vec4(next, c.r, 0.0, 1.0);
}`;

// -------- pass 2: the world --------
const DRAW_FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uAspect;
uniform sampler2D uSim;
uniform float uSimOn;
uniform vec2 uSimTexel;
uniform sampler2D uFlower;     // the filmed bloom, current frame
uniform float uFlowerOn;
uniform vec4 uFlowerRect;      // cx, cy, halfW, halfH (screen uv)
uniform float uFlowerGlow;     // pulse when an offering lands
uniform float uLean;

uniform vec3 uAbove;
uniform vec3 uBelow;
uniform vec4 uMotes[${MAX_MOTES}];
uniform int uMoteCount;
uniform vec4 uFlies[${MAX_FLIES}]; // x, y, phase, brightness
uniform vec4 uPetal;               // x, y, rot, life
uniform float uDerender;           // 0..1 pulse
uniform float uCalm;

in vec2 vUv;
out vec4 outColor;

const float WL = ${WATERLINE.toFixed(4)};
const vec3 PHOS = vec3(0.294, 0.898, 0.553);
const vec2 MOON = vec2(0.78, ${(WATERLINE + 0.36).toFixed(4)});

float hash1(float n){ return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i), b = hash2(i + vec2(1, 0));
  float c = hash2(i + vec2(0, 1)), d = hash2(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p){
  return vnoise(p) * 0.6 + vnoise(p * 2.13 + 5.0) * 0.28 + vnoise(p * 4.41 + 9.0) * 0.12;
}

float hillH(float x){
  float h = vnoise(vec2(x * 3.0 * uAspect, 2.3)) * 0.6
          + vnoise(vec2(x * 7.0 * uAspect, 9.1)) * 0.4;
  return 0.012 + 0.055 * h * h;
}

float starLayer(vec2 uv, float n){
  vec2 g = uv * vec2(n * uAspect, n);
  vec2 id = floor(g);
  float h = hash2(id);
  vec2 sp = vec2(hash2(id + 7.1), hash2(id + 3.7)) * 0.6 + 0.2;
  float d = length(fract(g) - sp);
  float tw = 0.5 + 0.5 * sin(uTime * (0.5 + h * 2.0) + h * 40.0);
  tw = mix(tw, 0.7, uCalm * 0.6);
  return smoothstep(0.08, 0.0, d) * tw * step(h, 0.22) * (0.4 + 0.6 * hash2(id + 1.3));
}

// the filmed flower, luminance-keyed over the night (its blacks dissolve)
vec4 flowerSample(vec2 p){
  vec2 fuv = (p - uFlowerRect.xy) / (uFlowerRect.zw * 2.0) + 0.5;
  vec2 cuv = clamp(fuv, 0.0, 1.0);
  if (uFlowerOn < 0.5) return vec4(0.0);
  float inside = step(abs(fuv.x - 0.5), 0.5) * step(abs(fuv.y - 0.5), 0.5);
  vec3 vid = texture(uFlower, vec2(cuv.x, 1.0 - cuv.y)).rgb;
  float l = dot(vid, vec3(0.299, 0.587, 0.114));
  float k = smoothstep(0.055, 0.24, l);
  // the quad must never read as a rectangle: fade every border away
  float edge = smoothstep(0.0, 0.10, fuv.x) * smoothstep(1.0, 0.90, fuv.x)
             * smoothstep(0.0, 0.06, fuv.y) * smoothstep(1.0, 0.86, fuv.y);
  return vec4(vid, k * edge * inside);
}

vec3 renderAbove(vec2 uv){
  float airT = (uv.y - WL) / (1.0 - WL);
  vec3 col = mix(vec3(0.013, 0.030, 0.029), vec3(0.003, 0.005, 0.017), smoothstep(0.0, 1.0, airT));
  col += vec3(0.085, 0.13, 0.12) * exp(-airT * 5.0) * 0.55;

  float neb = vnoise(uv * vec2(2.2 * uAspect, 2.0) + vec2(uTime * 0.004, 0.0))
            * vnoise(uv * vec2(5.0 * uAspect, 4.5) - vec2(uTime * 0.006, 0.3));
  float nebMask = smoothstep(0.12, 0.7, airT);
  col += vec3(0.12, 0.20, 0.34) * neb * neb * 0.26 * nebMask;

  float starMask = smoothstep(0.10, 0.5, airT);
  col += vec3(0.85, 0.90, 1.0) * starLayer(uv, 22.0) * 0.40 * starMask;
  col += vec3(0.80, 0.86, 1.0) * starLayer(uv + 13.7, 45.0) * 0.18 * starMask;

  // the moon — hazy, breathing behind slow cloud
  {
    vec2 dv = (uv - MOON) * vec2(uAspect, 1.0);
    float d = length(dv);
    float cloud = 0.72 + 0.28 * fbm(uv * vec2(2.6 * uAspect, 2.2) - vec2(uTime * 0.009, 0.0));
    float mott = vnoise(dv * 34.0 + 3.7) * 0.6 + vnoise(dv * 80.0 + 9.0) * 0.4;
    vec3 mc = vec3(0.90, 0.87, 0.78) * (0.90 - 0.14 * mott);
    col = mix(col, mc * cloud, smoothstep(0.055, 0.044, d) * 0.92);
    col += vec3(0.62, 0.60, 0.50) * exp(-d * 6.0) * 0.20 * cloud;
    col += vec3(0.50, 0.50, 0.44) * exp(-d * 16.0) * 0.24 * cloud;
  }

  // mist in two drifting sheets
  float mist = fbm(uv * vec2(2.6 * uAspect, 2.0) + vec2(uTime * 0.014, 0.0));
  col += vec3(0.05, 0.08, 0.085) * mist * 0.20 * (1.0 - airT * 0.7);

  // the far shore: a soft fog-bank ridge, not a cutout
  float hh = hillH(uv.x);
  float sil = smoothstep(hh + 0.012, hh - 0.004, uv.y - WL);
  vec3 ridge = mix(vec3(0.010, 0.020, 0.019), col, 0.42);
  col = mix(col, ridge, sil);
  // and haze pooling above it
  col += vec3(0.05, 0.075, 0.075) * exp(-max(uv.y - WL - hh, 0.0) * 22.0) * 0.5;

  // the flower's own light on the mist, then the flower itself
  {
    vec2 fc = uFlowerRect.xy;
    vec2 dv = (uv - fc) * vec2(uAspect, 1.0);
    col += vec3(0.55, 0.28, 0.30) * exp(-dot(dv, dv) * 26.0) * (0.10 + 0.55 * uFlowerGlow);
    vec4 fl = flowerSample(uv);
    col = mix(col, fl.rgb * (1.0 + 0.35 * uFlowerGlow), fl.a);
  }

  // fireflies
  for (int i = 0; i < ${MAX_FLIES}; i++){
    vec4 f = uFlies[i];
    vec2 dv = (uv - f.xy) * vec2(uAspect, 1.0);
    float blink = pow(0.5 + 0.5 * sin(f.z), 3.0);
    col += vec3(1.0, 0.88, 0.42) * exp(-dot(dv, dv) * 220000.0) * blink * f.w * 0.85;
    col += vec3(1.0, 0.92, 0.60) * exp(-dot(dv, dv) * 30000.0) * blink * f.w * 0.10;
  }

  // a petal, letting go
  if (uPetal.w > 0.001){
    vec2 dv = (uv - uPetal.xy) * vec2(uAspect, 1.0);
    float ca = cos(uPetal.z), sa = sin(uPetal.z);
    dv = mat2(ca, -sa, sa, ca) * dv;
    float pd = length(dv * vec2(70.0, 130.0)) - 0.55;
    float m = smoothstep(0.06, -0.02, pd) * smoothstep(0.0, 0.15, uPetal.w);
    col = mix(col, vec3(0.92, 0.72, 0.76) * (0.5 + 0.3 * dv.y * 60.0), m * 0.9);
  }

  // presence: a soft warmth around an offered hand — no rings, no cursors
  if (uAbove.z > 0.5){
    vec2 dv = (uv - uAbove.xy) * vec2(uAspect, 1.0);
    col += vec3(1.0, 0.85, 0.66) * exp(-dot(dv, dv) * 900.0) * 0.030;
  }
  return col;
}

vec3 renderBelow(vec2 uv){
  float depth = (WL - uv.y) / WL;
  vec2 suv = vec2(uv.x, uv.y / WL);

  vec2 grad = vec2(0.0);
  if (uSimOn > 0.5){
    float hx = texture(uSim, suv + vec2(uSimTexel.x, 0.0)).r
             - texture(uSim, suv - vec2(uSimTexel.x, 0.0)).r;
    float hy = texture(uSim, suv + vec2(0.0, uSimTexel.y)).r
             - texture(uSim, suv - vec2(0.0, uSimTexel.y)).r;
    grad = vec2(hx, hy);
  }
  grad += vec2(
    vnoise(vec2(uv.x * 40.0 * uAspect, uv.y * 90.0 - uTime * 0.35)) - 0.5,
    vnoise(vec2(uv.x * 34.0 * uAspect + 7.0, uv.y * 80.0 - uTime * 0.28)) - 0.5
  ) * 0.006 * (0.35 + depth) * (1.0 - uCalm * 0.5);

  vec2 ruv = vec2(uv.x, 2.0 * WL - uv.y);
  ruv += grad * (0.25 + 0.35 * depth);

  vec3 col = mix(vec3(0.012, 0.040, 0.035), vec3(0.002, 0.008, 0.008), smoothstep(0.0, 1.0, depth));
  col += vec3(0.35, 0.55, 0.50) * (abs(grad.x) + abs(grad.y)) * 2.2 * (0.3 + 0.7 * (1.0 - depth));

  // the far shore, upside-down and trembling
  float hhR = hillH(ruv.x);
  float silR = smoothstep(hhR + 0.010, hhR - 0.003, WL - uv.y);
  col = mix(col, vec3(0.006, 0.013, 0.012), silR * 0.55 * (1.0 - depth));

  // moonlight lays a path on the water
  {
    float colX = exp(-pow((uv.x - MOON.x) * uAspect + grad.x * 3.0, 2.0)
                   / (0.0035 + 0.035 * depth));
    float glint = pow(clamp(abs(grad.y) * 26.0, 0.0, 1.0), 2.0);
    col += vec3(0.92, 0.88, 0.70)
         * colX * (0.05 * (1.0 - depth * 0.6) + glint * 0.60 * (1.0 - depth * 0.35));
  }

  // the filmed flower, mirrored — smeared a little, the way water tells it
  {
    vec4 fr = flowerSample(vec2(ruv.x, ruv.y));
    vec4 fr2 = flowerSample(vec2(ruv.x, ruv.y + 0.010));
    vec3 refl = (fr.rgb * fr.a + fr2.rgb * fr2.a) * 0.5;
    float a = max(fr.a, fr2.a);
    col = mix(col, refl * 0.40 * (1.0 - depth * 0.45), a * 0.8);
    // fireflies glint on the water too
    for (int i = 0; i < ${MAX_FLIES}; i++){
      vec4 f = uFlies[i];
      vec2 dv = (uv - vec2(f.x, 2.0 * WL - f.y)) * vec2(uAspect, 1.0) + grad * 2.0;
      float blink = pow(0.5 + 0.5 * sin(f.z), 3.0);
      col += vec3(1.0, 0.85, 0.45) * exp(-dot(dv, dv) * 300000.0) * blink * f.w * 0.22;
    }
  }

  // presence under the line: the water holds a faint cool light
  if (uBelow.z > 0.5){
    vec2 dv = (uv - uBelow.xy) * vec2(uAspect, 1.0);
    col += PHOS * exp(-dot(dv, dv) * 1100.0) * 0.035;
  }

  // long stillness: the reflection forgets it is water — phosphor shows
  // through, then heals (the pond's other world, whispering)
  float dr = sin(3.14159 * clamp(uDerender, 0.0, 1.0));
  if (dr > 0.002){
    float cell = hash2(floor(uv * vec2(150.0 * uAspect, 150.0)) + floor(uTime * 3.0));
    float lum = dot(col, vec3(0.35, 0.5, 0.15));
    vec3 ghost = PHOS * (0.02 + lum * 2.6) * step(1.0 - lum * 1.5 - 0.015, cell);
    // a whisper over the heart of the reflection, not a wall of static
    float zone = smoothstep(0.02, 0.2, depth)
               * exp(-abs(uv.x - 0.5) * 2.4) * (1.0 - depth * 0.5);
    col = mix(col, ghost, dr * zone * 0.8);
  }
  return col;
}

void main(){
  vec2 uv = vUv;
  vec3 col = (uv.y > WL) ? renderAbove(uv) : renderBelow(uv);

  // the waterline: a breathing seam of light, nothing more
  float lineD = abs(uv.y - WL);
  float breath = 0.8 + 0.2 * sin(uTime * 0.45);
  col += vec3(0.30, 0.50, 0.46) * exp(-lineD * uRes.y * 0.5) * 0.16 * breath;
  col += vec3(0.20, 0.34, 0.32) * exp(-lineD * 70.0) * 0.05 * breath;

  // remembered lights — one for every offering ever made here
  if (lineD < 0.08){
    for (int i = 0; i < ${MAX_MOTES}; i++){
      if (i >= uMoteCount) break;
      vec4 m = uMotes[i];
      float bob = sin(uTime * 0.5 + m.z * 6.2832);
      float tw = 0.55 + 0.45 * sin(uTime * 1.4 + m.z * 41.0);
      vec3 c = mix(vec3(1.0, 0.82, 0.5), vec3(1.0, 0.62, 0.58), m.y);
      vec2 dv = (uv - vec2(m.x, WL + 0.018 + 0.010 * bob)) * vec2(uAspect, 1.0);
      col += c * exp(-dot(dv, dv) * 120000.0) * 0.5 * tw;
      vec2 rv = (uv - vec2(m.x, WL - 0.016 - 0.010 * bob)) * vec2(uAspect, 1.0);
      col += c * exp(-dot(rv, rv) * 190000.0) * 0.14 * tw;
    }
  }

  outColor = vec4(col, 1.0);
}`;

// -------- pass 4: cinema --------
const POST_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uTime;
uniform float uBloomAmt;
uniform float uStreakAmt;
uniform float uGrainAmt;
in vec2 vUv;
out vec4 outColor;

float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

void main(){
  vec2 uv = vUv;
  vec3 base = texture(uScene, uv).rgb;

  // bloom from the scene's own mip chain — light spills like film halation
  vec3 b3 = textureLod(uScene, uv, 3.0).rgb;
  vec3 b4 = textureLod(uScene, uv, 4.0).rgb;
  vec3 b5 = textureLod(uScene, uv, 5.0).rgb;
  vec3 bloom = max(b3 * 0.5 + b4 * 0.8 + b5 * 0.7 - base * 0.22, 0.0);

  // anamorphic streaks: bright points smear horizontally, cool-tinted
  vec3 streak = vec3(0.0);
  if (uStreakAmt > 0.01){
    for (int i = 1; i <= 5; i++){
      float o = float(i) * 0.014;
      float w = exp(-float(i) * 0.6);
      streak += (textureLod(uScene, uv + vec2(o, 0.0), 4.0).rgb
               + textureLod(uScene, uv - vec2(o, 0.0), 4.0).rgb) * w;
    }
    streak = max(streak - 0.05, 0.0) * vec3(0.75, 0.9, 1.1) * 0.12;
  }

  vec3 col = base * 1.22 + bloom * uBloomAmt * 0.55 + streak * uStreakAmt;

  // ACES-ish filmic curve
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);

  // grade: teal in the shadows, a breath of warmth in the lights
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col += vec3(-0.008, 0.010, 0.016) * (1.0 - smoothstep(0.0, 0.45, l));
  col *= mix(vec3(1.0), vec3(1.045, 1.0, 0.945), smoothstep(0.3, 1.0, l));

  // vignette + grain
  vec2 vc = (uv - vec2(0.5, 0.47)) * vec2(uRes.x / uRes.y * 0.72, 1.0);
  col *= 1.0 - 0.30 * smoothstep(0.42, 1.0, length(vc));
  col += (hash2(uv * uRes + fract(uTime) * vec2(17.0, 31.0)) - 0.5) * 0.030 * uGrainAmt;

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

const TIERS = [
  { dpr: 1.5, simDiv: 4, bloom: 1.0, streak: 1, grain: 1 },
  { dpr: 1.15, simDiv: 4, bloom: 1.0, streak: 1, grain: 1 },
  { dpr: 1.0, simDiv: 5, bloom: 0.9, streak: 0, grain: 1 },
  { dpr: 0.8, simDiv: 6, bloom: 0.6, streak: 0, grain: 0 },
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
  let progPost = null;
  let vao = null;
  let spirit = null;
  let flower = null;
  let fieldTex = [null, null];
  let fieldFbo = [null, null];
  let fieldSrc = 0;
  let sceneTex = null;
  let sceneFbo = null;
  let U = {};
  let US = {};
  let UP = {};

  const drops = [];
  const moteBuf = new Float32Array(MAX_MOTES * 4);
  const flyBuf = new Float32Array(MAX_FLIES * 4);
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
    simOn = !!gl.getExtension("EXT_color_buffer_float");

    progSim = link(gl, VERT, SIM_FRAG);
    progDraw = link(gl, VERT, DRAW_FRAG);
    progPost = link(gl, VERT, POST_FRAG);
    spirit = createSpirit(gl);
    flower = createFlowerTexture(gl, FLOWER_URL);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    U = uniforms(progDraw, [
      "uRes", "uTime", "uAspect", "uSim", "uSimOn", "uSimTexel",
      "uFlower", "uFlowerOn", "uFlowerRect", "uFlowerGlow", "uLean",
      "uAbove", "uBelow", "uMotes[0]", "uMoteCount", "uFlies[0]",
      "uPetal", "uDerender", "uCalm",
    ]);
    US = uniforms(progSim, [
      "uField", "uTexel", "uDamp", "uSimAspect", "uDrops[0]", "uDropCount",
    ]);
    UP = uniforms(progPost, [
      "uScene", "uRes", "uTime", "uBloomAmt", "uStreakAmt", "uGrainAmt",
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

  function makeScene(w, h) {
    if (sceneTex) gl.deleteTexture(sceneTex);
    if (sceneFbo) gl.deleteFramebuffer(sceneFbo);
    sceneTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    const levels = Math.floor(Math.log2(Math.max(w, h))) + 1;
    gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA8, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    sceneFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function resize(force) {
    const t = TIERS[tier];
    const dpr = Math.min(window.devicePixelRatio || 1, t.dpr);
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (!force && canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    makeScene(w, h);
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

  function hash01(n) {
    const x = Math.sin(n) * 43758.5453;
    return x - Math.floor(x);
  }

  function drawScene(s, time) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(progDraw);
    gl.bindVertexArray(vao);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    const aspect = canvas.width / canvas.height;
    gl.uniform1f(U.uAspect, aspect);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, simOn ? fieldTex[fieldSrc] : null);
    gl.uniform1i(U.uSim, 0);
    gl.uniform1f(U.uSimOn, simOn ? 1 : 0);
    gl.uniform2f(U.uSimTexel, simOn ? 1 / simW : 0, simOn ? 1 / simH : 0);

    const flowerReady = flower.update(s.flower);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, flower.texture);
    gl.uniform1i(U.uFlower, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(U.uFlowerOn, flowerReady ? 1 : 0);
    // the filmed frame sits on the water, leaning a breath toward presence
    const halfH = 0.30;
    const halfW = (halfH * flower.aspect) / aspect;
    gl.uniform4f(
      U.uFlowerRect,
      0.5 + s.lean * 0.014 + s.sway * 0.01,
      WATERLINE + halfH - 0.10,
      halfW,
      halfH
    );
    gl.uniform1f(U.uFlowerGlow, s.flowerGlow);
    gl.uniform1f(U.uLean, s.lean);

    gl.uniform3f(U.uAbove, s.above.x, s.above.y, s.above.on);
    gl.uniform3f(U.uBelow, s.below.x, s.below.y, s.below.on);

    const mn = Math.min(s.motes.length, MAX_MOTES);
    for (let i = 0; i < mn; i++) {
      moteBuf[i * 4] = s.motes[i].x;
      moteBuf[i * 4 + 1] = s.motes[i].h;
      moteBuf[i * 4 + 2] = hash01(i * 7.31);
      moteBuf[i * 4 + 3] = 0;
    }
    gl.uniform4fv(U["uMotes[0]"], moteBuf);
    gl.uniform1i(U.uMoteCount, mn);

    for (let i = 0; i < MAX_FLIES; i++) {
      const f = s.fireflies[i];
      flyBuf[i * 4] = f.x;
      flyBuf[i * 4 + 1] = f.y;
      flyBuf[i * 4 + 2] = f.ph;
      flyBuf[i * 4 + 3] = f.br;
    }
    gl.uniform4fv(U["uFlies[0]"], flyBuf);

    gl.uniform4f(U.uPetal, s.petal.x, s.petal.y, s.petal.rot, s.petal.life);
    gl.uniform1f(U.uDerender, s.derender);
    gl.uniform1f(U.uCalm, calm ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // the spirit is light: added on top, then bloomed by the post pass
    spirit.draw(s.spirit, time, canvas.width, canvas.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  function drawPost(time) {
    const t = TIERS[tier];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(progPost);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.uniform1i(UP.uScene, 0);
    gl.uniform2f(UP.uRes, canvas.width, canvas.height);
    gl.uniform1f(UP.uTime, time);
    gl.uniform1f(UP.uBloomAmt, t.bloom);
    gl.uniform1f(UP.uStreakAmt, t.streak);
    gl.uniform1f(UP.uGrainAmt, t.grain);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function renderFrame(state, time) {
    if (simOn) stepSim();
    drawScene(state, time);
    drawPost(time);
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
    renderFrame(state, time);

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

  function stepOnce(dtSec = 1 / 60) {
    if (!frameCb || lost) return;
    const time = (lastT || 0) + dtSec;
    lastT = time;
    resize(false);
    const state = frameCb(dtSec, time);
    if (!state) return;
    renderFrame(state, time);
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
      for (const t of fieldTex) if (t) gl.deleteTexture(t);
      for (const f of fieldFbo) if (f) gl.deleteFramebuffer(f);
      if (sceneTex) gl.deleteTexture(sceneTex);
      if (sceneFbo) gl.deleteFramebuffer(sceneFbo);
      if (progSim) gl.deleteProgram(progSim);
      if (progDraw) gl.deleteProgram(progDraw);
      if (progPost) gl.deleteProgram(progPost);
      if (vao) gl.deleteVertexArray(vao);
      if (spirit) spirit.dispose();
      if (flower) flower.dispose();
      fieldTex = [null, null];
      fieldFbo = [null, null];
    },
  };
}
