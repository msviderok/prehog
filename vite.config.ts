import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      port: 3000,
    },
    build: {
      sourcemap: true,
    },
    resolve: {
      tsconfigPaths: true,
      external: ['@dnd-kit/solid'],
    },
    plugins: [
      nitro(),
      tailwindcss(),
      tanstackStart(),
      solidPlugin({
        ssr: true,
        babel: {
          sourceMaps: true,
        },
      }),
    ],
    environments: {
      ssr: {
        define: {
          'process.env.CLERK_SECRET_KEY': JSON.stringify(env.CLERK_SECRET_KEY),
          'process.env.CLERK_JWT_ISSUER_DOMAIN': JSON.stringify(env.CLERK_JWT_ISSUER_DOMAIN),
          'process.env.VITE_CONVEX_URL': JSON.stringify(env.VITE_CONVEX_URL),
          'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY),
        },
      },
    },
  }
})
