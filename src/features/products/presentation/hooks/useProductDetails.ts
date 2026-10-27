import { useEffect, useState } from 'react';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { ProductDetails } from '../../domain/models/ProductDetails';
import { GetProductDetails } from '../../domain/usecases/GetProductDetails';

export type ProductDetailsState =
  | { status: 'loading' }
  | { status: 'success'; data: ProductDetails }
  | { status: 'error'; message: string };

/**
 * Loads a single product by id and exposes a `retry` function. Mirrors
 * `useProducts`' cancellation/race handling (see that file for why both
 * `AbortController` and the `isActive` flag are needed), with `id` added as
 * an effect dependency: changing it aborts the in-flight request for the
 * previous id and starts a fresh one, so a late-resolving stale request can
 * never overwrite the result for the id the screen is now showing.
 */
export function useProductDetails(id: string, getProductDetails: GetProductDetails) {
  const [state, setState] = useState<ProductDetailsState>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    setState({ status: 'loading' });

    getProductDetails(id, controller.signal)
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
  }, [id, retryCount, getProductDetails]);

  function retry() {
    setRetryCount(count => count + 1);
  }

  return { state, retry };
}
