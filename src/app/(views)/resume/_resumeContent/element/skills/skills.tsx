import Image from 'next/image'
import { WechatFilled, MailFilled } from '@ant-design/icons'
import './skills.scss'

/**
 * 没钱买正版插件难受啊
 * @returns
 */
const Skills = () => {
  // const skillsList = [
  //   'React', 'Vue', 'Es6', 'Webpack', 'Vite', 'Canvas', 'Three.js', 'Docker', 'GLSL', 'Next', 'Nuxt', 'Babel…'
  // ]
  return (
    <div className='skills pt-16 pb-5 xs:px-1 md:px-10'>
      <div className='skills_wrap rounded-lg xs:w-full md:w-[60%] py-3 px-5'>
        <div className='personal_info flex h-28'>
          <div className='personal_info_l_wrap w-28 flex justify-center items-center'>

            <Image className='img_wrap rounded-[100%] h-20 w-20 bg-contain' width={120} height={120} src='/images/space.jpg' alt='' />

          </div>
          <div className='personal_info_r_wrap px-3 flex-1 flex flex-col justify-around items-start xs:text-sm sm:text-base py-4'>
            <div className='info_item'>
              <span className='xs:mr-1 md:mr-4'>
                <WechatFilled />
              </span>
              <span>
                15219267088
              </span>
            </div>
            <div className='info_item'>
              <span className='xs:mr-1 md:mr-4'>
                <MailFilled />
              </span>
              <span>
                eudemonia_c@foxmail.com
              </span>
            </div>
          </div>
        </div>
        <div className='chat_box skills_text_1 px-10 ' />
        <div className='chat_box skills_question_1 px-10  ' />
        <div className='chat_box skills_text_2 px-10  ' />
        <div className='chat_box skills_question_2 px-10  ' />
        <div className='chat_box skills_text_3 px-10  ' />
      </div>
    </div>
  )
}

export default Skills
