import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Euler, Vector3 } from 'three';
import type { GeometryType } from './shape';
import Shape from './shape';

// Shape data structure
interface GeneratedShape {
  id: number;
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  geometryType: GeometryType;
}

interface SceneContentProps {
  shapeCount: number;
  allowedShapes: GeometryType[];
  shapeColor: string;
}

export default function SceneContent({ shapeCount, allowedShapes, shapeColor }: SceneContentProps) {

  const shapes = useMemo<GeneratedShape[]>(() => {
    const generated: GeneratedShape[] = [];
    const minDistanceFromCamera = 2;

    for (let i = 0; i < shapeCount; i++) {
      const geometryType = allowedShapes[Math.floor(Math.random() * allowedShapes.length)];
      if (!geometryType) continue;

      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      if (position.length() < minDistanceFromCamera) {
        position.normalize().multiplyScalar(minDistanceFromCamera + Math.random() * 5);
      }

      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scaleVal = Math.random();
      const scale = new THREE.Vector3(scaleVal, scaleVal, scaleVal);

      generated.push({ id: i, position, rotation, scale, geometryType });
    }

    return generated;
  }, [shapeCount, allowedShapes]);

  return (
    <>
      <perspectiveCamera position={[1, 1, 3]} fov={75} near={0.1} far={100} />
      <OrbitControls enableDamping />
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          initialPosition={shape.position}
          initialRotation={shape.rotation}
          initialScale={shape.scale}
          geometryType={shape.geometryType}
          color={shapeColor}
        />
      ))}
    </>
  );
}
