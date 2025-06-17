'use client'
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import Spinner from "../../ui/custom-spinner";

export default function MassHousingFPV() {
  const { scene: scene1 } = useGLTF("/masshousing/masshousing.gltf");
  
  const modelRef1 = useRef<RefObject<unknown> | null>(null);

  useEffect(() => {
    if (!scene1 || !modelRef1.current) return;

    scene1.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const edges = new THREE.EdgesGeometry(child.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
          color: 0x000000,
          linewidth: 2,
        });
        const lineSegments = new THREE.LineSegments(edges, edgesMaterial);
        child.add(lineSegments);
      }
    });
  }, [scene1]);

 
 
  return (
    <Suspense fallback={<Spinner/>}>

      <RigidBody type="fixed" colliders="trimesh">
        <primitive
          object={scene1}
          ref={modelRef1}
          position={[-65, 0.1, 35]}
          scale={[0.01, 0.01, 0.01]}
        />
      </RigidBody>
    </Suspense>
      
  );
}
