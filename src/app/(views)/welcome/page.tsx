'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  const [init, setInit] = useState(false)

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
    if (init) {
      tl.to('.Welcome-content', { backgroundColor: 'rgba(0, 0, 0, 0.7)', duration: 2 });
    } else {
      tl.to('.wait-p1', { text: '万里关山如咫尺', duration: 1 });
      tl.to('.wait-p2', { text: '女牀唯待凤归巢', duration: 1 });
      tl.to('.wait-p3', { text: '静候资源加载', duration: 0.5 });
    }
  }, [init])

  const HeroMemo = useMemo(() => {
    if (!init) {
      return (
        <div className='text-fuchsia-50 wait-tips-wrap md:text-6xl sm:text-lg'>
          <p className='wait-p1 w-5' />
          <p className='wait-p2 w-5' />
          <p className='wait-p3 w-5 text-2xl' />
        </div>
      )
    }
    return <Hero />
  }, [init])
  return (
    <>
      <Galaxy height={height} init={init} setInit={setInit} />
      <div className={`${styles.welcome} Welcome-content @container`} ref={divRef}>

        <Header />

        <div className='absolute w-full h-full md:left-64 sm:left-0'>
          <Space />
        </div>

        {
          HeroMemo
        }

      </div>
    </>

  )
};

export default Welcome;
