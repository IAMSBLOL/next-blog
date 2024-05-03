import Header from '@/components/Header'
import WritingList from './_component/writingList'
import styles from './myWriting.module.scss'
import './page.css'
import { useEffect, useState } from 'react'

const MyWriting = () => {
  const [a, set] = useState(0)

  useEffect(() => {
    console.log(a, set)
  }, [])

  return (
    <div className={styles.myWriting as never}>
      <Header

      />
      <div className=' md:container md:m-auto pt-16'>
        <WritingList />
      </div>
    </div>
  )
}

export default MyWriting
