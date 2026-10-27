import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from '../../../../app/navigation/types';
import { useGlassScrollInsets, tabBarBottomPadding } from '../../../../app/navigation/shared/layoutInsets';
import { Category } from '../../domain/models/Category';
import { GetCategories } from '../../domain/usecases/GetCategories';
import { useCategories } from '../hooks/useCategories';
import { GlassButton } from '../../../../core/ui/GlassButton';
import { CategoryTileSkeleton } from '../components/CategoryTileSkeleton';

function keyExtractor(item: Category): string {
  return item.slug;
}

const SKELETON_ROWS = [
  ['skeleton-1', 'skeleton-2'],
  ['skeleton-3', 'skeleton-4'],
  ['skeleton-5', 'skeleton-6'],
];

/**
 * Pastel accent palette, picked deterministically per category so each one
 * keeps its own color. `border` is a more saturated step of the same hue
 * than `bg`, so the tile's outline reads as a tinted version of its own
 * card rather than one flat neutral line on every tile.
 */
const ACCENTS = [
  { bg: '#eef2ff', border: '#c7d2fe', fg: '#4338ca' },
  { bg: '#ecfdf5', border: '#a7f3d0', fg: '#047857' },
  { bg: '#fff7ed', border: '#fed7aa', fg: '#c2410c' },
  { bg: '#fdf2f8', border: '#fbcfe8', fg: '#be185d' },
  { bg: '#eff6ff', border: '#bfdbfe', fg: '#1d4ed8' },
  { bg: '#fefce8', border: '#fde68a', fg: '#a16207' },
];

/** Cycles through the palette by position so no two tiles next to each other share a color. */
function accentFor(index: number): { bg: string; border: string; fg: string } {
  return ACCENTS[index % ACCENTS.length];
}

/**
 * DummyJSON's known category slugs mapped to a representative emoji. Emoji
 * render as full-color system glyphs (no icon font/asset needed) and read
 * much closer to a little illustrated sticker than a flat line icon does.
 */
const CATEGORY_EMOJIS: Record<string, string> = {
  beauty: '💄',
  fragrances: '🌸',
  furniture: '🛋️',
  groceries: '🛒',
  'home-decoration': '🖼️',
  'kitchen-accessories': '🍳',
  laptops: '💻',
  'mens-shirts': '👕',
  'mens-shoes': '👞',
  'mens-watches': '⌚',
  'mobile-accessories': '🎧',
  motorcycle: '🏍️',
  'skin-care': '🧴',
  smartphones: '📱',
  'sports-accessories': '⚽',
  sunglasses: '🕶️',
  tablets: '📱',
  tops: '👚',
  vehicle: '🚗',
  'womens-bags': '👜',
  'womens-dresses': '👗',
  'womens-jewellery': '💎',
  'womens-shoes': '👠',
  'womens-watches': '⌚',
};

/** A generic placeholder for any category DummyJSON adds that isn't in the map above. */
const DEFAULT_CATEGORY_EMOJI = '🏷️';

function emojiFor(slug: string): string {
  return CATEGORY_EMOJIS[slug] ?? DEFAULT_CATEGORY_EMOJI;
}

type CategoriesNavigationProp = NativeStackNavigationProp<
  CategoriesStackParamList,
  'CategoriesList'
>;

interface CategoriesScreenProps {
  getCategories: GetCategories;
}

export function CategoriesScreen({ getCategories }: CategoriesScreenProps) {
  const { state, retry } = useCategories(getCategories);
  const navigation = useNavigation<CategoriesNavigationProp>();
  const { topInset, scrollInsetProps } = useGlassScrollInsets();
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: { item: Category; index: number }) => {
      const accent = accentFor(index);
      return (
        <Pressable
          style={({ pressed }) => [
            styles.tile,
            { backgroundColor: accent.bg, borderColor: accent.border },
            pressed && styles.tilePressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          onPress={() =>
            navigation.navigate('CategoryProducts', {
              categorySlug: item.slug,
              categoryName: item.name,
            })
          }>
          <View style={styles.tileBlob} />
          <View style={styles.tileIconBadge}>
            <Text style={styles.tileIconEmoji}>{emojiFor(item.slug)}</Text>
          </View>
          <Text style={styles.tileText} numberOfLines={2}>
            {item.name}
          </Text>
        </Pressable>
      );
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      {state.status === 'loading' && (
        <View
          style={[styles.listContent, { paddingTop: topInset + 16, paddingBottom: tabBarBottomPadding(insets.bottom) }]}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading categories">
          {SKELETON_ROWS.map(row => (
            <View key={row[0]} style={styles.column}>
              {row.map(key => (
                <CategoryTileSkeleton key={key} />
              ))}
            </View>
          ))}
        </View>
      )}

      {state.status === 'error' && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <GlassButton
            label="Retry"
            onPress={retry}
            accessibilityLabel="Retry loading categories"
            style={styles.retryButton}
          />
        </View>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>
            No categories found right now. Check back soon.
          </Text>
        </View>
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <FlatList
          data={state.data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarBottomPadding(insets.bottom) }]}
          {...scrollInsetProps}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 12,
  },
  column: {
    flexDirection: 'row',
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centeredText: {
    marginTop: 12,
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tilePressed: {
    opacity: 0.7,
  },
  /** A soft, oversized decorative circle peeking from a corner, like the reference design's background bubbles. */
  tileBlob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  tileIconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    marginBottom: 12,
  },
  tileIconEmoji: {
    fontSize: 38,
  },
  tileText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
});
