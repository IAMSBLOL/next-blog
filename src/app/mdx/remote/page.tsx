import { MDXRemote } from 'next-mdx-remote/rsc'

export default async function RemoteMdxPage () {
  // MDX text - can be from a local file, database, CMS, fetch, anywhere...
  try {
    const res = await fetch('http://localhost:3000/test.mdx')
    const markdown = await res.text()
    return <MDXRemote source={markdown} />
  } catch (e) {
    return null
  }
}
