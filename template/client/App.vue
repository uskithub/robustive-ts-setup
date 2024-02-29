<script setup lang="ts">
</script>

<template lang="pug">
v-app(id="inspire")
  v-row(v-if="stores.shared.isLoading" align="center")
    v-col.d-flex.justify-center
        v-progress-circular(
          :size="120"
          :width="15"
          color="purple"
          indeterminate
        )
  router-view(v-else)
</template>