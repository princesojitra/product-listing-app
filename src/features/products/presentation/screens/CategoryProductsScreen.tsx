import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from '../../../../app/navigation/navigationTypes';
import { Product } from '../../domain/models/Product';
import { GetProductsByCategory } from '../../domain/usecases/GetProductsByCategory';
import { useProductsByCategory } from '../hooks/useProductsByCategory';
import { ProductCard } from '../components/ProductCard';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'CategoryProducts'> & {
  getProductsByCategory: GetProductsByCategory;
};

function keyExtractor(item: Product): string {
  return item.id;
}

export function CategoryProductsScreen({ route, navigation, getProductsByCategory }: Props) {
  const { categorySlug } = route.params;
  const { state, retry } = useProductsByCategory(categorySlug, getProductsByCategory);

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
        <View style={styles.centered}>
          <ActivityIndicator size="large" accessibilityLabel="Loading products" />
          <Text style={styles.centeredText}>Loading products…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <Pressable
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading products"
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <View style={styles.centered}>
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
          contentContainerStyle={styles.listContent}
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
    paddingBottom: 24,
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
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
