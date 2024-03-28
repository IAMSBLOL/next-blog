'use client'
import React, { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger)

const ScrollMagic = () => {
  useEffect(() => {
    gsap.to('.section-2-content', {
      scrollTrigger: {
        trigger: '.section-2',
        end: 'bottom +=200px'
      },
      fontSize: 48,
      x: 500,
      duration: 2,
      opacity: 1
    })
  }, [])
  return (
    <div className=' h-[1000vh]'>
      123

      <div className='section-1 h-[400vh]'>
        <div className='section-1-content'>
          section-1
        </div>
      </div>
      <div className='section-2 h-[100vh]'>
        <div className='section-2-content w-[500px] opacity-0'>
          section-2
        </div>
      </div>
    </div>
  )
}

export default ScrollMagic
