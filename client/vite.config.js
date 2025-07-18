import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    server: {
      host: true, // ✅ allow LAN access
      port: 5173, // optional, default is 5173
    },
    define: {
      // Make env variables available in the client code
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
  }
})
