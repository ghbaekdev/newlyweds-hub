import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  // useMemo/useCallback 대신 컴파일러가 메모이제이션한다 (docs/conventions.md)
  reactCompiler: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
