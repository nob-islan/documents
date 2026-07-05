<script setup lang="ts">
defineProps<{
  href: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="grid cards wrapper">
    <a :href="href">
      <div class="grid cards title">{{ title }}</div>
      <div class="grid cards explain">
        {{ description }}
      </div>
    </a>
  </div>
</template>
