import Home from "@views/Home.vue";
import SignIn from "@views/SignIn.vue";
import SignUp from "@views/SignUp.vue";

export const routes = [
    { path: "/", component: Home }
    , { path: "/signin", component: SignIn }
    , { path: "/signup", component: SignUp }
];