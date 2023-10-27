import type { Metadata } from 'next'
// import './globals.css'
import { ConfigProvider } from 'antd';
import theme from '../../theme/themeConfig';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
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
