'use client'
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header'
import Space from './_background/Space'
import styles from './welcome.module.scss'

const Welcome = () => {
  const [height, setHeight] = useState(0)

  const divRef = useRef<HTMLDivElement | null>(null)

  const Galaxy = dynamic(() => import('./_background/Galaxy'), {

    ssr: false

  });

  useEffect(() => {
    if (divRef.current) {
      const height = Number(divRef.current.offsetHeight)
      setHeight(height)
    }
  }, [])
  return (
    <>
      <Galaxy height={height} />
      <div className={`${styles.welcome}`} ref={divRef}>

        <Header />

        <div className='absolute w-full h-full md:left-64 sm:left-0'>
          <Space />
        </div>
      </div>
    </>

  )
};

export default Welcome;
