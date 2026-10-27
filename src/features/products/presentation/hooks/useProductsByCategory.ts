import { useEffect, useState } from 'react';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { Product } from '../../domain/models/Product';
import { GetProductsByCategory } from '../../domain/usecases/GetProductsByCategory';

export type ProductsByCategoryState =
  | { status: 'loading' }
  | { status: 'success'; data: Product[] }
  | { status: 'error'; message: string };

/**
 * Loads a category's products and exposes a `retry` function. Mirrors
 * `useProductDetails`'s cancellation/race handling, with `categorySlug` as
 * an effect dependency: switching categories cancels the in-flight request
 * for the previous one and starts a fresh one, so a late-resolving stale
 * request can never overwrite the result for the category now being shown.
 */
export function useProductsByCategory(
  categorySlug: string,
  getProductsByCategory: GetProductsByCategory,
) {
  const [state, setState] = useState<ProductsByCategoryState>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    setState({ status: 'loading' });

    getProductsByCategory(categorySlug, controller.signal)
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
  }, [categorySlug, retryCount, getProductsByCategory]);

  function retry() {
    setRetryCount(count => count + 1);
  }

  return { state, retry };
}
