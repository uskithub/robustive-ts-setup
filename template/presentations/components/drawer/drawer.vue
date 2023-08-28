<script setup lang="ts">
// system
import { reactive, watch } from "vue";
import { DrawerContentType } from ".";
import type { DrawerItem } from ".";

const props = defineProps<{
    modelValue: boolean
    , items: Array<DrawerItem>
}>();

const emits = defineEmits<{
    (e: "update:modelValue", isOpen: boolean): void
}>();

const state = reactive<{
    isOpen: boolean;
}>({
    isOpen: props.modelValue
});

watch(() => props.modelValue, (newVal: boolean) => {
    state.isOpen = newVal;
});

</script>

<template lang="pug">
v-navigation-drawer(v-model="state.isOpen" 
  @update:model-value="emits('update:modelValue', state.isOpen)")
  v-list(nav)
    template(v-for="(item, idx) in props.items")
      v-list-subheader(v-if="item.type === DrawerContentType.header") {{ item.title }}
      v-divider(v-else-if="item.type === DrawerContentType.divider")
      v-list-item(v-else 
        :key="idx"
        :value="item"
        :to="item.href"
        color="primary"
        rounded="xl"
      )
        v-list-item-title(v-text="item.title")  
</template>
