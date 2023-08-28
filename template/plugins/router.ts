// service
import { routes } from "@client/service/presentation";
// system
import { App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory()
    , routes
});

export function loadRouter(app: App<Element>) {
    app.use(router);
}