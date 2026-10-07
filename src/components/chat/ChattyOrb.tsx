"use client";

import { useEffect, useRef, useState } from "react";

// Living 3D orb used as the launcher icon. three.js is loaded lazily so pages
// that never show the orb don't pay for it; a CSS gradient shows until then
// (and stays if WebGL is unavailable).

const VERT = `
  uniform float uTime; uniform float uAmp;
  varying vec3 vN; varying vec3 vPos; varying float vD;
  float n3(vec3 p){ return sin(p.x*1.7+uTime*0.9)*sin(p.y*1.9+uTime*1.13)*sin(p.z*1.5+uTime*0.71); }
  void main(){
    vec3 p = position;
    float d = n3(p*1.6)*0.55 + n3(p*3.2+1.3)*0.22;
    p += normal * d * uAmp;
    vD = d;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;

const FRAG = `
  uniform vec3 uA; uniform vec3 uB; uniform float uTime;
  varying vec3 vN; varying vec3 vPos; varying float vD;
  void main(){
    vec3 N = normalize(vN); vec3 V = normalize(-vPos);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    vec3 L = normalize(vec3(-0.5, 0.85, 0.6));
    float diff = max(dot(N, L), 0.0) * 0.55 + 0.45;
    float band = smoothstep(-0.5, 0.7, vD + N.y * 0.55 + sin(uTime*0.6 + N.x*2.0)*0.15);
    vec3 base = mix(uA * 0.62, uB, band);
    vec3 col = base * diff + fres * mix(uB, vec3(1.0), 0.55) * 1.15;
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 28.0) * 0.7;
    col += spec;
    gl_FragColor = vec4(col, 1.0);
  }`;

interface Props {
  color: string;
  color2: string;
  state?: "idle" | "thinking";
  speed?: number;
  style?: React.CSSProperties;
}

export function ChattyOrb({ color, color2, state = "idle", speed = 1, style }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const live = useRef({ color, color2, state, speed });
  const setColors = useRef<((a: string, b: string) => void) | null>(null);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    live.current = { color, color2, state, speed };
    setColors.current?.(color, color2);
  }, [color, color2, state, speed]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let alive = true;
    let raf = 0;
    let cleanup = () => {};

    import("three")
      .then((THREE) => {
        if (!alive) return;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        const cvs = renderer.domElement;
        cvs.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
        host.appendChild(cvs);
        setWebgl(true);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        camera.position.z = 4.3;
        const vec = (hex: string) => {
          const c = new THREE.Color(hex);
          return new THREE.Vector3(c.r, c.g, c.b);
        };
        const u = {
          uTime: { value: 0 },
          uAmp: { value: 0.16 },
          uA: { value: vec(live.current.color) },
          uB: { value: vec(live.current.color2) },
        };
        setColors.current = (a, b) => {
          u.uA.value = vec(a);
          u.uB.value = vec(b);
        };
        const geo = new THREE.IcosahedronGeometry(1, 40);
        const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        const resize = () => {
          const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(host);
        resize();

        let tx = 0, ty = 0;
        const onMove = (e: PointerEvent) => {
          const r = host.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width - 0.5) * 0.8;
          ty = ((e.clientY - r.top) / r.height - 0.5) * 0.8;
        };
        const onLeave = () => { tx = 0; ty = 0; };
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const t0 = performance.now();
        const tick = () => {
          if (!alive) return;
          const thinking = live.current.state === "thinking";
          const sp = live.current.speed * (thinking ? 2.4 : 1);
          u.uTime.value = ((performance.now() - t0) / 1000) * sp;
          u.uAmp.value += ((thinking ? 0.26 : 0.16) - u.uAmp.value) * 0.08;
          mesh.rotation.y += 0.004 * sp;
          mesh.rotation.x += (ty - mesh.rotation.x) * 0.05;
          mesh.rotation.z += (tx * 0.6 - mesh.rotation.z) * 0.05;
          renderer.render(scene, camera);
          if (!reduce) raf = requestAnimationFrame(tick);
        };
        tick();

        cleanup = () => {
          ro.disconnect();
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerleave", onLeave);
          geo.dispose();
          mat.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          cvs.remove();
          setColors.current = null;
        };
      })
      .catch(() => {});

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{
        position: "relative",
        display: "block",
        borderRadius: "50%",
        background: webgl ? "none" : `radial-gradient(circle at 35% 30%, #fff 0%, ${color} 38%, color-mix(in srgb, ${color} 60%, black) 100%)`,
        ...style,
      }}
    />
  );
}
