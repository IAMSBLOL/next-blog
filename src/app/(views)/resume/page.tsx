import Header from '@/components/Header'
import ResumeContent from './_resumeContent'

const Resume = () => {
  return (
    <div>
      <Header />
      <div className=' container m-auto max-w-7xl'>
        <ResumeContent />
      </div>
    </div>
  )
}

export default Resume
