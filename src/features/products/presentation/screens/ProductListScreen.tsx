import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { useGlassScrollInsets } from '../../../../app/navigation/shared/layoutInsets';
import { Product } from '../../domain/models/Product';
import { ProductFilters } from '../../domain/models/ProductFilters';
import { applyProductFilters } from '../../domain/applyProductFilters';
import { GetProducts } from '../../domain/usecases/GetProducts';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { GlassButton } from '../../../../core/ui/GlassButton';

function keyExtractor(item: Product): string {
  return item.id;
}

const SKELETON_KEYS = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'];

type ProductsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductsList'
>;

interface ProductListScreenProps {
  getProducts: GetProducts;
  filters: ProductFilters;
}

export function ProductListScreen({ getProducts, filters }: ProductListScreenProps) {
  const { state, retry } = useProducts(getProducts);
  const navigation = useNavigation<ProductsNavigationProp>();
  const { topInset, scrollInsetProps } = useGlassScrollInsets();
  const insets = useSafeAreaInsets();
  const filteredData = useMemo(
    () => (state.status === 'success' ? applyProductFilters(state.data, filters) : []),
    [state, filters],
  );

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
          accessibilityLabel="Loading properties">
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
            accessibilityLabel="Retry loading properties"
            style={styles.retryButton}
          />
        </View>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>
            No properties found right now. Check back soon.
          </Text>
        </View>
      )}

      {state.status === 'success' && state.data.length > 0 && filteredData.length === 0 && (
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <Text style={styles.centeredText}>No properties match these filters.</Text>
        </View>
      )}

      {state.status === 'success' && filteredData.length > 0 && (
        <FlatList
          data={filteredData}
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
