import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue()
        // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
        , vuetify({
            autoImport: true
        })
        , tsconfigPaths()
    ]
    , define: { "process.env": {} }
    , server: {
        port : 3001
    }
});