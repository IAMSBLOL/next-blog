'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { AdditiveBlending, Color } from 'three'
import { OrbitControls, useTexture } from '@react-three/drei'

import galaxyVertexShader from '../sunGlsl/vertex.glsl'
import galaxyFragmentShader from '../sunGlsl/fragment.glsl'

const SetCnavs = () => {
  const state = useThree()

  useEffect(() => {
    state.camera.lookAt(0, 0, -1)
    state.camera.position.set(0, 10, 5)
  }, [state])
}

const MeshCus = () => {
  const colorMap = useTexture('./sun.png')

  const uniforms = useRef({
    uTime: { value: 0 },
    amplitude: { value: 0.5 },
    intensity: { value: 2 },
    uTexture: { value: colorMap },
    glowIntensity: { value: 0.5 } // 辉光强度
  })
  useFrame(() => {
    uniforms.current.uTime.value += 0.01
  })

  return (
    <mesh position={[0, 0, 0]}>

      <sphereGeometry args={[2, 128, 64]} />
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
        <pointLight
          color={new Color('#23beff')} position={[0, 0, 5]} castShadow
          shadow-camera-far={10_000}
          shadow-camera-near={1}
          shadow-mapSize={2048}
        />

        <OrbitControls
          enableDamping
          enablePan
          enableRotate
          enableZoom
        />
        <MeshCus />
      </Canvas>
    </div>
  )
}

export default HomePage
