uniform float uTime;

// 传给片元着色器的变量
varying vec2 vTexCoord;

float rand(vec2 co) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // 传递纹理坐标
	vTexCoord = uv;
	vec3 vPosition = vec3(position.x, position.y, position.z);
  // 设置模型视图投影转换后的位置 
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);
}