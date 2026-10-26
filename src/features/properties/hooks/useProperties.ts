import { useEffect, useState } from 'react';
import { Property } from '../types/property';
import { getProperties, isAbortError } from '../services/propertyService';

export type PropertiesState =
  | { status: 'loading' }
  | { status: 'success'; data: Property[] }
  | { status: 'error'; message: string };

/**
 * Loads the property list and exposes a `retry` function.
 *
 * Aborting vs. ignoring a stale result (two different problems, both
 * handled here):
 * - `AbortController.abort()` actually cancels the in-flight network
 *   request/signal, so the browser (or RN's networking layer) stops
 *   downloading a response nobody wants anymore.
 * - The `isActive` flag below guards against a *different* race: an
 *   in-flight request can still resolve after the component unmounts or
 *   after `retry()` started a newer request, slightly before the abort
 *   takes effect. Without that flag a stale "success"/"error" could
 *   overwrite the state of a newer, still-loading request. Abort and the
 *   `isActive` check solve different failure modes, so both are needed.
 */
export function useProperties() {
  const [state, setState] = useState<PropertiesState>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    setState({ status: 'loading' });

    getProperties(controller.signal)
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
  }, [retryCount]);

  function retry() {
    setRetryCount(count => count + 1);
  }

  return { state, retry };
}
