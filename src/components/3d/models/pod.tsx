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

const PodScene = ({ width, height }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window) return
    if (!canvasRef.current || !containerRef.current) return;

    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Sizes
    const sizes = {
      width: width ? width : window.innerWidth,
      height: height ? height : window.innerHeight
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);
    camera.position.set(35, 15, 30); // Zoomed out by increasing values
    scene.add(camera);

    // Add origin axis
    const axisHelper = new THREE.AxesHelper(5);
    scene.add(axisHelper);

    // Loader
    const gltfLoader = new GLTFLoader();

    // Store all meshes that should have outlines
    const outlinedObjects: any[] = [];

    // Shadow setup function
    function setShadowProperties(object: any) {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }

      if (object.children && object.children.length > 0) {
        for (const child of object.children) {
          setShadowProperties(child);
        }
      }
    }

    // Outline function
    function addOutlineToMesh(mesh: THREE.Mesh) {
      // Create wireframe edges
      const edges = new THREE.EdgesGeometry(mesh.geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 2
      });
      const wireframe = new THREE.LineSegments(edges, edgesMaterial);

      // Copy the mesh's transformation
      wireframe.position.copy(mesh.position);
      wireframe.rotation.copy(mesh.rotation);
      wireframe.scale.copy(mesh.scale);

      // If the mesh moves, the outline should follow
      mesh.updateMatrix();
      wireframe.matrix.copy(mesh.matrix);

      // We attach the outline directly to the mesh so it rotates with it!
      mesh.add(wireframe);
      // Reset position/rotation/scale on the wireframe since it is now a child
      wireframe.position.set(0, 0, 0);
      wireframe.rotation.set(0, 0, 0);
      wireframe.scale.set(1, 1, 1);
    }

    let modelGroup: THREE.Group | null = null;

    // Model loading function
    function loadModel(path: string, position: THREE.Vector3Like) {
      gltfLoader.load(
        path,
        (gltf) => {
          modelGroup = gltf.scene;

          gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.material.side = THREE.DoubleSide;

              // Add to objects that should have outlines
              outlinedObjects.push(child);
            }
          });

          gltf.scene.children.forEach(child => {
            setShadowProperties(child);
          });

          gltf.scene.position.copy(position);
          // Scale it down to decrease size
          gltf.scene.scale.set(0.1, 0.1, 0.1);
          // Initial rotation
          gltf.scene.rotation.y = Math.PI;
          scene.add(gltf.scene);

          // Now that the model is added to the scene, add outlines
          gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
              addOutlineToMesh(child);
            }
          });
        }
      );
    }

    // Load the model
    // Centered model instead of using (-10, -5, -5)
    loadModel('/pod/urbansem.gltf', new THREE.Vector3(0, 0, 0));



    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight: any = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(10, 20, 10);
    directionalLight.shadowCameraLeft = -3000;
    directionalLight.shadow.bias = -0.001;
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, containerRef.current);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    // Disable zoom so mouse wheel events can scroll the container
    controls.enableZoom = false;

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Handle window resize
    const handleResize = () => {
      // Update sizes
      sizes.width = containerRef.current?.clientWidth || window.innerWidth;
      sizes.height = containerRef.current?.clientHeight || window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    if (typeof window !== "undefined") {
      window.addEventListener('resize', handleResize);
    }

    // Scroll listener for rotation
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // Scroll value between 0 and 1
      const scrollFraction = target.scrollTop / (target.scrollHeight - target.clientHeight);

      if (modelGroup) {
        // Rotate the model on the Y axis from initial Math.PI based on scroll state
        // Multiply by Math.PI * 2 to give one full rotation per full scroll
        modelGroup.rotation.y = Math.PI + (scrollFraction * Math.PI * 2);
      }
    };

    const scroller = containerRef.current;
    if (scroller) {
      scroller.addEventListener('scroll', handleScroll);
    }

    // Animation loop
    const clock = new THREE.Clock();
    let previousTime = 0;
    const mixer: any = null;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      if (mixer) {
        mixer.update(deltaTime);
      }

      // Update controls
      controls.update();

      // Set clear color
      renderer.setClearColor(0x000000, 0);

      // Render scene
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    // Cleanup function
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('resize', handleResize);
      }
      if (scroller) {
        scroller.removeEventListener('scroll', handleScroll);
      }
      renderer.dispose();

      // Dispose of scene resources
      scene.traverse((object: any) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material: { dispose: () => any; }) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflowY: 'auto', // Enable vertical scrolling
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{ height: '300vh', width: '100%' }}>
        {/* Empty space to make it scrollable */}
      </div>
      <canvas
        ref={canvasRef}
        className="threejs-canvas"
        style={{
          position: 'fixed', // Fixed to stay visible while container scrolls
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none' // Let wheel events pass to container, wait! If none, OrbitControls won't work.
        }}
      />
      {/* We need orbit controls to work, so instead of pointEvents: none on canvas, 
          OrbitControls was instantiated with containerRef.current! 
          So mouse events on the container will be parsed by controls! */}
    </div>
  );
};

export default PodScene;
