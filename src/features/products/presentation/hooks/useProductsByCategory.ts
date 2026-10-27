import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { Product } from '../../domain/models/Product';
import { GetProductsByCategory } from '../../domain/usecases/GetProductsByCategory';

export type ProductsByCategoryState =
  | { status: 'loading' }
  | { status: 'success'; data: Product[] }
  | { status: 'error'; message: string };

/** Matches this project's existing page size for `/products?limit=10`. */
const PAGE_SIZE = 10;

/**
 * Loads a category's products page by page. Mirrors `useProductDetails`'s
 * cancellation/race handling for the first page (see that file for why both
 * `AbortController` and the `isActive` flag are needed), with `categorySlug`
 * as an effect dependency so switching categories cancels the in-flight
 * request for the previous one, resets pagination to the first page, and
 * replaces (never appends to) the previous category's results.
 *
 * `loadMore` fetches the next page and appends it to the loaded list. Two
 * refs guard it against the races a FlatList's `onEndReached` can trigger:
 * - `isLoadingMoreRef` is checked and set synchronously, before any state
 *   update is scheduled, so two calls that happen in the same tick (e.g.
 *   rapid scrolling) can't both pass the "not already loading" check — a
 *   state-only guard can't do this, since `isLoadingMore` wouldn't reflect
 *   the first call's in-progress state until after a re-render.
 * - `categorySlugRef` always holds the latest category (updated every
 *   render), so a page that resolves after the user has already switched
 *   categories is recognized as stale and discarded instead of appending
 *   onto the new category's list.
 */
export function useProductsByCategory(
  categorySlug: string,
  getProductsByCategory: GetProductsByCategory,
) {
  const [state, setState] = useState<ProductsByCategoryState>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const categorySlugRef = useRef(categorySlug);
  categorySlugRef.current = categorySlug;
  const isLoadingMoreRef = useRef(false);
  const loadMoreControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    setState({ status: 'loading' });
    setTotal(0);
    setLoadMoreError(null);
    setIsLoadingMore(false);
    isLoadingMoreRef.current = false;

    getProductsByCategory(categorySlug, PAGE_SIZE, 0, controller.signal)
      .then(page => {
        if (isActive) {
          setTotal(page.total);
          setState({ status: 'success', data: page.products });
        }
      })
      .catch(error => {
        if (!isActive || isAbortError(error)) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setState({ status: 'error', message });
      });

    return () => {
      isActive = false;
      controller.abort();
      // A previous category's still-in-flight "load more" must never land
      // on the new category's state — abort it too, not just the first page.
      loadMoreControllerRef.current?.abort();
      loadMoreControllerRef.current = null;
      isLoadingMoreRef.current = false;
    };
    // retryCount is a deliberate, user-triggered dependency: it's the only
    // thing (besides categorySlug) that should cause this effect to re-run.
  }, [categorySlug, retryCount, getProductsByCategory]);

  function retry() {
    setRetryCount(count => count + 1);
  }

  const loadMore = useCallback(() => {
    if (state.status !== 'success' || isLoadingMoreRef.current || state.data.length >= total) {
      return;
    }

    const requestedCategory = categorySlugRef.current;
    const skip = state.data.length;
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    getProductsByCategory(requestedCategory, PAGE_SIZE, skip, controller.signal)
      .then(page => {
        if (requestedCategory !== categorySlugRef.current) {
          return;
        }
        setTotal(page.total);
        setState(current =>
          current.status === 'success'
            ? { status: 'success', data: [...current.data, ...page.products] }
            : current,
        );
      })
      .catch(error => {
        if (requestedCategory !== categorySlugRef.current || isAbortError(error)) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setLoadMoreError(message);
      })
      .finally(() => {
        if (requestedCategory === categorySlugRef.current) {
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
        }
      });
  }, [state, total, getProductsByCategory]);

  const hasMore = state.status === 'success' && state.data.length < total;

  return { state, retry, loadMore, isLoadingMore, loadMoreError, hasMore };
}
