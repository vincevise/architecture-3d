import { Canvas } from '@react-three/fiber';
import { useEffect, type JSX } from 'react';
import * as THREE from 'three';




 

import { useState } from 'react';

import { GrEmptyCircle } from 'react-icons/gr';
import { TbCube, TbCube3dSphere, TbSphere } from 'react-icons/tb';
import SceneContent from './scene-content';
import type { GeometryType } from './shape';
import type { IconType } from 'react-icons';

export default function AestheticSceneR3F(): JSX.Element {
  const [shapeCount, setShapeCount] = useState(400);
  const [selectedShapes, setSelectedShapes] = useState<GeometryType[]>(['torus', 'cube', 'sphere']);
  const [color, setColor] = useState('#ffffff');
  const [pixelRatio, setPixelRatio] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }, []);

  const shapes:{
    value:GeometryType;
    icon: IconType,
    label:string
  }[] = [
    {
      value:'cube',
      icon: TbCube,
      label:'Cube'  
    },
    {
      value:'sphere',
      icon: TbSphere ,
      label:'Sphere'
    },
    {
      value:'torus',
      icon:GrEmptyCircle,
      label:'Torus'  
    }
  ]

  const toggleShape = (type: GeometryType) => {
    setSelectedShapes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="relative flex w-full h-screen bg-white">
      <div className="w-64 absolute left-2 top-2 p-4 bg-white border border-black space-y-4 h-fit z-20 rounded-lg">
        <div className='flex items-center gap-2'>
          <TbCube3dSphere className='w-6 h-6'/>
          {/* <h3 className='text-xl font-semibold uppercase'>Playground</h3> */}
        </div>
        <div className='border flex flex-col items-start rounded shadow bg-white p-3 space-y-2'>
          <div className='w-full flex items-center justify-between mb-1'>
            <label className="block text-sm text-gray-600  font-medium  w-fit">Number of Shapes</label>
            <div className="text-sm text-center">{shapeCount}</div>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            value={shapeCount}
            onChange={(e) => setShapeCount(Number(e.target.value))}
            className="w-full accent-black"
          />
          
        </div>

        <div className='border rounded shadow bg-white p-3 space-y-2'>
          <label className="block text-sm text-gray-600 font-medium mb-1">Shape Types</label>

          {shapes.map((shape) => (
            <div key={shape.value} className="p-4 border border-gray-200 shadow bg-white rounded flex items-center gap-4">
              
              <input
               className='w-4 h-4 rounded accent-black'
                type="checkbox"
                checked={selectedShapes.includes(shape.value)}
                onChange={() => toggleShape(shape.value)}
              />
              <div className='flex items-center gap-2'>

                <shape.icon className=''/>
                <span>{shape.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className='border rounded shadow bg-white p-3 space-y-2'>
          <label className="block text-sm text-gray-600 font-medium mb-1">Shape Color</label>
          <input className='w-full border border-gray-500 rounded' type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>

      {/* 3D Scene */}
      <div className="flex-1 overflow-hidden">
        <Canvas
          linear
          flat
          gl={{
            antialias: true,
          }}
          dpr={pixelRatio}
          onCreated={({ scene, gl }) => {
            scene.background = new THREE.Color(0xffffff);
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <SceneContent shapeCount={shapeCount} allowedShapes={selectedShapes} shapeColor={color} />
        </Canvas>
      </div>
    </div>
  );
}
