'use client'
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  TextureLoader

  //   MathUtils
} from 'three'

import { useEffect, useMemo, useRef } from 'react'

import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

const NotFound = (): JSX.Element => {
  const canvasIns = useRef<HTMLCanvasElement | null>(null)
  const glRender = useRef<THREE.WebGLRenderer | null>(null)
  const camera = useRef<THREE.PerspectiveCamera>(new PerspectiveCamera(
    90,
    16 / 9,
    1,
    1800
  ))

  const scene = useRef<THREE.Scene>(new Scene())

  useEffect(() => {
    if (canvasIns.current) {
      console.log('不hi吧')
      const size = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      glRender.current = new WebGLRenderer({
        antialias: true,
        canvas: canvasIns.current,

        alpha: true
      });
      camera.current.position.z = 2;
      glRender.current.setPixelRatio(window.devicePixelRatio)

      glRender.current.setSize(size.width, size.height)

      const renderCvs = () => {
        glRender.current?.render(scene.current, camera.current)
      }

      scene.current.background = new TextureLoader().load('/bg.png')

      const composer = new EffectComposer(glRender.current);
      composer.setSize(size.width, size.height)
      // const firstpersion = new (Three as any).FirstPersonControls()
      const renderPass = new RenderPass(scene.current, camera.current);
      composer.addPass(renderPass);

      const glitchPass = new GlitchPass(1);
      composer.addPass(glitchPass);

      const rendera = () => {
        renderCvs()
        composer.render();
        requestAnimationFrame(rendera)
      }
      rendera()
    }
  }, [])
  return (
    <div>
      <div className='NotFound_wrap'>
        {
          useMemo(() => <canvas ref={canvasIns} className='canvas' />, [])
        }
        <div className='sorry_text'>
          <p>抱歉，未适配移动端尺寸</p>
          <p>请用非IE浏览器打开</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
