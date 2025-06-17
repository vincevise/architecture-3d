'use client'
import { KeyboardControls, OrbitControls, PointerLockControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useState, type ReactNode } from "react";
import Button from "../../ui/Button";
import World from "./World";
import FPScontrols from "./FPDControls";

type Props = {
    children:ReactNode;
    showToggleFPV?:boolean;
    camera_position?: [number, number, number];
}

export default function BasicScene({children, showToggleFPV, camera_position = [-7, 22, -15],}: Props) {
  const [isFPV, setIsFPV] = useState(false);

  return (
    <div className="w-screen h-screen bg-white">
        {showToggleFPV && 
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>

                <Button 
                variant="outline"
                onClick={() => setIsFPV(!isFPV)}
                //   style={{
                //     padding: '8px 16px',
                //     background: '#4CAF50',
                //     color: 'white',
                //     border: 'none',
                //     borderRadius: '4px',
                //     cursor: 'pointer'
                //   }}
                >
                {isFPV ? 'Switch to Orbit View' : 'Switch to FPV'}
                </Button>
            </div>
        }
      <Canvas className="w-full h-full" camera={{ position: camera_position,  }} flat shadows dpr={[1, 2]}>
        <Physics gravity={[0, -40, 0]}>
          <World />
          {showToggleFPV ? 
            <>
            {isFPV ? (
              <KeyboardControls
                map={[
                  { name: "forwardKeyPressed", keys: ["ArrowUp", "KeyW"] },
                  { name: "rightKeyPressed", keys: ["ArrowRight", "KeyD"] },
                  { name: "backwardKeyPressed", keys: ["ArrowDown", "KeyS"] },
                  { name: "leftKeyPressed", keys: ["ArrowLeft", "KeyA"] },
                  { name: "jumpKeyPressed", keys: ["Space"] }
                ]}
              >
                <FPScontrols />
              </KeyboardControls>
            ) : (
              <OrbitControls />
            )}
            </>
            : 
              <OrbitControls />


          }
          {children}
        </Physics>
        <ambientLight intensity={3} />
        <directionalLight intensity={1} position={[2, 7, 7]} />
        <directionalLight  intensity={0.5} position={[-2, -7, -3]} />
        {isFPV && <PointerLockControls />}
      </Canvas>
    </div>
  );
}
