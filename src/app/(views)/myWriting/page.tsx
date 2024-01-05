import Header from '@/components/Header'
import WritingList from './_component/writingList'
import styles from './myWriting.module.scss'
import './page.css'
const MyWriting = () => {
  return (
    <div className={styles.myWriting}>
      <Header />
      <div className=' md:container md:m-auto pt-16'>
        <WritingList />
      </div>
    </div>
  )
}

export default MyWriting
