

// Uniforms
uniform float uTime;
uniform sampler2D uTexture; 

// Varyings
varying vec2 vTexCoord;

// Parameters
#define NUM_GLOW 3
#define GLOW_POWER 1.5

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


void main() {
  // Texture coordinate
  vec2 texCoord = vTexCoord;

  // Distance to center 
  vec2 center = vec2(0.5,0.5);
  float dist = distance(texCoord, center);

  // Glow layers
  float brightness = 0.0;
  for(int i=0; i<NUM_GLOW; i++) {
    float glow = 1.0/(pow(dist,GLOW_POWER)*float(i+1));
    float angle = float(i) * uTime;
    glow = glow * cos(angle)*0.5 + 0.5;
    brightness += glow;
  }

  // Color & texture
  vec3 color = texture(uTexture, texCoord).rgb;
  color = mix(vec3(1.0), color, brightness);

  // Noise
  color += vec3(rand(texCoord * uTime));

  // Output
  gl_FragColor = vec4(color,1.0);
}