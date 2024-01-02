import type { Metadata } from 'next'

import { ConfigProvider } from 'antd';
import theme from '@/src/theme/themeConfig';
import './globals.css'
export const metadata: Metadata = {
  title: 'The Matrix',
  description: '欢迎来到矩阵',
}

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConfigProvider theme={theme}>{children}</ConfigProvider>
  )
}
