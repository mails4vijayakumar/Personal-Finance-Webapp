import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom'],
                    'charts': ['chart.js', 'react-chartjs-2']
                },
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.')
                    const ext = info[info.length - 1]
                    if (/png|jpe?g|gif|svg|webp|ico/i.test(ext)) {
                        return `images/[name]-[hash][extname]`
                    } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
                        return `fonts/[name]-[hash][extname]`
                    } else if (ext === 'css') {
                        return `css/[name]-[hash][extname]`
                    }
                    return `assets/[name]-[hash][extname]`
                }
            }
        }
    },
    preview: {
        port: 4173
    }
})
