/** ThreeHero — the onboarding 3D showpiece (expo-gl + three.js).
 * Twin extruded brand chevrons in navy with turquoise edges, orbited by
 * proof-blocks (cube, ring, streak dot) under studio lighting. Transparent
 * canvas so the tactile tile behind shows through.
 * Safety-first for demo day: any GL failure calls onFail and the parent
 * falls back to the flat OnboardingArt. Reduced-motion renders one frame. */
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';
import { Brand } from '../constants/colors';
import { useReduceMotion } from '../lib/useReduceMotion';

const hex = (c: string) => parseInt(c.replace('#', ''), 16);

function chevronShape(): THREE.Shape {
  // Chevron band pointing right, ~70x70 units, centered near origin.
  const s = new THREE.Shape();
  s.moveTo(-25, -35);
  s.lineTo(15, 0);
  s.lineTo(-25, 35);
  s.lineTo(-25, 23);
  s.lineTo(3, 0);
  s.lineTo(-25, -23);
  s.closePath();
  return s;
}

export function ThreeHero({ height = 240, onFail }: { height?: number; onFail?: () => void }) {
  const reduce = useReduceMotion();
  const handlerRef = useRef<((gl: ExpoWebGLRenderingContext) => void) | null>(null);
  const cancelsRef = useRef(new Set<() => void>());
  const failRef = useRef(onFail);
  failRef.current = onFail;
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  useEffect(() => {
    const cancels = cancelsRef.current;
    handlerRef.current = (gl: ExpoWebGLRenderingContext) => {
      let renderer: THREE.WebGLRenderer | null = null;
      let raf = 0;
      let cancelled = false;
      const disposables: Array<{ dispose: () => void }> = [];

      const fail = (e: unknown) => {
        console.warn('[ThreeHero] GL unavailable, falling back:', e);
        try {
          failRef.current?.();
        } catch {}
      };

      try {
        renderer = new THREE.WebGLRenderer({
          context: gl as unknown as WebGLRenderingContext,
          alpha: true,
          antialias: true,
        });
      } catch (e) {
        fail(e);
        return;
      }

      try {
        const w = gl.drawingBufferWidth;
        const h = gl.drawingBufferHeight;
        renderer.setSize(w, h);
        const SRGB = (THREE as unknown as { SRGBColorSpace?: THREE.ColorSpace }).SRGBColorSpace;
        if (SRGB) renderer.outputColorSpace = SRGB;
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
        camera.position.set(0, 0.6, 9);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.HemisphereLight(hex('#E6FFFA'), hex(Brand.navy), 1.1));
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(4, 6, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(hex(Brand.turquoise), 0.9);
        rim.position.set(-5, -2, -4);
        scene.add(rim);

        const hero = new THREE.Group();
        scene.add(hero);

        const navy = new THREE.MeshStandardMaterial({ color: hex(Brand.navy), roughness: 0.45, metalness: 0.15 });
        const turq = new THREE.MeshStandardMaterial({ color: hex(Brand.turquoise), roughness: 0.35, metalness: 0.2 });
        const aqua = new THREE.MeshStandardMaterial({ color: hex(Brand.aqua), roughness: 0.4, metalness: 0.1 });
        const amber = new THREE.MeshStandardMaterial({ color: hex(Brand.amberDot), roughness: 0.4, metalness: 0.1 });
        disposables.push(navy, turq, aqua, amber);

        const shape = chevronShape();
        const extrude = { depth: 0.9, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 2 };
        const geoA = new THREE.ExtrudeGeometry(shape, extrude);
        const geoB = new THREE.ExtrudeGeometry(shape, extrude);
        geoA.center();
        geoB.center();
        disposables.push(geoA, geoB);

        const chevA = new THREE.Mesh(geoA, navy);
        chevA.scale.setScalar(0.045);
        chevA.position.x = -0.85;
        const edgeA = new THREE.LineSegments(
          new THREE.EdgesGeometry(geoA, 30),
          new THREE.LineBasicMaterial({ color: hex(Brand.turquoise) })
        );
        edgeA.scale.copy(chevA.scale);
        edgeA.position.copy(chevA.position);
        disposables.push(edgeA.geometry, edgeA.material);

        const chevB = new THREE.Mesh(geoB, turq);
        chevB.scale.setScalar(0.045);
        chevB.position.x = 0.85;
        const edgeB = new THREE.LineSegments(
          new THREE.EdgesGeometry(geoB, 30),
          new THREE.LineBasicMaterial({ color: hex(Brand.navy) })
        );
        edgeB.scale.copy(chevB.scale);
        edgeB.position.copy(chevB.position);
        disposables.push(edgeB.geometry, edgeB.material);

        hero.add(chevA, edgeA, chevB, edgeB);
        hero.rotation.z = -0.12;

        const discGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.12, 48);
        const discMat = new THREE.MeshStandardMaterial({ color: hex(Brand.turquoise), roughness: 0.6 });
        const disc = new THREE.Mesh(discGeo, discMat);
        disc.position.y = -1.7;
        disposables.push(discGeo, discMat);
        scene.add(disc);

        const cubeGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
        const ringGeo = new THREE.TorusGeometry(0.34, 0.12, 16, 40);
        const dotGeo = new THREE.SphereGeometry(0.28, 24, 24);
        disposables.push(cubeGeo, ringGeo, dotGeo);
        const cube = new THREE.Mesh(cubeGeo, turq);
        const ring = new THREE.Mesh(ringGeo, aqua);
        const dot = new THREE.Mesh(dotGeo, amber);
        scene.add(cube, ring, dot);
        const orbiters = [
          { obj: cube, radius: 2.9, speed: 0.55, phase: 0, y: 0.5 },
          { obj: ring, radius: 3.2, speed: -0.4, phase: 2.1, y: -0.4 },
          { obj: dot, radius: 2.6, speed: 0.75, phase: 4.2, y: 1.2 },
        ];

        const clock = new THREE.Clock();
        const frame = () => {
          if (cancelled || !renderer) return;
          const t = clock.getElapsedTime();
          hero.rotation.y = Math.sin(t * 0.5) * 0.35;
          hero.position.y = Math.sin(t * 0.9) * 0.12;
          for (const o of orbiters) {
            const a = t * o.speed + o.phase;
            o.obj.position.set(
              Math.cos(a) * o.radius,
              o.y + Math.sin(t * 1.3 + o.phase) * 0.25,
              Math.sin(a) * o.radius * 0.6
            );
            o.obj.rotation.x = t * 0.8 + o.phase;
            o.obj.rotation.y = t * 1.1 + o.phase;
          }
          renderer.render(scene, camera);
          gl.endFrameEXP();
          if (!reduceRef.current) raf = requestAnimationFrame(frame);
        };
        frame();

        const cancel = () => {
          cancelled = true;
          cancelAnimationFrame(raf);
          for (const d of disposables) {
            try {
              d.dispose();
            } catch {}
          }
          try {
            renderer?.dispose();
          } catch {}
        };
        cancels.add(cancel);
      } catch (e) {
        fail(e);
      }
    };

    return () => {
      handlerRef.current = null;
      for (const c of cancels) {
        try {
          c();
        } catch {}
      }
      cancels.clear();
    };
  }, []);

  return (
    <View
      style={{
        height,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: Brand.cyanBg,
        borderWidth: 2,
        borderColor: Brand.navy,
        shadowColor: Brand.navy,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
      }}
    >
      <GLView
        style={{ flex: 1 }}
        onContextCreate={(gl) => handlerRef.current?.(gl)}
      />
    </View>
  );
}
