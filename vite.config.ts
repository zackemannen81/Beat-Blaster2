import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000
  }
})