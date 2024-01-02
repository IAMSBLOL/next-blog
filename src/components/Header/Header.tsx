'use client'
import React, { useEffect } from 'react';
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { GithubOutlined, ZhihuOutlined } from '@ant-design/icons'
import TranfomerSvg from '@/assets/icons/tranfomer.svg'
import styles from './Header.module.scss'

const Welcome = () => {
  useEffect(() => {
    gsap.registerPlugin(TextPlugin)
    const tl = gsap.timeline();
    tl.to('.logo_title', { text: 'The Martrix', duration: 1 });

    tl.to('.tranfomerSvg path', { fill: 'red', duration: 2 });
  }, [])
  return (

    <div className={`${styles.Header} h-12 flex items-center justify-between px-10 w-full pt-1`}>
      <div className='flex items-center justify-between'>
        <TranfomerSvg className='tranfomerSvg' />
        <p className='logo_title pl-4 text-xl' />
      </div>
      <div className='flex items-center justify-between'>
        <a href='https://github.com/IAMSBLOL/resume' className='pr-4' target='_blank' rel='noreferrer'><GithubOutlined /></a>
        <a href='https://www.zhihu.com/people/zhong-guo-meng-77/posts' target='_blank' rel='noreferrer'><ZhihuOutlined /></a>

      </div>
    </div>
  )
};

export default Welcome;
