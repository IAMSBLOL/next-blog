import remarkGfm from 'remark-gfm';
import createMDX from '@next/mdx';
// import rehypeHighlight from 'rehype-highlight';
// import remarkFrontmatter from 'remark-frontmatter'; // YAML and such.
// import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

import withPlugins from 'next-compose-plugins';

import createWithBundleAnalyzer from '@next/bundle-analyzer';

import path from 'path'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withBundleAnalyzer = createWithBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  // openAnalyzer: true,
});

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrettyCode],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // distDir: 'build',
  reactStrictMode: false,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects () {
    return [
      {
        source: '/',
        destination: '/welcome',
        permanent: true,
      },
    ]
  },
  // distDir: 'build',
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx', 'md'],
  experimental: {
    // mdxRs: true,
    // forceSwcTransforms: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  // reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl)$/,
      use: [
        {
          loader: 'raw-loader',
        },
      ],
    });

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config;
  },
};

// Merge MDX config with Next.js config
export default withPlugins([withMDX, withBundleAnalyzer], nextConfig);
