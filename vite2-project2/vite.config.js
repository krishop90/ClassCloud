export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://classcloud.onrender.com', // Backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Remove the `/api` prefix from the path
      },
    },
  },
})
