import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true, external: ['@dnd-kit/solid'] },
  plugins: [nitro(), tailwindcss(), tanstackStart(), solidPlugin({ ssr: true })],
})
