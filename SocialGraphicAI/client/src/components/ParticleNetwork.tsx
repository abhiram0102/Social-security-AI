import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

type ParticleNetworkProps = {
  count?: number;
  size?: number;
  connectionRadius?: number;
  color?: string;
};

export function ParticleNetwork({
  count = 200,
  size = 0.03,
  connectionRadius = 2,
  color = "#00ffff"
}: ParticleNetworkProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const linesMeshRef = useRef<THREE.LineSegments>(null);
  
  // Generate particles
  const particles = useMemo(() => {
    const particlePositions = new Float32Array(count * 3);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
      
      velocities.push({
        x: Math.random() * 0.01 - 0.005,
        y: Math.random() * 0.01 - 0.005,
        z: Math.random() * 0.01 - 0.005
      });
    }
    
    return { positions: particlePositions, velocities };
  }, [count]);
  
  // Prepare geometry
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
    return geometry;
  }, [particles]);
  
  // Custom shader material for particles
  const particleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
  }, [color, size]);
  
  // Prepare line geometry for connections
  const linesGeometry = useMemo(() => {
    // Create a placeholder for line vertices
    const maxConnections = count * 5;  // Assume max 5 connections per particle
    const positions = new Float32Array(maxConnections * 6);  // 2 points per line, 3 coordinates per point
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count]);
  
  // Material for connection lines
  const linesMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
  }, [color]);
  
  // Animation loop
  useFrame(() => {
    if (!particlesRef.current || !linesMeshRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    // Update particle positions based on velocity
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i].x;
      positions[i * 3 + 1] += particles.velocities[i].y;
      positions[i * 3 + 2] += particles.velocities[i].z;
      
      // Boundary check & bounce
      if (Math.abs(positions[i * 3]) > 15) particles.velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 15) particles.velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 15) particles.velocities[i].z *= -1;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Create connections between nearby particles
    const linesPositions = linesMeshRef.current.geometry.attributes.position.array as Float32Array;
    let connectionCount = 0;
    
    for (let i = 0; i < count; i++) {
      const x1 = positions[i * 3];
      const y1 = positions[i * 3 + 1];
      const z1 = positions[i * 3 + 2];
      
      for (let j = i + 1; j < count; j++) {
        const x2 = positions[j * 3];
        const y2 = positions[j * 3 + 1];
        const z2 = positions[j * 3 + 2];
        
        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) +
          Math.pow(y2 - y1, 2) +
          Math.pow(z2 - z1, 2)
        );
        
        if (distance < connectionRadius && connectionCount < count * 5) {
          // Set vertices for this line
          linesPositions[connectionCount * 6] = x1;
          linesPositions[connectionCount * 6 + 1] = y1;
          linesPositions[connectionCount * 6 + 2] = z1;
          linesPositions[connectionCount * 6 + 3] = x2;
          linesPositions[connectionCount * 6 + 4] = y2;
          linesPositions[connectionCount * 6 + 5] = z2;
          
          connectionCount++;
        }
      }
    }
    
    // Update line count
    linesMeshRef.current.geometry.setDrawRange(0, connectionCount * 2);
    linesMeshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Particles */}
      <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />
      
      {/* Connection lines */}
      <lineSegments ref={linesMeshRef} geometry={linesGeometry} material={linesMaterial} />
    </group>
  );
}
