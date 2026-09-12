import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThaliScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 5.4, 11.4);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = -0.05;
    scene.add(group);

    const brass = new THREE.MeshStandardMaterial({ color: 0xb78a4d, metalness: 0.72, roughness: 0.25 });
    const brassSoft = new THREE.MeshStandardMaterial({ color: 0xd3ae6c, metalness: 0.55, roughness: 0.3 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x5b2231, roughness: 0.45 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xf0dfbd, roughness: 0.65 });
    const green = new THREE.MeshStandardMaterial({ color: 0x496f55, roughness: 0.5 });
    const red = new THREE.MeshStandardMaterial({ color: 0x9c3d39, roughness: 0.5 });
    const riceMat = new THREE.MeshStandardMaterial({ color: 0xf6ebcf, roughness: 0.9 });

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(4.4, 64),
      new THREE.MeshBasicMaterial({ color: 0x2c1518, transparent: true, opacity: 0.22 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.7;
    shadow.scale.set(1, 0.48, 1);
    group.add(shadow);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(4.15, 3.9, 0.28, 96), brass);
    plate.castShadow = true;
    plate.receiveShadow = true;
    group.add(plate);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.75, 0.13, 16, 96), brassSoft);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.18;
    group.add(rim);

    const addBowl = (x: number, z: number, color: THREE.Material, size = 0.78) => {
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2), color);
      bowl.position.set(x, 0.32, z);
      bowl.scale.y = 0.52;
      bowl.castShadow = true;
      group.add(bowl);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(size * 0.82, 0.07, 12, 32), brassSoft);
      lip.rotation.x = Math.PI / 2;
      lip.position.set(x, 0.43, z);
      group.add(lip);
    };

    addBowl(-1.8, -1.55, dark, 0.73);
    addBowl(0, -1.85, red, 0.78);
    addBowl(1.82, -1.5, green, 0.73);
    addBowl(-2.28, 0.15, cream, 0.66);
    addBowl(2.26, 0.15, cream, 0.66);

    const rice = new THREE.Mesh(new THREE.SphereGeometry(1.08, 36, 18), riceMat);
    rice.position.set(0, 0.54, 0.28);
    rice.scale.set(1.12, 0.46, 0.86);
    rice.castShadow = true;
    group.add(rice);

    for (let i = 0; i < 11; i++) {
      const roti = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.08, 32), cream);
      const angle = i * 0.58 - 1.1;
      roti.position.set(Math.cos(angle) * 2.15, 0.46 + (i % 2) * 0.07, Math.sin(angle) * 1.38 + 0.45);
      roti.rotation.y = angle;
      roti.rotation.z = (i % 2 ? 0.08 : -0.06);
      roti.castShadow = true;
      group.add(roti);
    }

    const garnish = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), green);
    for (let i = 0; i < 8; i++) {
      const dot = garnish.clone();
      dot.position.set((i - 3.5) * 0.26, 0.93 + (i % 2) * 0.02, 0.26 + Math.sin(i) * 0.22);
      group.add(dot);
    }

    const ambient = new THREE.AmbientLight(0xf6ddbd, 1.7);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffe1b2, 3.2);
    key.position.set(-4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.PointLight(0x55a19a, 12, 16);
    fill.position.set(4, 3, -3);
    scene.add(fill);

    const resize = () => {
      const width = mount.clientWidth || 500;
      const height = mount.clientHeight || 500;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frame = 0;
    let targetY = 0;
    let scrollProgress = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.18;
    };
    const onScroll = () => {
      const rect = mount.getBoundingClientRect();
      scrollProgress = Math.max(-0.4, Math.min(1.2, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    };
    mount.addEventListener("pointermove", onPointerMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += (targetY + scrollProgress * 0.52 - group.rotation.y) * 0.025;
      group.rotation.x = -0.05 + scrollProgress * 0.12;
      group.position.y = Math.sin(Date.now() * 0.0013) * 0.09 + scrollProgress * 0.22;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="thali-canvas" aria-label="3D brass thali scene" role="img" />;
}
