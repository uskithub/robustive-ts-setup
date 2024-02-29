<script setup lang="ts">
// service

// view
import drawer from "../components/drawer/drawer.vue";
import { DrawerContentType } from "../components/drawer";
import type { DrawerItem } from "../components/drawer";

// system
import { DICTIONARY_KEY } from "@shared/system/localizations";
import type { Dictionary } from "@shared/system/localizations";
import { inject, reactive } from "vue";

const t = inject(DICTIONARY_KEY) as Dictionary;

const items: Array<DrawerItem> = [
    { type: DrawerContentType.header, title: "Menu1" } as DrawerItem
    , { type: DrawerContentType.link, title: t.signIn.menu, href: "/signin" } as DrawerItem
    , { type: DrawerContentType.link, title: t.signUp.menu, href: "/signup" } as DrawerItem
    , { type: DrawerContentType.divider } as DrawerItem
    , { type: DrawerContentType.header, title: "Menu2" } as DrawerItem
    , { type: DrawerContentType.link, title: t.signOut.menu, href: "/signout" } as DrawerItem
];

const state = reactive<{
    isDrawerOpen: boolean;
}>({
    isDrawerOpen: true
});

</script>

<template lang="pug">
drawer(v-model="state.isDrawerOpen", :items="items")
v-app-bar
  v-app-bar-nav-icon(@click="state.isDrawerOpen = !state.isDrawerOpen")
  v-toolbar-title Application
v-main
  router-view
</template>

<style lang="sass" scoped></style>