import { extend, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Euler, Mesh, Vector3 } from 'three';

// Extend THREE.LineBasicMaterial so it can be used declaratively
extend({ LineBasicMaterial: THREE.LineBasicMaterial });

export type GeometryType = 'torus' | 'cube' | 'sphere';

interface ShapeProps {
  initialPosition: Vector3;
  initialRotation: Euler;
  initialScale: Vector3;
  geometryType: GeometryType;
  color: string;
}

export default function Shape({ initialPosition, initialRotation, initialScale, geometryType, color }: ShapeProps) {
  const meshRef = useRef<Mesh>(null!);

  const geometry = useMemo<THREE.BufferGeometry>(() => {
    switch (geometryType) {
      case 'torus': return new THREE.TorusGeometry(0.3, 0.2, 20, 45);
      case 'cube': return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
      default: return new THREE.SphereGeometry(0.5);
    }
  }, [geometryType]);

  useFrame(() => {
    if (meshRef.current && (geometryType === 'torus' || geometryType === 'cube')) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef} position={initialPosition} rotation={initialRotation} scale={initialScale}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="black" toneMapped={false} />
      </lineSegments>
    </group>
  );
}
