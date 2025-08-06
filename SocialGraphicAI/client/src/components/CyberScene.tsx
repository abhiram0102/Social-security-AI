import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";

// Professional Network Visualization Component
function NetworkGrid() {
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.InstancedMesh>(null);
  const connectionCount = 40;
  const nodeCount = 30;
  
  // Generate stable node positions (only once)
  const [nodePositions] = useState(() => {
    return Array.from({ length: nodeCount }, () => [
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 30
    ]);
  });
  
  // Animate nodes and connections
  useFrame(({ clock }) => {
    if (!nodesRef.current || !linesRef.current) return;
    
    const time = clock.getElapsedTime();
    const matrix = new THREE.Matrix4();
    const tempObj = new THREE.Object3D();
    
    // Update network nodes
    for (let i = 0; i < nodeCount; i++) {
      const [baseX, baseY, baseZ] = nodePositions[i];
      
      // Small position adjustments for subtle animation
      const x = baseX + Math.sin(time * 0.1 + i * 0.3) * 0.3;
      const y = baseY + Math.cos(time * 0.1 + i * 0.2) * 0.3;
      const z = baseZ + Math.sin(time * 0.05 + i * 0.5) * 0.3;
      
      tempObj.position.set(x, y, z);
      tempObj.updateMatrix();
      nodesRef.current.setMatrixAt(i, tempObj.matrix);
    }
    nodesRef.current.instanceMatrix.needsUpdate = true;
    
    // Create dynamic connections between nodes
    for (let i = 0; i < connectionCount; i++) {
      const index1 = Math.floor((time * 0.1 + i * 0.3) % nodeCount);
      const index2 = Math.floor((time * 0.05 + i * 0.7 + nodeCount * 0.5) % nodeCount);
      
      if (index1 === index2) continue;
      
      const [x1, y1, z1] = nodePositions[index1];
      const [x2, y2, z2] = nodePositions[index2];
      
      // Calculate connection properties
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      
      // Only connect nearby nodes
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (distance > 25) continue;
      
      // Create "data packet" that travels along the connection
      const progress = (time * 0.3 + i * 0.2) % 1; // 0 to 1
      const packetX = x1 + dx * progress;
      const packetY = y1 + dy * progress;
      const packetZ = z1 + dz * progress;
      
      // Position the data packet
      tempObj.position.set(packetX, packetY, packetZ);
      tempObj.scale.set(0.1, 0.1, 0.1); 
      tempObj.updateMatrix();
      linesRef.current.setMatrixAt(i, tempObj.matrix);
    }
    linesRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <group>
      {/* Network nodes */}
      <instancedMesh 
        ref={nodesRef} 
        args={[undefined, undefined, nodeCount]}
      >
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#105090" transparent opacity={0.7} />
      </instancedMesh>
      
      {/* Data packets */}
      <instancedMesh 
        ref={linesRef} 
        args={[undefined, undefined, connectionCount]}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#50a0ff" transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}

// Digital grid floor
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshBasicMaterial 
        color="#103050" 
        wireframe 
        transparent 
        opacity={0.15} 
      />
    </mesh>
  );
}

// Subtle data visualization elements
function DataSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!sphereRef.current) return;
    
    const time = clock.getElapsedTime();
    sphereRef.current.rotation.y = time * 0.1;
    sphereRef.current.rotation.z = time * 0.05;
  });
  
  return (
    <group position={[0, 0, -15]}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial 
          color="#001030" 
          wireframe 
          transparent 
          opacity={0.1} 
        />
      </mesh>
    </group>
  );
}

export function CyberScene() {
  const controlsRef = useRef(null);
  
  return (
    <>
      {/* Subtle ambient lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.2} 
        castShadow
      />
      
      {/* Professional looking background */}
      <Stars radius={100} depth={50} count={500} factor={2} saturation={0.5} fade speed={0.5} />
      
      {/* Network data visualization */}
      <NetworkGrid />
      
      {/* Subtle grid floor for depth */}
      <GridFloor />
      
      {/* Background data sphere */}
      <DataSphere />
      
      {/* Subtle camera controls */}
      <OrbitControls 
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.1}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minDistance={8}
        maxDistance={30}
      />
    </>
  );
}
