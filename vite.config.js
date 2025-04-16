import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url"; // Thêm helper từ Node.js
import path from "path";

const __filename = fileURLToPath(import.meta.url); // Lấy đường dẫn file hiện tại
const __dirname = path.dirname(__filename); // Lấy thư mục chứa file

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, "src/components"), // Sử dụng __dirname đã định nghĩa
      pages: path.resolve(__dirname, "src/pages"),
      services: path.resolve(__dirname, "src/services"),
      layout: path.resolve(__dirname, "src/layout"),
      context: path.resolve(__dirname, "src/context"),
      assets: path.resolve(__dirname, "src/assets"),
      utils: path.resolve(__dirname, "src/utils"),
    },
  },
});
