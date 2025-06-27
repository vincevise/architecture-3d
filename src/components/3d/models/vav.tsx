'use client'
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

export default function VavFPV() {
  const { scene: scene1 } = useGLTF("/3d/vav/vav2.gltf");
  
  const modelRef1 = useRef<RefObject<unknown> | null>(null);

  useEffect(() => {
  if (!scene1 || !modelRef1.current) return;

  scene1.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry.clone();
      geometry.computeBoundingBox();

      const threshold = 1e-5;
      const edgesGeometry = new THREE.BufferGeometry();
      const positions: number[] = [];

      const edgeGeo = new THREE.EdgesGeometry(geometry);
      const edgePos = edgeGeo.getAttribute("position");

      for (let i = 0; i < edgePos.count; i += 2) {
        const a = new THREE.Vector3().fromBufferAttribute(edgePos, i);
        const b = new THREE.Vector3().fromBufferAttribute(edgePos, i + 1);
        const dir = new THREE.Vector3().subVectors(b, a).normalize();

        // Check if direction is axis-aligned (parallel to X, Y, or Z)
        const isX = Math.abs(Math.abs(dir.x) - 1) < threshold && Math.abs(dir.y) < threshold && Math.abs(dir.z) < threshold;
        const isY = Math.abs(Math.abs(dir.y) - 1) < threshold && Math.abs(dir.x) < threshold && Math.abs(dir.z) < threshold;
        const isZ = Math.abs(Math.abs(dir.z) - 1) < threshold && Math.abs(dir.x) < threshold && Math.abs(dir.y) < threshold;

        if (isX || isY || isZ) {
          positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }

      edgesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const lineSegments = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      child.add(lineSegments);
    }
  });
}, [scene1]);


 
 
  return (
      <RigidBody type="fixed" colliders="trimesh">
        <primitive
          object={scene1}
          ref={modelRef1}
          position={[0, 0.5, 15]}
          scale={[1, 1, 1]}
        />
      </RigidBody>
      
  );
}
