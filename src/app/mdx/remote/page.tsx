import { MDXRemote } from 'next-mdx-remote/rsc'

export default async function RemoteMdxPage () {
  // MDX text - can be from a local file, database, CMS, fetch, anywhere...
  try {
    const result = await fetch('http://localhost:3000/test.mdx')
    const markdown = await result.text()
    return <MDXRemote source={markdown} />
  } catch {
    return null
  }
}
