import { defineConfig, type PluginOption } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ command }) => {
  const plugins: PluginOption[] = [tsconfigPaths()]

  if (command === 'build') {
    plugins.push(
      viteStaticCopy({
        hook: 'writeBundle',
        targets: [
          { src: 'src/content', dest: 'src' },
          { src: 'src/config', dest: 'src' }
        ]
      })
    )
  }

  return {
    base: './',
    server: { port: 5173 },
    build: {
      sourcemap: true
    },
    plugins
  }
})