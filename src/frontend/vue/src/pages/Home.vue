<!-- eslint-disable vue/no-parsing-error -->
<script setup lang="ts">
import { Ref, onMounted, ref, computed } from "vue";
import NyukoButton from "../components/NyukoButton.vue";
import { useLoading } from "../composables/useLoading";
import { useError } from "../composables/useError";

//init時にテンプレート処理
//see https://developers.google.com/apps-script/guides/html/templates?hl=ja
//GASのスクリプトレットを使用して直接表示する事が可能
const val = ref("");
const changeValue = ref(0);
const mgrn = ref("init");
let inputValue = "";
let returnArray: Ref<[{ title: string; data: number }]> = ref([
  {
    title: "title",
    data: 1,
  },
]);

const { isLoading } = useLoading();
const { error, setError, clearError } = useError();

//マウント時(onload)
onMounted(() => {
  clearError();
});

//変更時(change)
const onChange = (event: any) => {
  try {
    //イベントからValueをとり
    const evValue = event.target.value;
    //ここでスパン内の値を＋＋
    changeValue.value++;
    //input value も変更
    val.value = `${evValue}:${changeValue.value}`;
    inputValue = val.value;
    //配列に追加してVforをまわして表示を増やす
    returnArray.value.push({ title: evValue, data: changeValue.value });
  } catch (err) {
    setError(err);
  }
};
</script>

<!--scop with in file -->
<style scoped>
span {
  font-size: xx-large;
}
</style>

<template>
  <div class="page-container">
    <!-- エラー表示 -->
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <!-- ローディング表示 -->
    <div v-if="isLoading" class="spinner-border" role="status">
      <span class="visually-hidden">読み込み中...</span>
    </div>

    <div class="d-grid gap-2 m-5"></div>

    <div class="m-5">
      <div class="input-group input-group-lg">
        <span class="input-group-text">{{ changeValue }}</span>
        <input
          type="text"
          class="form-control"
          id="inputmgrn"
          :value="inputValue"
          name="for_admin"
          list="querylist"
          @change="onChange"
        />
      </div>
      <div id="list"></div>
    </div>

    <template v-for="(ret, index) in returnArray" v-bind:key="index">
      <div class="h1 text-center">
        <label class="h2" v-bind:for="'titlecheckbox' + index">
          {{ ret.title }}
        </label>
        <span>{{ ret.data }}:{{ index }}</span>
      </div>
    </template>

    <NyukoButton
      button-name="button1"
      :mgrn="mgrn"
      set-value="setvalues"
      btn-class="btn btn-success"
    ></NyukoButton>
  </div>
</template>
