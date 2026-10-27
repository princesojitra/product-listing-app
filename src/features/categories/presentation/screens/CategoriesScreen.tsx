import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { CategoriesStackParamList } from '../../../../app/navigation/types';
import { useGlassScrollInsets } from '../../../../app/navigation/shared/layoutInsets';
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

/** Pastel accent palette, picked deterministically per category so each one keeps its own color. */
const ACCENTS = [
  { bg: '#eef2ff', fg: '#4338ca' },
  { bg: '#ecfdf5', fg: '#047857' },
  { bg: '#fff7ed', fg: '#c2410c' },
  { bg: '#fdf2f8', fg: '#be185d' },
  { bg: '#eff6ff', fg: '#1d4ed8' },
  { bg: '#fefce8', fg: '#a16207' },
];

/** Cycles through the palette by position so no two tiles next to each other share a color. */
function accentFor(index: number): { bg: string; fg: string } {
  return ACCENTS[index % ACCENTS.length];
}

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

/** DummyJSON's known category slugs mapped to a representative MaterialIcons glyph. */
const CATEGORY_ICONS: Record<string, MaterialIconName> = {
  beauty: 'face',
  fragrances: 'local-florist',
  furniture: 'weekend',
  groceries: 'local-grocery-store',
  'home-decoration': 'wallpaper',
  'kitchen-accessories': 'kitchen',
  laptops: 'laptop',
  'mens-shirts': 'checkroom',
  'mens-shoes': 'directions-walk',
  'mens-watches': 'watch',
  'mobile-accessories': 'headset',
  motorcycle: 'two-wheeler',
  'skin-care': 'spa',
  smartphones: 'smartphone',
  'sports-accessories': 'sports-soccer',
  sunglasses: 'wb-sunny',
  tablets: 'tablet-mac',
  tops: 'checkroom',
  vehicle: 'directions-car',
  'womens-bags': 'shopping-bag',
  'womens-dresses': 'checkroom',
  'womens-jewellery': 'diamond',
  'womens-shoes': 'directions-walk',
  'womens-watches': 'watch',
};

/** A generic placeholder for any category DummyJSON adds that isn't in the map above. */
const DEFAULT_CATEGORY_ICON: MaterialIconName = 'category';

function iconFor(slug: string): MaterialIconName {
  return CATEGORY_ICONS[slug] ?? DEFAULT_CATEGORY_ICON;
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
          style={({ pressed }) => [styles.tile, { backgroundColor: accent.bg }, pressed && styles.tilePressed]}
          accessibilityRole="button"
          accessibilityLabel={item.name}
          onPress={() =>
            navigation.navigate('CategoryProducts', {
              categorySlug: item.slug,
              categoryName: item.name,
            })
          }>
          <MaterialIcons name={iconFor(item.slug)} size={36} color={accent.fg} style={styles.tileIcon} />
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
          style={[styles.listContent, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 72 }]}
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
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 72 }]}
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
    borderRadius: 20,
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
  tileIcon: {
    marginBottom: 8,
  },
  tileText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});
