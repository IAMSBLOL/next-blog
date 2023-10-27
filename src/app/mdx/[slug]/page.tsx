import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
// import type { DynamicOptionsLoadingProps } from 'next/dynamic'
import { getMarkdownsExist } from '@/app/api/blog/_markdown'

import styles from './slug.module.scss'

export default async function Home ({ params }: { params: { slug: string } }) {
  const test:any = await getMarkdownsExist(`${params.slug}.md`)

  if (!test) {
    return redirect('/404')
  }
  // 还是得node判断是否存在
  const DynamicMDX = dynamic(() => import(`./${params.slug}.md`), {
    loading: () => {
      return (
        <p>Loading</p>
      )
    },

  })

  return (
    <div className={`m-auto container ${styles['mdx-page-wrap']}`}>
      <DynamicMDX />

    </div>
  )
}
