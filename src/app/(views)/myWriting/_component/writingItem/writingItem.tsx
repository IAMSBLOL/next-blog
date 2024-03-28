'use client'
import { useEffect } from 'react'
import styles from './writingItem.module.scss'
import Link from 'next/link'
const WritingItem = (props:any) => {
  const { data } = props
  useEffect(() => {
    console.log('456')
  }, [])
  return (
    <Link href={'/mdx' + data.path} target='_blank'>
      <div className={styles.writingItem}>
        {props.data.title}
      </div>
    </Link>

  )
}

export default WritingItem
