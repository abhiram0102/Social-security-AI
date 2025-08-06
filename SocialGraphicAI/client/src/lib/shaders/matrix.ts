export const matrixShader = {
  uniforms: {
    "time": { value: 0.0 },
    "resolution": { value: [1.0, 1.0] },
    "color": { value: [0.0, 1.0, 0.5] }, // Default matrix green color
    "speed": { value: 1.0 },
    "density": { value: 1.0 },
    "brightness": { value: 0.8 }
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color;
    uniform float speed;
    uniform float density;
    uniform float brightness;
    
    varying vec2 vUv;
    
    // Random functions
    float random(float x) {
      return fract(sin(x * 12.9898) * 43758.5453);
    }
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Return 1 if a character should appear at given position and time
    float character(vec2 st, float time) {
      // Each "stream" has a different speed based on x position
      float streamSpeed = (0.5 + random(floor(st.x * 50.0)) * 0.5) * speed;
      
      // Calculate stream head position
      float streamY = fract(time * streamSpeed * 0.1 + random(floor(st.x * 50.0)) * 10.0);
      
      // Distance from stream head
      float distFromHead = abs(streamY - st.y);
      
      // Character only appears if close enough to head
      float characterVisibility = step(distFromHead, 0.4 + random(floor(st.x * 50.0)) * 0.2);
      
      // Characters change over time
      float charChange = floor(time * 5.0 * streamSpeed + random(floor(st.x * 50.0 + st.y * 40.0)) * 100.0);
      
      // Character glitch (random disappearance)
      float glitch = step(0.8, random(floor(st.x * 50.0 + st.y * 40.0) + floor(time * 2.0)));
      
      // Stream intensity falls off from head
      float intensity = 1.0 - smoothstep(0.0, 0.4, distFromHead);
      
      // Return final character visibility
      return characterVisibility * glitch * intensity;
    }
    
    // Cell function to create grid
    vec2 getCell(vec2 st, float size) {
      return floor(st * size) / size;
    }
    
    void main() {
      // Scale UVs for better aspect ratio
      vec2 st = vUv;
      st.y = 1.0 - st.y; // Flip Y so streams go downward
      
      // Grid size
      float size = 50.0 * density;
      
      // Create grid
      vec2 cell = getCell(st, size);
      
      // Add stream characters
      float charMatrix = character(st, time);
      
      // Vary brightness by distance from center
      float centerDist = length(vUv - 0.5) * 2.0;
      float vignette = 1.0 - centerDist * 0.5;
      
      // Add slight glow around character
      float glow = smoothstep(0.0, 0.1, charMatrix) * 0.5;
      
      // Final color
      vec3 finalColor = color * (charMatrix * brightness + glow) * vignette;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
