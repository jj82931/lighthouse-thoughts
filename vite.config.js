import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Vitest 설정 추가
    globals: true,
    environment: "jsdom", // 또는 'happy-dom'
    // setupFiles: './src/setupTests.js', // 설정 파일 경로 (선택 사항)
  },
});
