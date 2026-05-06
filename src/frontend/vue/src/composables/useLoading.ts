/**
 * @description ローディング状態管理の Composable
 * @author yoshitaka
 */

import { ref, computed } from "vue";

export function useLoading() {
  const isLoading = ref(false);

  const startLoading = () => {
    isLoading.value = true;
  };

  const stopLoading = () => {
    isLoading.value = false;
  };

  const withLoading = async <T>(promise: Promise<T>): Promise<T> => {
    startLoading();
    try {
      return await promise;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading: computed(() => isLoading.value),
    startLoading,
    stopLoading,
    withLoading,
  };
}
