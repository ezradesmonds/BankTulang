import { defineConfig } from 'vite';

export default defineConfig({
  base: '/BankTulang/',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
  },
});
