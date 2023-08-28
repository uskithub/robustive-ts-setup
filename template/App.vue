<script setup lang="ts">
import { provide } from "vue";
import { DISPATCHER_KEY, createDispatcher } from "@/client/service/application/performers";
import { SignInStatus } from "@/shared/service/domain/interfaces/authenticator";
import { U } from "@/shared/service/application/usecases";
import { Nobody } from "@/shared/service/application/usecases/nobody";


const dispatcher = createDispatcher();
provide(DISPATCHER_KEY, dispatcher);

const { stores, dispatch } = dispatcher;

if (stores.shared.signInStatus.case === SignInStatus.unknown) {
    dispatch(U.boot.basics[Nobody.boot.basics.userOpensSite]());
}

</script>

<template lang="pug">
v-app(id="inspire")
  router-view
</template>

<style scoped></style>
