import dependencies from "@shared/service/domain/dependencies";
import { createApp, watch } from "vue";
import { loadRouter } from "@client/system/plugins/router";
import { loadVuetify } from "@client/system/plugins/vuetify";
import { DICTIONARY_KEY, i18n } from "@/shared/system/localizations";
import { SERVICE_KEY, createService, Mutable } from "@/client/service/application/performers";

import { SignInStatus } from "@/shared/service/domain/interfaces/authenticator";
import { R } from "@/shared/service/application/usecases";

import "./style.css";
import App from "./App.vue";

// dependencies.auth = new FirebaseAuthenticator(firebaseApp);
// dependencies.analytics = new FirebaseAnalytics();

const dictionary = i18n(navigator.language);
const app = createApp(App);

const router = loadRouter(app);
loadVuetify(app);

router
    .isReady() // 直リン対策で初めのPathを取得するために待つ
    .finally(() => {
        const initialPath = router.currentRoute.value.path;
        const service = createService(initialPath);
        const { stores, dispatch } = service;
        app.provide(SERVICE_KEY, service);
        app.provide(DICTIONARY_KEY, dictionary);

        /* Setup for Routing */
        watch(() => stores.shared.currentRouteLocation, (newValue, oldValue) => {
            console.info("★☆★☆★ RouteLocation:", oldValue, "--->", newValue);
            router.replace(newValue)
                .finally(() => {
                    const _shared = stores.shared as Mutable<SharedStore>;
                    _shared.isLoading = false;
                });
        });
    
        // @see: https://router.vuejs.org/guide/advanced/navigation-guards.html#Navigation-Guards
        router.beforeEach((to, from) => {
            if (stores.shared.currentRouteLocation !== to.path && stores.shared.currentRouteLocation === from.path) {
                console.warn("!!!!! RouteLocation was changed directly by the user, e.g. from the address bar.", from.path, "--->", to.path);
                service.routingTo(to.path);
                return false;
            }
            return true;
        });

        let subscriptions: Subscription[] = [];
        watch(() => stores.shared.signInStatus, (newValue) => {
            if (newValue.case === SignInStatus.signIn) {
                const userProperties = newValue.userProperties;
                const serviceActor = new Service();
                // dispatch(R.taskManagement.observingUsersTasks.basics[Service.usecases.observingUsersTasks.basics.serviceDetectsSigningIn]({ user }), serviceActor)
                //     .then(subscription => {
                //         if (subscription) subscriptions.push(subscription);
                //     })
                //     .catch(e => console.error(e));
        
                // dispatch(R.taskManagement.observingUsersProjects.basics[Service.usecases.observingUsersProjects.basics.serviceDetectsSigningIn]({ user }), serviceActor)
                //     .then(subscription => {
                //         if (subscription) subscriptions.push(subscription);
                //     })
                //     .catch(e => console.error(e));
                
                dispatch(R.timeline.observingUsersTimeline.basics.serviceDetectsSigningIn({ user: userProperties }), serviceActor)
                    .then(subscription => {
                        if (subscription) subscriptions.push(subscription);
                    })
                    .catch(e => console.error(e));
            } else if (newValue.case === SignInStatus.signingOut) {
                subscriptions.forEach((s) => s.unsubscribe());
                subscriptions = [];
            }
        });
        
        if (stores.shared.signInStatus.case === SignInStatus.unknown) {
            dispatch(R.application.boot.basics.userOpensSite())
                .catch(e => console.error(e));
        }

        app.mount("#app");
    });