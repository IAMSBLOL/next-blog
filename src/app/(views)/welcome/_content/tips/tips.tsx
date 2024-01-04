// import gsap from 'gsap'
// import { useEffect } from 'react'
// import { TextPlugin } from 'gsap/TextPlugin'

const Hero = () => {
  // useEffect(() => {
  //   gsap.registerPlugin(TextPlugin)
  //   const tl = gsap.timeline();

  //   tl.fromTo('.welcome-text', { opacity: 0 }, { text: '矩阵空间', duration: 1, opacity: 1 });
  // }, [])

  return (
    <div className='text-fuchsia-50 md:text-3xl sm:text-lg'>
      <div className='wait-p1' />
      <div className='wait-p2' />
    </div>
  )
}

export default Hero
