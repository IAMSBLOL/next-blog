'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react';
import { AdditiveBlending, Color } from 'three'
import { OrbitControls, useTexture } from '@react-three/drei'

import galaxyVertexShader from '../sunGlsl/vertex.glsl';
import galaxyFragmentShader from '../sunGlsl/fragment.glsl';

const SetCnavs = () => {
  const state = useThree()

  useEffect(() => {
    state.camera.lookAt(0, 0, -1)
    state.camera.position.set(0, 0, 5)
  }, [state])

  return null
}

const MeshCus = () => {
  const colorMap = useTexture('http://localhost:3000/sun.png')

  const uniforms = useRef({
    time: { value: 0.0 },
    amplitude: { value: 0.5 },
    intensity: { value: 2.0 },
    sunTextrue: { value: colorMap },
    glowIntensity: { value: 0.5 }, // 辉光强度
  })
  useFrame(() => {
    uniforms.current.time.value += 0.01
  })

  return (
    <mesh position={[0, 0, 0]}>

      <sphereGeometry args={[1, 128, 64]} />
      <shaderMaterial
        depthWrite={false}
        vertexColors
        blending={AdditiveBlending}
        vertexShader={galaxyVertexShader}
        fragmentShader={galaxyFragmentShader}
        uniforms={
          {
            ...uniforms.current
          }
        }
        transparent
      />
    </mesh>
  )
}

const HomePage = () => {
  return (
    <div className='absolute w-full h-full overflow-hidden'>

      <Canvas
        className='bg-transparent w-full h-full'
        gl={{ antialias: true }}
      >
        <SetCnavs />
        <ambientLight color={new Color('#FFF')} />

        <OrbitControls
          enableDamping
          enablePan
          enableRotate
          enableZoom
        />
        <MeshCus />
      </Canvas>
    </div>
  );
};

export default HomePage;
