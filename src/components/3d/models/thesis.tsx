/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Props = {
  width?: number;
  height?: number;
}

const ThesisScene = ({ width, height }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window) return;
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    const sizes = {
      width: width ? width : window.innerWidth,
      height: height ? height : window.innerHeight
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000000);
    camera.position.set(100, 100, 100);
    scene.add(camera);

    const axisHelper = new THREE.AxesHelper(10);
    scene.add(axisHelper);

    // Initial Controls Setup
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Loader for GLB
    const loader = new GLTFLoader();

    loader.load('/thesis/thesis.glb', (gltf) => {
      const model = gltf.scene;

      // 1. Calculate the bounding box of the original model
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      console.log('Model Size:', size);
      console.log('Model Center:', center);

      // 2. Normalize the model scale
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 50 / maxDim;
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // 3. Rotate to fix vertical alignment (Z-up to Y-up)
      model.rotation.x = -Math.PI / 2;

      // 4. Position the model correctly after rotation
      // Since it's rotated, we adjust based on the original center
      model.position.x = -center.x * scaleFactor;
      // After rotation on X, Y becomes Z and Z becomes -Y
      model.position.y = center.z * scaleFactor;
      model.position.z = -center.y * scaleFactor;

      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = new THREE.MeshStandardMaterial({
            color: '#c0c0c0',
            metalness: 0.2,
            roughness: 0.4,
          });
        }
      });
      
      // 4. Set camera at a predictable distance for a 50-unit model
      camera.position.set(60, 40, 60);
      camera.lookAt(0, 0, 0);
      
      controls.target.set(0, 0, 0);
      controls.update();

      scene.add(model);
    }, 
    (xhr) => {
      if (xhr.total > 0) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }
    },
    (error) => {
      console.error('Model loading error:', error);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    const handleResize = () => {
      if (!containerRef.current) return;
      sizes.width = containerRef.current.clientWidth;
      sizes.height = containerRef.current.clientHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((object: any) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m: any) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <canvas
        ref={canvasRef}
        className="threejs-canvas"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
};

export default ThesisScene;
