import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import svgr from "vite-plugin-svgr";
import tsconfigPaths from 'vite-tsconfig-paths';

const scssDir = resolve(__dirname, 'src/scss');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ svgr(), react(), tsconfigPaths({root: __dirname})],
  resolve: {
    alias: {
      $fonts: resolve('./src/vendor/fonts'),
      $assets: resolve('./src/assets'),
    }
  },
  build: {
    assetsInlineLimit:0,
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [scssDir],
        additionalData: (content: string, filepath: string) => {
          const file = filepath.replace(/\\/g, '/')
          if (
            file.endsWith('/src/scss/_variables.scss') ||
            file.includes('/src/scss/mixins/')
          ) {
            return content
          }
          return `@use "variables" as *;\n@use "mixins";\n${content}`
        },
      },
    }
  },

})
