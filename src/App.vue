<template>
  <div id="app">
    <!-- 路由占位符 -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',

}
</script>

<style>
#app {
  width: 100%;
}
#app>section{
    width: 100%;
}
</style>
