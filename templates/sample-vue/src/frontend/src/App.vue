<template>
  <div id="app-container">
    <header class="app-header">
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Vue3 GAS App</a>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <Home />
    </main>

    <footer class="app-footer">
      <p class="text-center text-muted">© 2024 App. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Home from "./pages/Home.vue";
</script>

<style>
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}

.app-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 2rem 0;
  margin-top: auto;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
