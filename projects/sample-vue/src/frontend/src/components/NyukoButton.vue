<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  buttonName: string;
  setValue: string;
  mgrn: string;
  btnClass: string;
}>();
const status = ref("stop");
const btnClick = () => {
  status.value = "move";

  isSpinnerShow.value = true;
  const todayDate = new Date().toString();
  setTimeout(() => {
    status.value = "stop";
    isSpinnerShow.value = false;
  }, 3000);
};
const isSpinnerShow = ref(false);
</script>
<style>
div#status {
  text-align: center;
  font-size: x-large;
  text-decoration: underline; /* 下線 */
  text-decoration-thickness: 0.5em; /* 線の太さ */
  text-decoration-color: rgba(81, 255, 0, 0.4); /* 線の色 */
  text-underline-offset: -0.6em; /* 線の位置。テキストに重なるようにやや上部にする */
  text-decoration-skip-ink: none; /* 下線と文字列が重なる部分でも下線が省略されない（線が途切れない） */
}
</style>
<template>
  <div class="d-grid gap-2 m-5">
    <div id="status">{{ status }}</div>
    <button :val="mgrn" :class="btnClass" :value="setValue" @click="btnClick">
      {{ buttonName }}
      <span
        v-if="isSpinnerShow"
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
    </button>
  </div>
</template>
