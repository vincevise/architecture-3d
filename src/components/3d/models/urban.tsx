/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Props = {
    width?:number;
    height?:number;
}

const UrbansemScene = ({width, height}:Props) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if(!window) return
    if (!canvasRef.current) return;
    
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
    camera.position.set(26, 10, 20);
    scene.add(camera);
    
    // Add origin axis
    const axisHelper = new THREE.AxesHelper(5);
    scene.add(axisHelper);
    
    // Loader
    const gltfLoader = new GLTFLoader();
    
    // Store all meshes that should have outlines
    const outlinedObjects = [];
    
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
      
      // Add wireframe as a sibling, not a child
      // mesh.parent.add(wireframe);
      
      // Copy the mesh's transformation
      wireframe.position.copy(mesh.position);
      wireframe.rotation.copy(mesh.rotation);
      wireframe.scale.copy(mesh.scale);
      
      // If the mesh moves, the outline should follow
      mesh.updateMatrix();
      wireframe.matrix.copy(mesh.matrix);
    }
    
    // Model loading function
    function loadModel(path: string, position: THREE.Vector3Like) {
      gltfLoader.load(
        path,
        (gltf) => {
          gltf.scene.traverse((child:any) => {
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
          gltf.scene.rotation.y = Math.PI; // Rotate the model 180 degrees
          scene.add(gltf.scene);
          
          // Now that the model is added to the scene, add outlines
          gltf.scene.traverse((child:any) => {
            if (child.isMesh) {
              addOutlineToMesh(child);
            }
          });
        }
      );
    }
    
    // Load the model
    loadModel('/3d/urban/urbansem.gltf', new THREE.Vector3(-10, -5, -5));
    
    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.5
      })
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.set(0, -6, 0);
    scene.add(floor);
    
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
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    
    controls.addEventListener('change', () => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      console.log(`Camera position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
      console.log(`Camera direction: x=${direction.x}, y=${direction.y}, z=${direction.z}`);
    });
    
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
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      
      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      
      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    
    if (typeof window !== "undefined") {
      // Safe to use window here
      window.addEventListener('resize', handleResize);
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
        // Safe to use window here
        window.removeEventListener('resize', handleResize);
      }
      renderer.dispose();
      
      // Dispose of scene resources
      scene.traverse((object:any) => {
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
  
  return <canvas ref={canvasRef} className="w-full h-full threejs-canvas" />;
};

export default UrbansemScene;