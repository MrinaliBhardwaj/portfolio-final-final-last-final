/* eslint-disable react/no-unknown-property */
// A draggable 3D lanyard — rope physics (rapier) + a meshline band + the GLB
// card, from the standalone `lanyard` project (see its HANDOVER.md). Vendored
// here rather than rebuilt: the physics tuning and the sizing math are the
// artifact.
//
// Two changes from the source, both deliberate:
//   · assets load from /public by string path instead of being imported, so
//     vite needs no `assetsInclude` rule for .glb (HANDOVER §5)
//   · `frameloop` is driven from outside, so the caller can freeze the whole
//     simulation when the badge isn't on screen — this runs on the tech world
//     permanently and her machine is slow
//
// The integration contract is unchanged: `cardFront` is any React node, mounted
// on the card's FRONT FACE via drei <Html transform occlude> inside the card's
// RigidBody, so it swings/drags/flips with the card. Sizing math: the face is
// 1.6 x 2.25 world units, and drei maps px -> world as px * distanceFactor/400,
// so the 320x450 overlay at distanceFactor 2 gives 320*2/400 = 1.6. Don't
// change one number without the other.
import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, Environment, Lightformer, Html } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import "./lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

const CARD_GLB = "/lanyard/card.glb";
const BAND_TEX = "/lanyard/lanyard.png";

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  cardFront = null,
  frameloop = "always",
}) {
  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{
          alpha: transparent,
          antialias: false,
          // dev only: lets a frozen frame be read back with toDataURL. A hidden
          // tab fires no rAF, so the scene can only be verified by stepping it
          // by hand (window.__lanyard.advance) and reading the buffer — same
          // problem, same fix as the pond's __pond.snap().
          preserveDrawingBuffer: import.meta.env.DEV,
        }}
        onCreated={(state) => {
          state.gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
          if (import.meta.env.DEV) window.__lanyard = state;
        }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band cardFront={cardFront} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, cardFront = null }) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const cardMesh = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };
  const { nodes, materials } = useGLTF(CARD_GLB);
  const texture = useTexture(BAND_TEX);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  // ---- pointer passthrough ----
  // The canvas is a tall box in the editor's right gutter, and a <canvas>
  // swallows every click inside its box — which would silently kill the
  // CodeLens links that scroll underneath it (measured: 9 of them at 1440px).
  // So the canvas is pointer-events:none by DEFAULT, and each frame we project
  // the card to screen space and switch it back to `auto` only while the
  // cursor is actually over the card. By the time a pointerdown arrives the
  // canvas is already live, so drag/fling work untouched; everywhere else in
  // the gutter, clicks fall straight through to the buffer.
  const { gl, camera, size } = useThree();
  const mouse = useRef({ x: -1e4, y: -1e4 });
  const rect = useRef(null);
  const ndc = useRef([new THREE.Vector3(), new THREE.Vector3()]);

  useEffect(() => {
    const el = gl.domElement;
    const measure = () => {
      rect.current = el.getBoundingClientRect();
    };
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    measure();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", measure);
      el.style.pointerEvents = "none";
    };
    // `size` is in the deps on purpose: R3F sizes the canvas AFTER this
    // component mounts, so measuring only once would cache the pre-layout box
    // and the hit test would miss the card entirely.
  }, [gl, size]);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });

      // is the cursor over the card? project its centre and one corner (the
      // collider's 0.8 x 1.125 half-extents) and compare in screen px
      const box = rect.current;
      if (box) {
        const t = card.current.translation();
        const [mid, corner] = ndc.current;
        mid.set(t.x, t.y, t.z).project(camera);
        corner.set(t.x + 0.8, t.y + 1.125, t.z).project(camera);
        const halfW = Math.abs(corner.x - mid.x) * 0.5 * box.width;
        const halfH = Math.abs(corner.y - mid.y) * 0.5 * box.height;
        const cx = box.left + (mid.x * 0.5 + 0.5) * box.width;
        const cy = box.top + (-mid.y * 0.5 + 0.5) * box.height;
        const over =
          !!dragged ||
          (Math.abs(mouse.current.x - cx) <= halfW &&
            Math.abs(mouse.current.y - cy) <= halfH);
        const want = over ? "auto" : "none";
        if (gl.domElement.style.pointerEvents !== want) {
          gl.domElement.style.pointerEvents = want;
        }
      }
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      {/* the anchor sits ABOVE the top of frame, so the band runs off the top
          edge — the badge reads as hooked over the chrome, not floating */}
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh ref={cardMesh} geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
          {cardFront && (
            <group position={[0, 0, 0.04]}>
              <Html
                transform
                distanceFactor={2}
                occlude={[cardMesh]}
                wrapperClass="card-front-html"
                style={{ pointerEvents: "none" }}
              >
                <div style={{ width: 320, height: 450, pointerEvents: "none" }}>{cardFront}</div>
              </Html>
            </group>
          )}
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_GLB);
