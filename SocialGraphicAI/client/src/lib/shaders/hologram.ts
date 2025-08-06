export const hologramShader = {
  uniforms: {
    "tDiffuse": { value: null },    // The rendered scene
    "time": { value: 0.0 },         // Animation time
    "scanlineIntensity": { value: 0.05 }, // Intensity of scanlines
    "scanlineCount": { value: 1024.0 },   // Number of scanlines
    "scanlineSpeed": { value: 5.0 },      // Speed of scanline animation
    "noiseIntensity": { value: 0.02 },    // Intensity of the noise
    "distortion": { value: 0.1 },         // Wave distortion
    "color": { value: [0.0, 1.0, 1.0] },  // Hologram color
    "fresnelPower": { value: 2.0 },       // Fresnel effect power
    "rimStrength": { value: 0.5 }         // Rim lighting strength
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vec4 modelViewPosition = viewMatrix * worldPosition;
      vViewDir = -normalize(modelViewPosition.xyz);
      
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float scanlineIntensity;
    uniform float scanlineCount;
    uniform float scanlineSpeed;
    uniform float noiseIntensity;
    uniform float distortion;
    uniform vec3 color;
    uniform float fresnelPower;
    uniform float rimStrength;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    
    // Random noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      // Calculate fresnel effect (rim lighting)
      float fresnel = pow(1.0 - dot(vNormal, vViewDir), fresnelPower);
      
      // Add time-dependent wave distortion
      vec2 waveUV = vUv;
      float wave = snoise(vec2(waveUV.x * 10.0, waveUV.y * 10.0 + time * 0.5)) * distortion;
      waveUV.x += wave;
      waveUV.y += wave;
      
      // Get texture with distorted UVs
      vec4 texColor = texture2D(tDiffuse, waveUV);
      
      // Create flickering effect
      float flicker = 0.95 + 0.05 * sin(time * 10.0);
      
      // Create animated scanlines
      float scanline = sin(vUv.y * scanlineCount - time * scanlineSpeed) * scanlineIntensity;
      
      // Create noise effect
      float noise = random(vUv + time * 0.01) * noiseIntensity;
      
      // Create horizontal lines (data streams)
      float line = abs(fract(vUv.y * 100.0 + time * 0.1) - 0.5);
      float lines = smoothstep(0.49, 0.0, line) * 0.2;
      
      // Combine effects
      vec3 hologramColor = texColor.rgb * color * flicker;
      hologramColor -= scanline;
      hologramColor += noise;
      hologramColor += lines;
      
      // Add rim effect
      hologramColor += color * fresnel * rimStrength;
      
      // Adjust alpha based on original texture and fresnel
      float alpha = texColor.a * (0.7 + fresnel * 0.3);
      
      gl_FragColor = vec4(hologramColor, alpha);
    }
  `
};
