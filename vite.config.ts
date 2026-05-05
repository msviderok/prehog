import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'
import { nitro } from 'nitro/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [nitro(), tailwindcss(), tanstackStart(), solidPlugin({ ssr: true })],
})
