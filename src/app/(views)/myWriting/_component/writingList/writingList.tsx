import WritingItem from '../writingItem'
const WritingList = () => {
  return (
    <div className=' grid xl:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 md:gap-5 xs:gap-5 px-4'>
      {
        [1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          return (
            <WritingItem key={i} />
          )
        })
      }
    </div>
  )
}

export default WritingList
