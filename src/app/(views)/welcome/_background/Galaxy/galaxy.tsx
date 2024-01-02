'use client'
import { useCallback, useEffect, useRef } from 'react';

import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  DirectionalLight,
  SRGBColorSpace
} from 'three'
import { throttle } from 'lodash'
import { useGetWindowInfo } from '@/utils/index'

// import { useScrollTrigger } from './hooks/useScrollTrigger'
import { initLine } from './hooks/useInitLine'

import './galaxy.scss'

type Props = {
  height: number,

}
const { parent, tube } = initLine()

const WorkingTimeline = (props: Props): JSX.Element => {
  const { height: scrollTotal } = props

  // const dispatch = useDispatch()
  const canvasIns = useRef<HTMLCanvasElement | null>(null)
  const glRender = useRef<THREE.WebGLRenderer | null>(null)

  const camera = useRef<THREE.PerspectiveCamera|null>()

  const scene = useRef<THREE.Scene>(new Scene())

  const currentY = useRef(0)

  const { width, height } = useGetWindowInfo()

  // useScrollTrigger(scrollTotal)
  useEffect(() => {
    if (width === 0) {
      return
    }
    if (canvasIns.current) {
      console.log(window.devicePixelRatio)
      camera.current = new PerspectiveCamera(
        90,
        width / height,
        0.01,
        1000
      )

      glRender.current = new WebGLRenderer({
        antialias: true,
        canvas: canvasIns.current,

        alpha: true,

      });

      glRender.current.setPixelRatio(window.devicePixelRatio)
      glRender.current.setSize(width, height)

      // glRender.current.useLegacyLights = true
      scene.current.add(parent)
      const bgImg = new TextureLoader().load('/images/bg815.png')
      bgImg.colorSpace = SRGBColorSpace
      scene.current.background = bgImg
      const linght = new DirectionalLight(0xffffff, Math.PI * 0)
      scene.current.add(linght)
      const renderCvs = () => {
        if (tube.material.map) {
          // console.log(tube.material.map.offset.y)
          tube.material.map.offset.x += 0.00005;
          tube.material.map.offset.y += 0.00005;
        }
        glRender.current?.render(scene.current, camera.current as PerspectiveCamera)
      }
      const rendera = () => {
        renderCvs()

        requestAnimationFrame(rendera)
      }
      rendera()
    }
  }, [width, height])

  const scrollPosition = useCallback(
    (scrollAmount: number) => {
      // https:// codepen.io/Lighty/pen/GRqxvZV
      console.log(84)
      const pos = tube.geometry.parameters.path.getPointAt(scrollAmount);
      const pos2 = tube.geometry.parameters.path.getPointAt(scrollAmount + 0.00001);
      // console.log(pos, 'pos')
      // console.log(pos2, 'pos2')
      currentY.current = scrollAmount

      if (camera.current) {
        camera.current.position.copy(pos);
        camera.current.lookAt(pos2);
        camera.current.updateProjectionMatrix();
      }
    }, []
  )

  useEffect(() => {
    if (scrollTotal === 0 || width === 0) {
      return
    }
    scrollPosition(0);

    const resizeFn = () => {
      // update sizes

      // update camera
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (camera.current) {
        camera.current.aspect = width / height;
        camera.current.updateProjectionMatrix();
      }

      // update renderer
      glRender.current?.setSize(width, height);
      glRender.current?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    const throttleResizeFn = throttle(resizeFn, 100)

    window.addEventListener('resize', throttleResizeFn);

    window.addEventListener('scroll', () => {
      console.log(120)
      const scroll_y = window.scrollY / scrollTotal;
      scrollPosition(scroll_y);
    });
  }, [scrollPosition, scrollTotal, width, height])
  return (
    <div className='galaxy'>
      <canvas ref={canvasIns} className='canvas' />

    </div>
  )
}

export default WorkingTimeline
