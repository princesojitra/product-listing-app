import { useEffect, useState } from 'react';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { Category } from '../../domain/models/Category';
import { GetCategories } from '../../domain/usecases/GetCategories';

export type CategoriesState =
  | { status: 'loading' }
  | { status: 'success'; data: Category[] }
  | { status: 'error'; message: string };

/**
 * Loads the category list and exposes a `retry` function. Mirrors
 * `useProducts`' cancellation/race handling: an `AbortController` cancels
 * the in-flight request on cleanup, and the `isActive` flag guards against
 * a response that resolves after cleanup but before the abort takes effect.
 */
export function useCategories(getCategories: GetCategories) {
  const [state, setState] = useState<CategoriesState>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    setState({ status: 'loading' });

    getCategories(controller.signal)
      .then(data => {
        if (isActive) {
          setState({ status: 'success', data });
        }
      })
      .catch(error => {
        if (!isActive || isAbortError(error)) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Something went wrong.';
        setState({ status: 'error', message });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
    // retryCount is a deliberate, user-triggered dependency: it's the only
    // thing that should cause this effect to re-run.
  }, [retryCount, getCategories]);

  function retry() {
    setRetryCount(count => count + 1);
  }

  return { state, retry };
}
