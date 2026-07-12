// The flower that exists between your hands — not matter, light. A point
// cloud shaped like a lotus, born in the empty space your palms enclose:
// move them apart and it elongates, bring them together and it condenses,
// turn your wrists and it turns, cross your hands and it blooms inside-out.
// When you let it go, the light sinks into the pond and the real flower
// answers.
//
// Drawn additively into the scene FBO so the cinematic post pass (bloom,
// streaks, grade) treats it as light, not sprites.

const RINGS = [
  // petals per ring, ring openness, length  (outer → inner)
  [9, 1.15, 1.0],
  [7, 0.78, 0.8],
  [5, 0.45, 0.62],
];
const PTS_PER_PETAL = 90;
const CORE_PTS = 160;
const THREAD_PTS = 220;

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec4 aP; // xyz: local shape, w: kind (0 petal, 1 core, 2 thread)
layout(location=1) in vec4 aR; // rand, petal-u, ring, thread-t
uniform vec2 uRes;
uniform float uAspect;
uniform vec2 uCenter;   // screen uv
uniform float uScale;
uniform float uStretch; // 1 = round, >1 elongated
uniform float uAngle;
uniform float uInvert;  // 0..1 petals fold inside-out
uniform float uAlive;   // 0..1 presence
uniform float uSink;    // 0..1 draining into the water
uniform vec2 uSinkPos;
uniform vec2 uPalmA;    // the thread of light spans the actual palms
uniform vec2 uPalmB;
uniform float uTime;
out float vFade;
out float vRnd;
out float vKind;

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main(){
  float kind = aP.w;
  vec3 p = aP.xyz;
  float rnd = aR.x;

  // breathing, and a slow inner swirl so the light never freezes
  float t = uTime;
  p.xz = rot(t * 0.15 + rnd * 0.4) * p.xz;
  p *= 1.0 + 0.04 * sin(t * 1.7 + rnd * 6.283);
  p.y -= 0.17; // the cloud grows upward; recentre it on the palm midpoint

  // crossing your hands folds the flower through itself
  float inv = uInvert;
  p.xz *= mix(1.0, -1.0, inv);
  p.y = mix(p.y, 0.62 - p.y, inv * 0.85);

  // flatten 3D shape to the screen plane the hands define
  vec2 q = vec2(p.x, p.y);
  q.x += p.z * 0.22; // a little parallax from the swirl
  q.y *= uStretch;
  q = rot(uAngle) * q;

  vec2 pos = uCenter + q * uScale / vec2(uAspect, 1.0);

  // the thread lives between the palms regardless of the flower's shape
  if (kind > 1.5){
    float tt = aR.w;
    pos = mix(uPalmA, uPalmB, tt);
    pos += vec2(sin(tt * 21.0 + t * 3.0), cos(tt * 17.0 - t * 2.6)) * 0.007 * sin(tt * 3.14159);
  }

  // letting go: everything drains toward one point on the water
  float sink = smoothstep(0.0, 1.0, uSink);
  vec2 fallPos = uSinkPos + vec2((rnd - 0.5) * 0.05 * (1.0 - sink), 0.02 * (1.0 - sink));
  pos = mix(pos, fallPos, sink * sink);

  vFade = uAlive * (1.0 - sink * 0.55) * (0.35 + 0.6 * rnd);
  if (kind < 0.5) vFade *= 0.45 + 0.75 * aR.w; // rim-lit petals, dim interiors
  vRnd = rnd;
  vKind = kind;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
  float size = (kind > 1.5 ? 2.2 : 3.2 + 3.4 * rnd) * uAlive;
  gl_PointSize = size * (uRes.y / 900.0) * (0.7 + 0.4 * min(uScale / 0.2, 1.5));
}`;

const FRAG = `#version 300 es
precision highp float;
in float vFade;
in float vRnd;
in float vKind;
out vec4 outColor;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d);
  float a = exp(-r2 * 9.0) * vFade;
  // gold at the heart of each mote, rose at its rim — warmer than the
  // filmed flower's cool white, so the two never read as one thing
  vec3 warm = mix(vec3(1.0, 0.80, 0.38), vec3(1.0, 0.58, 0.62), vRnd);
  if (vKind > 1.5) warm = vec3(1.0, 0.92, 0.70);
  outColor = vec4(warm * a, a);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("spirit shader: " + log);
  }
  return sh;
}

// the same lotus mathematics as everything else in the pond, sampled as
// scattered points rather than surfaces
function buildCloud() {
  const pts = [];
  const rand = (() => {
    let s = 7;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  })();

  RINGS.forEach(([n, open, len], ring) => {
    const ringT = ring / (RINGS.length - 1);
    for (let k = 0; k < n; k++) {
      const az = ((k + ring * 0.5) / n) * Math.PI * 2;
      const tilt = 0.16 + open * 0.6; // upright cup, not a flat dome
      for (let i = 0; i < PTS_PER_PETAL; i++) {
        // weight samples toward tips and edges so the petal SHAPES read,
        // not just a puff of dust
        const u = Math.pow(rand(), 0.65);
        const v = (rand() < 0.5 ? -1 : 1) * 0.5 * Math.pow(rand(), 0.45);
        const kap = -0.8 / (len * 0.4);
        const s = u * len * 0.4;
        const th = tilt + kap * s;
        const r0 = 0.05 * (1 - ringT * 0.4);
        const rS = r0 + (Math.cos(tilt) - Math.cos(th)) / kap;
        const zS = (Math.sin(th) - Math.sin(tilt)) / kap;
        const wid = len * 0.16 * Math.sin(Math.PI * Math.min(u * 0.94 + 0.03, 1));
        const xw = v * wid;
        const R = [Math.cos(az), Math.sin(az)];
        const W = [-Math.sin(az), Math.cos(az)];
        pts.push(
          R[0] * rS + W[0] * xw,
          zS,
          R[1] * rS + W[1] * xw,
          0,
          rand(),
          u,
          ringT,
          Math.abs(v) * 2 // edge factor: petal rims carry the light
        );
      }
    }
  });
  for (let i = 0; i < CORE_PTS; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 2) * 0.05;
    pts.push(Math.cos(a) * r, 0.02 + rand() * 0.05, Math.sin(a) * r, 1, rand(), 0, 0, 0);
  }
  for (let i = 0; i < THREAD_PTS; i++) {
    pts.push(0, 0, 0, 2, rand(), 0, 0, i / (THREAD_PTS - 1));
  }
  return new Float32Array(pts);
}

export function createSpirit(gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("spirit link: " + gl.getProgramInfoLog(prog));
  }
  const U = {};
  for (const n of [
    "uRes", "uAspect", "uCenter", "uScale", "uStretch", "uAngle",
    "uInvert", "uAlive", "uSink", "uSinkPos", "uPalmA", "uPalmB", "uTime",
  ]) {
    U[n] = gl.getUniformLocation(prog, n);
  }

  const data = buildCloud();
  const total = data.length / 8;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16);
  gl.bindVertexArray(null);

  return {
    // draws additively into whatever framebuffer is bound
    draw(s, time, w, h) {
      if (s.alive <= 0.01) return;
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uAspect, w / h);
      gl.uniform2f(U.uCenter, s.x, s.y);
      gl.uniform1f(U.uScale, s.scale);
      gl.uniform1f(U.uStretch, s.stretch);
      gl.uniform1f(U.uAngle, s.angle);
      gl.uniform1f(U.uInvert, s.invert);
      gl.uniform1f(U.uAlive, s.alive);
      gl.uniform1f(U.uSink, s.sink);
      gl.uniform2f(U.uSinkPos, s.sinkX, s.sinkY);
      gl.uniform2f(U.uPalmA, s.palmAx, s.palmAy);
      gl.uniform2f(U.uPalmB, s.palmBx, s.palmBy);
      gl.uniform1f(U.uTime, time);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      const n = s.thread > 0.5 ? total : total - THREAD_PTS;
      gl.drawArrays(gl.POINTS, 0, n);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(null);
    },
    dispose() {
      gl.deleteProgram(prog);
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(buf);
    },
  };
}
