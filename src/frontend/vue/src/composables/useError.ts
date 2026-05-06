/**
 * @description エラーハンドリングの Composable
 * @author yoshitaka
 */

import { ref } from "vue";
import { formatErrorMessage } from "../utils/helpers";

export function useError() {
  const error = ref<string | null>(null);

  const setError = (err: unknown) => {
    error.value = formatErrorMessage(err);
  };

  const clearError = () => {
    error.value = null;
  };

  const withErrorHandling = async <T>(promise: Promise<T>): Promise<T | null> => {
    try {
      clearError();
      return await promise;
    } catch (err) {
      setError(err);
      return null;
    }
  };

  return {
    error,
    setError,
    clearError,
    withErrorHandling,
  };
}
