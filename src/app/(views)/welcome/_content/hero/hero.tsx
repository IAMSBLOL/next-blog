// import gsap from 'gsap'
import { useMemo } from 'react'
// import { TextPlugin } from 'gsap/TextPlugin'
import './hero.css'

type Props = {

  init: boolean
}

const Hero = (props: Props) => {
  const { init } = props
  // useEffect(() => {
  //   if (init) {
  //     gsap.registerPlugin(TextPlugin)
  //     const tl = gsap.timeline();

  //     tl.to('.btn-text', { text: '个人简历', duration: 1 });
  //   }
  // }, [init])

  const MemoBtn = useMemo(() => {
    if (init) {
      return (
        <button className=''>
          <span className='text text-fuchsia-50 px-4 text-xl'>个人简历</span>
          <span className='shimmer' />
        </button>
      )
    }
    return (
      <button className='loading'>
        <span className='text text-fuchsia-50 px-4 text-xl'>资源加载中</span>
        <span className='shimmer' />
      </button>
    )
  }, [init])

  return (
    <div className='w-full h-full flex xs:items-start xs:p-20 sm:items-center justify-center absolute z-10 text-fuchsia-50'>
      <div className='flex-1 flex items-center justify-between flex-col pt-20'>
        <h1 className='welcome-text md:text-8xl xs:text-6xl'>关山月</h1>
        <div className='xs:mb-20 sm:mb-40'>
          <p className='xs:text-base text-xl tracking-widest'>
            Welcome to The Matrix
          </p>

        </div>
        {
          MemoBtn
        }
      </div>
      <div className='flex-1 xs:hidden md:block ' />
    </div>
  )
}

export default Hero
