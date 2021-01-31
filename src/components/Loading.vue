<template>
  <div
    v-if="isLoading"
    class="loading-container"
    style="position:relative;height: 100px;display: flex;align-content: center;justify-content: center;background-color: white;width: 100%"
  >
    <div class="flex-loading" style="display: flex;align-content: center">
      <b-loading
        :is-full-page="false"
        v-model="isLoading"
        :can-cancel="true"
      ></b-loading>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isLoading: Boolean,
  },
}
</script>

<style lang="scss">
.loading-container .flex-loading .loading-overlay .loading-icon::after {
  border: 2px solid #dbdbdb;
  border-radius: 290486px;
  border-right-color: #036C72;
  border-top-color: #036C72;
}
</style>
