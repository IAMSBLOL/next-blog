import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import StyledJsxRegistry from '@/src/lib/registry';
import StyledComponentsRegistry from '@/src/lib/AntdRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};
const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <StyledJsxRegistry>{children}</StyledJsxRegistry>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

export default RootLayout
