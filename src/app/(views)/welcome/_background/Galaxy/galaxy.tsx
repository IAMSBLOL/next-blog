'use client'
import { useEffect, useRef } from 'react';

import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  DirectionalLight,
  SRGBColorSpace,
  // Texture
} from 'three'
import { throttle } from 'lodash'
import { useGetWindowInfo } from '@/utils/index'

// import { useScrollTrigger } from './hooks/useScrollTrigger'
import { initLine } from './hooks/useInitLine'

import './galaxy.scss'

type Props = {
  height: number,
  // setInit: React.Dispatch<React.SetStateAction<boolean>>,
  // init: boolean
}

// 初始化一个加载器
// const loader = new TextureLoader();

// const getTexture = (path: string): Promise<Texture> => new Promise(function (resolve, reject) {
//   // 加载一个资源
//   loader.load(
//     // 资源URL
//     path,

//     // onLoad回调
//     function (texture) {
//       // in this example we create the material when the texture is loaded
//       texture.colorSpace = SRGBColorSpace
//       resolve(texture)
//     },

//     // 目前暂不支持onProgress的回调
//     undefined,

//     // onError回调
//     function (err) {
//       console.error('An error happened.', err);
//       reject(err)
//     }
//   );
// })

const WorkingTimeline = (props: Props): JSX.Element => {
  const { height: scrollTotal } = props

  // const dispatch = useDispatch()
  const canvasIns = useRef<HTMLCanvasElement | null>(null)
  const glRender = useRef<THREE.WebGLRenderer | null>(null)

  const camera = useRef<THREE.PerspectiveCamera|null>()

  const scene = useRef<THREE.Scene>(new Scene())

  const currentY = useRef(0)

  const { width, height } = useGetWindowInfo()

  // const bgImg = useRef<Texture|null>(null)
  // const spaceImg = useRef<Texture | null>(null)

  // 加载资源
  // useEffect(() => {
  //   // const start = async () => {
  //   //   await Promise.allSettled([
  //   //     new Promise(function (resolve) {
  //   //       const getTextureFn = async () => {
  //   //         bgImg.current = await getTexture('/images/bg815.png')
  //   //         spaceImg.current = await getTexture('/images/space.jpg')
  //   //       }
  //   //       const fn = async () => {
  //   //         await getTextureFn()
  //   //         resolve(true)
  //   //       }
  //   //       fn()
  //   //     }),
  //   //     new Promise(function (resolve) {
  //   //       const timerFn = setTimeout(() => {
  //   //         clearTimeout(timerFn)
  //   //         resolve(true)
  //   //       }, 2500);
  //   //     }),

  //   //   ])

  //   //   setInit(true)
  //   // }
  //   // start()
  //   const timerFn = setTimeout(() => {
  //     clearTimeout(timerFn)
  //     setInit(true)
  //   }, 100);
  // }, [setInit])

  // useScrollTrigger(scrollTotal)
  useEffect(() => {
    // if (!init) {
    //   return
    // }
    if (width === 0) {
      return
    }
    if (canvasIns.current) {
      console.log(window.devicePixelRatio)
      const { parent, tube } = initLine()
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
      const bgImg = new TextureLoader().load('/images/bg815.jpg')

      bgImg.colorSpace = SRGBColorSpace
      scene.current.background = bgImg
      const linght = new DirectionalLight(0xffffff, Math.PI * 0)
      scene.current.add(linght)

      const scrollPosition = (scrollAmount: number) => {
        // https:// codepen.io/Lighty/pen/GRqxvZV

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
      };
      scrollPosition(0)
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

  useEffect(() => {
    // if (!init) {
    //   return
    // }
    if (scrollTotal === 0 || width === 0) {
      return
    }
    // scrollPosition(0);

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

    // window.addEventListener('scroll', () => {
    //   console.log(120)
    //   const scroll_y = window.scrollY / scrollTotal;
    //   scrollPosition(scroll_y);
    // });
  }, [scrollTotal, width, height])
  return (
    <div className='galaxy'>
      <canvas ref={canvasIns} className='canvas' />

    </div>
  )
}

export default WorkingTimeline
