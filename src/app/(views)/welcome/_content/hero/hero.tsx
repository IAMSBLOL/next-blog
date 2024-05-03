// import gsap from 'gsap'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
// import { TextPlugin } from 'gsap/TextPlugin'
import './hero.css'

// type Props = {

//   init: boolean
// }

const Hero = () => {
  // const { init } = props
  // useEffect(() => {
  //   if (init) {
  //     gsap.registerPlugin(TextPlugin)
  //     const tl = gsap.timeline();

  //     tl.to('.btn-text', { text: '个人简历', duration: 1 });
  //   }
  // }, [init])
  const [init, setInit] = useState(false)

  useEffect(() => {
    const timerFunction = setTimeout(() => {
      clearTimeout(timerFunction)
      setInit(true)
    }, 1000)
  }, [])

  const MemoButton = useMemo(() => {
    if (init) {
      return (
        <Link href='/resume' target='_blank'>
          <button className='wel_button'>
            <span className='text text-fuchsia-50 px-4 text-base'>个人简历</span>
            <span className='shimmer' />
          </button>
        </Link>
      )
    }
    return (
      <button className='wel_button loading'>
        <span className='text text-fuchsia-50 px-4 text-xl'>资源加载中</span>
        <span className='shimmer' />
      </button>
    )
  }, [init])

  return (
    <div className='w-full h-full flex xs:items-start xs:p-20 sm:p-40 justify-center absolute z-10 text-gray-400'>
      <div className='flex-1 flex items-center justify-between flex-col pt-20'>
        <h1 className='welcome-text md:text-7xl xs:text-5xl whitespace-nowrap mb-4 font-semibold'>M78 星云</h1>
        <div className='mb-20'>
          <p className='xs:text-base md:text-2xl tracking-widest text-center'>
            Welcome to The Matrix
          </p>
          <div className='md:text-sm xs:text-xs mt-9 w-80 md:text-gray-400 xs:text-cyan-50'>
            天行健，君子以自强不息；地势坤，君子以厚德载物；随风巽，君子以申命行事；渐雷震，君子以恐惧修省；善如水，君子以作事谋始；火同人，君子以类族辨物；步泽履，君子以辨民安志；艮山谦，君子以裒多益寡。
          </div>
        </div>

        {
          MemoButton
        }
      </div>
      <div className='flex-1 xs:hidden md:block ' />
    </div>
  )
}

export default Hero
