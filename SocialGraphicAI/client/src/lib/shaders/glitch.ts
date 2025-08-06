export const glitchShader = {
  uniforms: {
    "tDiffuse": { value: null },     // Texture containing the scene
    "amount": { value: 0.0 },        // Glitch amount
    "time": { value: 0.0 },          // Animation time
    "seed": { value: 0.02 },         // Random seed
    "distortion": { value: 3.0 },    // RGB shift intensity
    "distortion_x": { value: 0.5 },  // Amount of horizontal distortion
    "distortion_y": { value: 0.6 },  // Amount of vertical distortion
    "col_s": { value: 0.05 }         // Color noise intensity
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float time;
    uniform float seed;
    uniform float distortion;
    uniform float distortion_x;
    uniform float distortion_y;
    uniform float col_s;
    
    varying vec2 vUv;
    
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      if (amount <= 0.0) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }
      
      // Get texel size
      vec2 p = vUv;
      
      float xs = floor(gl_FragCoord.x / 0.5);
      float ys = floor(gl_FragCoord.y / 0.5);
      
      // Get random offset values
      vec2 offset = vec2(0.0);
      float noise = rand(vec2(time * seed, time * seed)) * 2.0 - 1.0;
      
      // Only apply offset if current block is glitched
      if (rand(vec2(xs * ys, time * 0.001)) > 0.75) {
        offset.y = (0.1 + rand(vec2(time, time)) * 0.2) * amount * noise;
      }
      
      // RGB Split
      vec4 cr = texture2D(tDiffuse, p + vec2(distortion_x * amount * noise, 0.0));
      vec4 cga = texture2D(tDiffuse, p);
      vec4 cb = texture2D(tDiffuse, p - vec2(distortion_x * amount * noise, 0.0));
      
      // Add scan lines
      float scanline = sin(p.y * 300.0) * 0.04 * amount;
      cga -= scanline;
      
      // Add noise
      float x = (p.x + 4.0) * (p.y + 4.0) * (time * 10.0);
      vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * amount * 0.2;
      
      // Final color
      vec4 finalColor = vec4(cr.r, cga.g, cb.b, cga.a) + grain;
      
      // Horizontal lines
      if (rand(vec2(xs, time * seed * 0.01)) > 0.9 && amount > 0.0) {
        float line_noise = rand(vec2(time * 0.5, 0.0)) * amount * 0.5;
        
        // Add horizontal line blocks
        if (fract(gl_FragCoord.y * 0.1 + time) < 0.5 * amount) {
          finalColor.rgb = finalColor.gbr;
        }
      }
      
      // Add random color blocks
      if (rand(vec2(floor(p.x * 10.0) * 0.1, time)) > 0.9 && rand(vec2(time, 0.0)) > 0.9 && amount > 0.0) {
        p.x = rand(vec2(floor(p.x * 10.0) * 0.1, floor(time * 10.0) * 0.1));
        p.y = rand(vec2(floor(p.y * 40.0) * 0.04, floor(time * 10.0) * 0.1));
        float blockNoise = rand(vec2(p.x * 10.0, p.y * 10.0));
        
        if (blockNoise > 0.8) {
          finalColor.rgb = finalColor.bgr;
        }
      }
      
      gl_FragColor = finalColor;
    }
  `
};
