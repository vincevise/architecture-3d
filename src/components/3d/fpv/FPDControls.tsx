'use client'
import { CapsuleCollider, RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

const SPEED = 10;
const JUMP_FORCE = 2;
const velocity = new THREE.Vector3();
const forwardDirectionVector = new THREE.Vector3();
const sidewaysDirectionVector = new THREE.Vector3();

const FPScontrols = () => {
  const [, getKeys] = useKeyboardControls();
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();

  useFrame((_, delta) => {
    //get input key values on every frame
    const {
      forwardKeyPressed,
      rightKeyPressed,
      backwardKeyPressed,
      leftKeyPressed,
      jumpKeyPressed
    } = getKeys();

    //check if ref has been linked to rigid body
    if (rigidBodyRef.current) {
      //get current position of rigid body (on every frame)
      const pos = rigidBodyRef.current.translation();

      //copy rigid body position to camera (on every frame)
      camera.position.copy(pos);

      //'front direction' takes true/false values from keyboard input
      //  and treats them as 1/0. When summed together you get a number
      //  on the z-axis telling you if you're going forward or backward.
      //Forward is in the -z direction
      forwardDirectionVector.set(0, 0, -Number(forwardKeyPressed) + Number(backwardKeyPressed));

      //same for x, left is in the -x direction
      sidewaysDirectionVector.set(Number(rightKeyPressed) - Number(leftKeyPressed), 0, 0);

      /**
       * VELOCITY SETUP
       */

      //combine forward & side directions into one vector
      //  (just for concise writing).Its the same same as
      //  doing { x: sideDir.x, y:0, z: forwardDir.z}
      velocity.addVectors(forwardDirectionVector, sidewaysDirectionVector);

      //force the combined vector to a magnitude of 1
      velocity.normalize();

      //give the combined vector a desired magnitude
      //i.e multiply direction by speed to get velocity
      velocity.multiplyScalar(SPEED);

      //account for different frame rates per user
      //'20' here is an arbitrary tuning value though
      velocity.multiplyScalar(delta * 20);

      //account for the pointerLock direction with some 'math'
      //  so that left,right etc are all relative to camera direction
      velocity.applyEuler(camera.rotation);
      //applying camera rotation to velocity can also be done with
      // velocity.applyQuaternion(camera.quaternion);

      //set the velicity of your capsule collider to the result velocity above
      rigidBodyRef.current.setLinvel(
        {
          x: velocity.x,
          y: jumpKeyPressed ? JUMP_FORCE : velocity.y * 0, // Apply jump force when space is pressed
          z: velocity.z
        },
        true // wakeUp
      );
    }
  });
  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        mass={10}
        friction={0}
        restitution={0}
        position={[0, 0.6, 0]}
        enabledRotations={[false, false, false]} //prevent from falling sideways
      >
        {/**for the capsule, args={[halfCapsuleHeight-radius, radius]} 
      think of (halfCapsuleHeight-radius) as the height of the straight vertical section only (cut in half)
      */}
        <CapsuleCollider args={[0.2, 0.20]} />
      </RigidBody>
    </>
  );
};

export default FPScontrols;
