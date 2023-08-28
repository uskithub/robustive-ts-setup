import dependencies from "@shared/service/domain/dependencies";
import { createApp } from "vue";
import { loadRouter } from "@client/system/plugins/router";
import { loadVuetify } from "@client/system/plugins/vuetify";
import { DICTIONARY_KEY, i18n } from "@/shared/system/localizations";
import "./style.css";
import App from "./App.vue";

// dependencies.auth = new FirebaseAuthenticator(firebaseApp);
// dependencies.analytics = new FirebaseAnalytics();

const dictionary = i18n(navigator.language);
const app = createApp(App);

loadRouter(app);
loadVuetify(app);

app.provide(DICTIONARY_KEY, dictionary);
app.mount("#app");