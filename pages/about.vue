<script setup lang="ts">
// The About content now lives as an in-page section on the home page (#about).
// Redirect any direct visits/bookmarks here to that section instead of showing a stale stub.
await navigateTo('/#about');
</script>

<template>
  <main />
</template>
