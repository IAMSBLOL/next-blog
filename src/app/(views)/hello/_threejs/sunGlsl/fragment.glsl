uniform sampler2D sunTextrue;
uniform float time;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(sunTextrue, vUv);
    vec4 glow = vec4(0.0);

  // 根据需要调整辉光的亮度和颜色
    vec3 glowColor = vec3(1.0, 1.0, 0.0); // 辉光颜色为黄色
    float glowIntensity = 0.5; // 辉光强度

  // 计算辉光
    vec2 resolution = vec2(800.0, 600.0); // 屏幕分辨率
    float glowRadius = time; // 辉光半径

    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 delta = vec2(1.0 / resolution.x, 1.0 / resolution.y);

    for(int i = -5; i <= 5; i++) {
        for(int j = -5; j <= 5; j++) {
            vec2 offset = vec2(float(i), float(j)) * glowRadius;
            glow += texture2D(sunTextrue, uv + offset * delta);
        }
    }

    glow /= 121.0; // 计算平均辉光值
    glow *= glowIntensity * vec4(glowColor, 1.0);

    gl_FragColor = color + glow;
}