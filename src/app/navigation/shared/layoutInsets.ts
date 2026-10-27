import { useContext } from 'react';
import { HeaderHeightContext } from '@react-navigation/elements';
import { isGlassHeaderActive } from './glassHeaderScreenOptions';

/**
 * Like `useHeaderHeight`, but returns 0 instead of throwing when there's no
 * header above in the tree (e.g. a screen rendered standalone in a unit
 * test, outside any navigator).
 */
export function useOptionalHeaderHeight(): number {
  return useContext(HeaderHeightContext) ?? 0;
}

/**
 * Everything a screen needs to sit under `glassHeaderScreenOptions`: how
 * much to pad non-scrolling content, and the props a `ScrollView`/`FlatList`
 * needs to scroll edge-to-edge under the header. The header only floats
 * over content on iOS 26+ (real Liquid Glass) — everywhere else it's a
 * normal opaque header, so the navigator already reserves space for it and
 * `topInset` is 0 / `scrollInsetProps` is empty.
 */
export function useGlassScrollInsets(): {
  topInset: number;
  scrollInsetProps: {
    contentInset?: { top: number };
    contentOffset?: { x: number; y: number };
    scrollIndicatorInsets?: { top: number };
  };
} {
  const headerHeight = useOptionalHeaderHeight();
  const topInset = isGlassHeaderActive ? headerHeight : 0;
  return {
    topInset,
    scrollInsetProps: isGlassHeaderActive
      ? {
          contentInset: { top: topInset },
          contentOffset: { x: 0, y: -topInset },
          scrollIndicatorInsets: { top: topInset },
        }
      : {},
  };
}
