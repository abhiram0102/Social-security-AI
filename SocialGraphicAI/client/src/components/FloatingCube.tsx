import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";

type FloatingCubeProps = {
  position: [number, number, number];
  size: number;
  rotationSpeed: number;
  color: string;
};

export function FloatingCube({ position, size, rotationSpeed, color }: FloatingCubeProps) {
  const cubeRef = useRef<THREE.Mesh>(null);
  
  // Generate a unique phase offset for animation
  const phaseOffset = useRef({
    x: Math.random() * Math.PI * 2,
    y: Math.random() * Math.PI * 2,
    z: Math.random() * Math.PI * 2,
    float: Math.random() * Math.PI * 2
  });
  
  // Animation loop
  useFrame(({ clock }) => {
    if (!cubeRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Rotate the cube
    cubeRef.current.rotation.x = time * rotationSpeed + phaseOffset.current.x;
    cubeRef.current.rotation.y = time * (rotationSpeed * 1.3) + phaseOffset.current.y;
    cubeRef.current.rotation.z = time * (rotationSpeed * 0.7) + phaseOffset.current.z;
    
    // Add a floating effect
    cubeRef.current.position.y = position[1] + Math.sin(time * 0.8 + phaseOffset.current.float) * 0.2;
  });

  return (
    <mesh ref={cubeRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      <MeshDistortMaterial
        color={color}
        speed={0.5}
        distort={0.2}
        envMapIntensity={0.8}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}
