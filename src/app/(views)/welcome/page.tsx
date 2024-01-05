'use client'
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header'
import Space from './_background/Space'
import Hero from './_content/hero'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import styles from './welcome.module.scss'

const Welcome = () => {
  const [height, setHeight] = useState(0)

  const divRef = useRef<HTMLDivElement | null>(null)

  // const [init, setInit] = useState(false)

  const Galaxy = dynamic(() => import('./_background/Galaxy'), {

    ssr: false

  });

  useEffect(() => {
    if (divRef.current) {
      const height = Number(divRef.current.offsetHeight)
      setHeight(height)
    }
  }, [])

  useEffect(() => {
    gsap.registerPlugin(TextPlugin)
    const tl = gsap.timeline();
    tl.to('.Welcome-content', { backgroundColor: 'rgba(0, 0, 0, 0.7)', duration: 2 });
  }, [])

  return (
    <>
      <Galaxy height={height} />
      <div className={`${styles.welcome} Welcome-content`} ref={divRef}>

        <Header />

        <div className='absolute w-full h-full lg:left-80 sm:left-0'>
          <Space />
        </div>

        <Hero />

      </div>
    </>

  )
};

export default Welcome;
