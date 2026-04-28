import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    server: {
      deps: {
        inline: ['react', 'react-dom', 'react/jsx-runtime'],
      },
    },
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
})
