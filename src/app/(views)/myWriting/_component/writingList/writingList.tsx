'use client'
import { useEffect } from 'react'
import WritingItem from '../writingItem'
import { WritingConfig } from '@/src/config/writing.list.config'
const WritingList = () => {
  useEffect(() => {
    console.log('123')
  }, [])
  return (
    <div className=' grid xl:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 md:gap-5 xs:gap-5 px-4'>
      {
        WritingConfig.map((o, i) => {
          return (
            <WritingItem key={i} data={o} />
          )
        })
      }
    </div>
  )
}

export default WritingList
