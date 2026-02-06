import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import semiPlugin from '@douyinfe/vite-plugin-semi'

const { vitePluginSemi } = semiPlugin as { vitePluginSemi: typeof semiPlugin.vitePluginSemi }

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginSemi({
      theme: {
        name: '@semi-bot/semi-theme-feishu1.0',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7777',
        changeOrigin: true,
      },
    },
  },
})
