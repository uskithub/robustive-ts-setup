import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "@vuetify/vite-plugin";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue()
        // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
        , vuetify({
            autoImport: true
        })
    ]
    , define: { "process.env": {} }
    , resolve: {
        alias: {
            "@": path.resolve(__dirname, "src/")
            , "@client": path.resolve(__dirname, "src/client")
            , "@server": path.resolve(__dirname, "src/server")
            , "@shared": path.resolve(__dirname, "src/shared")
            , "@views": path.resolve(__dirname, "src/client/service/presentation/views")
            , "@domain": path.resolve(__dirname, "src/shared/service/domain")
            , "@interfaces": path.resolve(__dirname, "src/shared/service/domain/interfaces")
            , "@actors": path.resolve(__dirname, "src/shared/service/application/actors")
            , "@usecases": path.resolve(__dirname, "src/shared/service/application/usecases")
            , find: "./runtimeConfig"
            , replacement: "./runtimeConfig.browser"
        }
    }
    , server: {
        port : 3001
    }
});