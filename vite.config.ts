import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: { port: 3000 },
  logLevel: 'error',
  resolve: { tsconfigPaths: true, external: ['@dnd-kit/solid'] },
  plugins: [nitro(), tailwindcss(), tanstackStart({}), solidPlugin({ ssr: true })],
})
