'use client'
import React, { useEffect } from 'react';
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { useRouter } from 'next/navigation'
import { GithubOutlined, ZhihuOutlined } from '@ant-design/icons'
import TranfomerSvg from '@/assets/icons/tranfomer.svg'
import styles from './Header.module.scss'
// import './Header.css'

const Welcome = () => {
  const router = useRouter()

  useEffect(() => {
    gsap.registerPlugin(TextPlugin)
    const tl = gsap.timeline();

    tl.to('.tranfomerSvg path', { fill: 'red', duration: 2 });
  }, [])

  const handlePushRouter = (path:string) => {
    router.push(path)
  }
  return (

    <div className={`${styles.Header} h-12 flex items-center justify-between xs:px-4 md:px-10  w-full pt-1`}>
      <div className='flex items-center justify-between cursor-pointer' onClick={() => handlePushRouter('/welcome')}>
        <TranfomerSvg className='tranfomerSvg' />
        <p className='logo_title pl-4 md:text-xl xs:text-sm' />
      </div>

      <div className='flex items-center justify-between'>
        <div className='grid grid-cols-2 grid-rows-1 mr-6 router-wrap text-sm md:text-base'>
          <h3 onClick={() => handlePushRouter('/myWriting')}>
            拙笔
          </h3>
          <h3 onClick={() => handlePushRouter('/resume')}>
            简历
          </h3>

        </div>
        <div className='flex items-center justify-between opacity-60'>
          <a href='https://github.com/IAMSBLOL/resume' className='pr-4' target='_blank' rel='noreferrer'><GithubOutlined /></a>
          <a href='https://www.zhihu.com/people/zhong-guo-meng-77/posts' target='_blank' rel='noreferrer'><ZhihuOutlined /></a>
        </div>

      </div>
    </div>
  )
};

export default Welcome;
