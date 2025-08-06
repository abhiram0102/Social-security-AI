import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

type CyberMapProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export function CyberMap({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1 
}: CyberMapProps) {
  const mapRef = useRef<THREE.Group>(null);
  
  // Generate random nodes and connections
  const { nodes, connections } = useMemo(() => {
    const mapNodes = [];
    const mapConnections = [];
    const nodeCount = 25;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 4;
      const nodeName = `Node-${i.toString().padStart(2, '0')}`;
      const nodeType = Math.random() > 0.7 ? 'server' : 'client';
      const nodeStatus = Math.random() > 0.2 ? 'online' : 'offline';
      
      mapNodes.push({
        position: [x, y, 0],
        name: nodeName,
        type: nodeType,
        status: nodeStatus,
        size: nodeType === 'server' ? 0.15 : 0.08,
        color: nodeStatus === 'online' 
          ? (nodeType === 'server' ? '#ff00ff' : '#00ffff') 
          : '#555555'
      });
    }
    
    // Create connections between nodes
    for (let i = 0; i < nodeCount; i++) {
      const connections = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < connections; j++) {
        const targetIdx = Math.floor(Math.random() * nodeCount);
        if (targetIdx !== i) {
          const status = Math.random() > 0.15 ? 'active' : 'inactive';
          mapConnections.push({
            from: i,
            to: targetIdx,
            status,
            width: status === 'active' ? 0.02 : 0.01,
            color: status === 'active' ? '#00ffff' : '#333333'
          });
        }
      }
    }
    
    return { nodes: mapNodes, connections: mapConnections };
  }, []);

  // Animation loop
  useFrame(({ clock }) => {
    if (!mapRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Slightly rotate the map
    mapRef.current.rotation.z = Math.sin(time * 0.2) * 0.05;
    
    // Animate nodes and connections
    mapRef.current.children.forEach((child, index) => {
      if (child.type === 'Mesh' && index < nodes.length) {
        // Pulsate nodes
        const node = nodes[index];
        if (node.status === 'online') {
          child.scale.setScalar(1 + Math.sin(time * 2 + index) * 0.2);
        }
      }
    });
  });

  return (
    <group 
      ref={mapRef} 
      position={new THREE.Vector3(...position)} 
      rotation={new THREE.Euler(...rotation)} 
      scale={scale}
    >
      {/* Map grid */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial color="#111122" transparent opacity={0.5} />
      </mesh>
      
      {/* Grid lines */}
      {Array.from({ length: 11 }).map((_, i) => {
        const pos = i - 5;
        return (
          <group key={`grid-${i}`}>
            {/* Horizontal line */}
            <mesh position={[0, pos, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 0.01]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
            </mesh>
            
            {/* Vertical line */}
            <mesh position={[pos, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.01, 5]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
            </mesh>
          </group>
        );
      })}
      
      {/* Connections between nodes */}
      {connections.map((connection, index) => {
        const fromNode = nodes[connection.from];
        const toNode = nodes[connection.to];
        
        if (!fromNode || !toNode) return null;
        
        // Calculate connection line
        const from = new THREE.Vector3(...fromNode.position);
        const to = new THREE.Vector3(...toNode.position);
        const direction = to.clone().sub(from).normalize();
        const distance = from.distanceTo(to);
        const center = from.clone().add(to).multiplyScalar(0.5);
        
        return (
          <group key={`connection-${index}`} position={center}>
            <mesh 
              rotation={[0, 0, Math.atan2(direction.y, direction.x)]}
              position={[0, 0, 0.005]}
            >
              <planeGeometry args={[distance, connection.width]} />
              <meshBasicMaterial 
                color={connection.color} 
                transparent 
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Animated pulse along active connections */}
            {connection.status === 'active' && (
              <mesh
                rotation={[0, 0, Math.atan2(direction.y, direction.x)]}
                position={[0, 0, 0.006]}
              >
                <planeGeometry args={[0.1, 0.04]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
      
      {/* Nodes */}
      {nodes.map((node, index) => (
        <group key={`node-${index}`} position={new THREE.Vector3(...node.position)}>
          {/* Node circle */}
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[node.size, 32]} />
            <meshBasicMaterial color={node.color} />
          </mesh>
          
          {/* Node glow */}
          <mesh position={[0, 0, 0.008]}>
            <circleGeometry args={[node.size * 1.5, 32]} />
            <meshBasicMaterial 
              color={node.color} 
              transparent 
              opacity={0.3} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          {/* Node label for servers */}
          {node.type === 'server' && (
            <Text
              position={[0, -node.size * 2, 0.02]}
              fontSize={0.1}
              color={node.status === 'online' ? '#ffffff' : '#777777'}
              anchorX="center"
              anchorY="top"
            >
              {node.name}
            </Text>
          )}
        </group>
      ))}
      
      {/* Map title */}
      <Text
        position={[-2.3, 2.3, 0.05]}
        fontSize={0.2}
        color="#00ffff"
        anchorX="left"
        anchorY="top"
        fontWeight="bold"
      >
        NETWORK MAP
      </Text>
    </group>
  );
}
