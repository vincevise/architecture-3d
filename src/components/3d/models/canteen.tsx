import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import Spinner from "../../ui/custom-spinner";

export default function CanteenFPV() {
  const { scene: scene1 } = useGLTF("/canteen/canteen_borders2.gltf");
  const { scene: scene2 } = useGLTF("/canteen/canteen_borders.gltf");
  
  const modelRef1 = useRef<RefObject<unknown> | null>(null);
  const modelRef2 = useRef<RefObject<unknown> | null>(null);

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

  useEffect(() => {
    // if (!scene2 || !modelRef2.current) return;

    scene2.traverse((child) => {
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
  }, [scene2]);
 
  return (
    <Suspense fallback={<Spinner/>}>

      <RigidBody type="fixed" colliders="trimesh">
        <primitive
          object={scene1}
          ref={modelRef1}
          position={[-15, 0.1, 15]}
          scale={[0.5, 0.5, 0.5]}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive
          object={scene2}
          ref={modelRef2}
          position={[-15, 0.1, 15]}
          scale={[0.5, 0.5, 0.5]}
        />
      </RigidBody>
    </Suspense>
  );
}
