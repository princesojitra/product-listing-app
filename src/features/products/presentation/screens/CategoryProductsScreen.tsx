import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from '../../../../app/navigation/types';
import { useGlassScrollInsets } from '../../../../app/navigation/shared/layoutInsets';
import { Product } from '../../domain/models/Product';
import { GetProductsByCategory } from '../../domain/usecases/GetProductsByCategory';
import { useProductsByCategory } from '../hooks/useProductsByCategory';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { GlassButton } from '../../../../core/ui/GlassButton';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'CategoryProducts'> & {
  getProductsByCategory: GetProductsByCategory;
};

function keyExtractor(item: Product): string {
  return item.id;
}

const SKELETON_KEYS = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'];

export function CategoryProductsScreen({ route, navigation, getProductsByCategory }: Props) {
  const { categorySlug } = route.params;
  const { state, retry } = useProductsByCategory(categorySlug, getProductsByCategory);
  const { topInset, scrollInsetProps } = useGlassScrollInsets();
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      />
    ),
    [navigation],
  );

  return (
    <View style={styles.container}>
      {state.status === 'loading' && (
        <View
          style={{ paddingTop: topInset + 16 }}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading products">
          {SKELETON_KEYS.map(key => (
            <ProductCardSkeleton key={key} />
          ))}
        </View>
      )}

      {state.status === 'error' && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <GlassButton
            label="Retry"
            onPress={retry}
            accessibilityLabel="Retry loading products"
            style={styles.retryButton}
          />
        </View>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>
            No products found in this category right now.
          </Text>
        </View>
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <FlatList
          data={state.data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
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
    paddingTop: 16,
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
});
