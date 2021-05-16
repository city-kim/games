<template>
  <div>
    <div id="nav">
      <router-link
        v-for="link in links"
        :key="link.name"
        :to="{name: link.name}"
      >{{link.title}}</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      links: [
        {name: 'matching', title: '숫자맞추기'}
      ]
    }
  }
})
</script>

<style lang="scss">
  #nav {
    margin-top: 1rem;
    text-align: center;
    a {
      display: inline-block;
      padding:1rem;
      border:1px solid #ccc;
      & ~ a {
        margin-left:1rem;
      }
    }
  }
</style>
