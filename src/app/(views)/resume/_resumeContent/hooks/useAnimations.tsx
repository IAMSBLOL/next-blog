import { useEffect } from 'react'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'

export const useAnimations = (setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>) => {
  useEffect(() => {
    const tl = gsap.timeline();
    gsap.registerPlugin(TextPlugin)
    /**
     * 印章出现，放大消失
     */
    // gsap.set('.digest_text_1', { opacity: 0 })
    // gsap.set('.digest_text_2', { opacity: 0 })
    tl.fromTo('.seal', { opacity: 0 }, { opacity: 1, duration: 2, ease: 'power2.out' })

    tl.to('.seal', {
      x: -100,
      opacity: 0,
      duration: 2,

      onComplete: () => {
        gsap.set('.seal', { display: 'none' })
      }
    })

    tl.to('.digest_text_1', { x: 0, duration: 1.5 }, '<15%')
    tl.to('.digest_text_2', { x: 0, duration: 1.5 }, '<')

    tl.to('.digest_text_1', { x: 1000, opacity: 0, duration: 1.5, delay: 1 })
    tl.to('.digest_text_2', { x: -1000, opacity: 0, duration: 1.5 }, '<')

    tl.to('.info_wrap', { y: 0, duration: 1, ease: 'elastic.out' }, '<')

    tl.to('.hardcover_front', { rotateY: -145, rotateZ: 0, duration: 0 })
    tl.to('.page_li_1', { rotateY: -30, duration: 1.5 }, '<')
    tl.to('.page_li_2', { rotateY: -35, duration: 1.8 }, '<')
    tl.to('.page_li_3', { rotateY: -118, duration: 1.6 }, '<')
    tl.to('.page_li_4', { rotateY: -130, duration: 1.4 }, '<')
    tl.to('.page_li_5', { rotateY: -140, duration: 1.2 }, '<')
    tl.to('.page_li_2', { duration: 1, text: '前端的自我修养' }, '<')
    tl.to('.book_wrap', {
      scale: 2,
      opacity: 0,
      duration: 1,
      onComplete: () => {
        gsap.set('.info_wrap', { })
      }
    })

    tl.to('.skills_wrap', { scale: 1, duration: 1 }, '<')
    // tl.to('.skill_list_item', { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, '<')

    tl.to('.skills_text_1', {
      text: '本人非常熟练React、Vue、Es6。熟悉Webpack、Vite、TypeScript、Docker、Canvas、Three.js、GLSL、Next、Nuxt、Babel、AST等等。熟悉工程化,有AI、物流、低代码、教育等等相关方向的开发经验。可独立完成项目,也有搭建团队经验。技术栈全方位适配前端市场。视野开阔，不拘一格，平易近人。稳健从容，心有惊雷面如平湖。文能提笔安天下，武可上马定乾坤。执行力一流，老板目光所至，末将兵锋即至……',
      duration: 7
    })
    tl.to('.skills_question_1', {
      text: '行了行了,吹得这么6,那你为何还在找工作? 啊?😯🤣🤣',
      duration: 2
    })
    tl.fromTo('.skills_question_1', {
      scale: 1.1
    }, {
      scale: 1
    }, '<')

    tl.to('.skills_text_2', {
      text: '力拔山兮气盖世，时不利兮骓不逝。此乃非吾之所愿也……',
      duration: 2
    })

    tl.to('.skills_question_2', {
      text: '说人话。😡',
      duration: 0.2
    })

    tl.to('.skills_text_3', {
      text: '公司倒闭，老板带着小姨子和我的血汗钱跑路了。😭😭😭',
      duration: 1,
      onComplete: () => {
        setIsModalOpen(true)
      }
    })
  }, [setIsModalOpen])
}
