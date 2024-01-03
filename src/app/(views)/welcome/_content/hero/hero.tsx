// import gsap from 'gsap'
// import { useEffect } from 'react'
// import { TextPlugin } from 'gsap/TextPlugin'
import './hero.css'

const Hero = () => {
  // useEffect(() => {
  //   gsap.registerPlugin(TextPlugin)
  //   const tl = gsap.timeline();

  //   tl.fromTo('.welcome-text', { opacity: 0 }, { text: '矩阵空间', duration: 1, opacity: 1 });
  // }, [])

  return (
    <div className='w-full h-full flex items-center justify-center absolute z-10 text-fuchsia-50'>
      <div className='flex-1 flex items-center justify-between flex-col'>
        <h1 className='welcome-text md:text-8xl sm:text-4xl'>矩阵空间</h1>
        <div className=' mb-40'>
          <p className=' text-xl tracking-widest'>
            Welcome to The Matrix
          </p>

        </div>
        <button className=''>
          <span className='text text-fuchsia-50 px-4 text-xl'>个人简历</span>
          <span className='shimmer' />
        </button>
      </div>
      <div className='flex-1 md:block @xs:hidden' />
    </div>
  )
}

export default Hero
