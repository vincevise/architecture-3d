'use client'
import { RigidBody } from "@react-three/rapier";
const World = () => {
  return (
    <>
      <RigidBody type="fixed" friction={0} restitution={0}>
         

        {/**Floor */}
        <mesh>
          <boxGeometry args={[50, 0.1, 50]} />
          <meshStandardMaterial color="gray" />
        </mesh>
        {/*************** */}

        
      </RigidBody>
    </>
  );
};

export default World;
