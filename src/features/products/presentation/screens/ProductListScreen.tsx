import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { useGlassScrollInsets } from '../../../../app/navigation/shared/layoutInsets';
import { Product } from '../../domain/models/Product';
import { GetProducts } from '../../domain/usecases/GetProducts';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { GlassButton } from '../../../../core/ui/GlassButton';

function keyExtractor(item: Product): string {
  return item.id;
}

type ProductsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductsList'
>;

interface ProductListScreenProps {
  getProducts: GetProducts;
}

export function ProductListScreen({ getProducts }: ProductListScreenProps) {
  const { state, retry } = useProducts(getProducts);
  const navigation = useNavigation<ProductsNavigationProp>();
  const { topInset, scrollInsetProps } = useGlassScrollInsets();

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
        <View style={[styles.centered, { paddingTop: topInset }]}>
          <ActivityIndicator
            size="large"
            accessibilityLabel="Loading properties"
          />
          <Text style={styles.centeredText}>Loading properties…</Text>
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

      {state.status === 'success' && state.data.length > 0 && (
        <FlatList
          data={state.data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  },
});
