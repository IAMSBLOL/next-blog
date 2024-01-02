varying vec3 vColor;
varying vec2 vUv;

void main() {
    // // Disc
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = step(0.5, strength);
    // strength = 1.0 - strength;

    // // Diffuse point
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength *= 2.0;
    // strength = 1.0 - strength;

    // Light point
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    // strength = pow(strength, 4.0);

    // Final color

    vec3 color = mix(vec3(0.1), vColor, strength);

    gl_FragColor = vec4(color, 1.0);
}