import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { gsap } from "gsap";

type GlobeProps = {
  position?: [number, number, number];
  scale?: number;
};

export function Globe({ position = [0, 0, 0], scale = 1 }: GlobeProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const markerGroupRef = useRef<THREE.Group>(null);

  // Generate connection points with precomputed positions
  const connectionPoints = useMemo(() => {
    const points = [];
    const count = 15; // Number of connection points
    
    for (let i = 0; i < count; i++) {
      // Generate points evenly distributed on a sphere using fibonacci sequence
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);
      
      const size = Math.random() * 0.03 + 0.01;
      const pulseSpeed = Math.random() * 2 + 1;
      const color = Math.random() > 0.7 ? "#ff00ff" : "#00ffff";
      
      points.push({ position: [x, y, z], size, color, pulseSpeed });
    }
    
    return points;
  }, []);

  // Generate connection lines between random points
  const connections = useMemo(() => {
    const lines = [];
    const numConnections = 10;
    
    for (let i = 0; i < numConnections; i++) {
      const point1 = connectionPoints[Math.floor(Math.random() * connectionPoints.length)];
      const point2 = connectionPoints[Math.floor(Math.random() * connectionPoints.length)];
      
      if (point1 !== point2) {
        lines.push({
          start: point1.position,
          end: point2.position,
          progress: 0,
          speed: Math.random() * 0.5 + 0.2,
          color: Math.random() > 0.5 ? "#00ffff" : "#ff00ff"
        });
      }
    }
    
    return lines;
  }, [connectionPoints]);

  // Animation loop
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Rotate globe
    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.1;
    }
    
    // Animate connection points
    if (markerGroupRef.current) {
      markerGroupRef.current.children.forEach((child, i) => {
        const point = connectionPoints[i];
        if (point) {
          // Pulse effect for points
          child.scale.setScalar(
            1 + 0.2 * Math.sin(time * point.pulseSpeed)
          );
        }
      });
    }
  });

  // Custom shader material for holographic effect
  const globeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color("#00ffff") },
        opacity: { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          // Grid pattern
          float gridSize = 20.0;
          vec2 grid = fract(vUv * gridSize);
          float gridLine = step(0.95, grid.x) + step(0.95, grid.y);
          
          // Fresnel effect for edge glow
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          
          // Pulsing glow
          float pulse = 0.5 + 0.5 * sin(time * 1.5);
          
          // Combine effects
          vec3 finalColor = mix(color, vec3(1.0), gridLine * 0.5);
          finalColor = mix(finalColor, vec3(1.0), fresnel * 0.7);
          
          // Apply opacity and pulse
          float finalOpacity = opacity + fresnel * 0.3 + pulse * 0.1;
          
          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }, []);

  // Update shader time uniform
  useFrame(({ clock }) => {
    if (globeMaterial.uniforms) {
      globeMaterial.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Holographic globe */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <primitive object={globeMaterial} attach="material" />
      </Sphere>
      
      {/* Connection points */}
      <group ref={markerGroupRef}>
        {connectionPoints.map((point, i) => (
          <mesh key={i} position={new THREE.Vector3(...point.position).multiplyScalar(1)}>
            <sphereGeometry args={[point.size, 16, 16]} />
            <meshBasicMaterial color={point.color} />
          </mesh>
        ))}
      </group>
      
      {/* Connection lines */}
      {connections.map((connection, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([
                ...connection.start,
                ...connection.end
              ])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={connection.color} linewidth={1} transparent opacity={0.7} />
        </line>
      ))}
      
      {/* Outer glow */}
      <Sphere args={[1.05, 32, 32]}>
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}
