import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProductDetailsParams } from '../../../../app/navigation/navigationTypes';
import { GetProductDetails } from '../../domain/usecases/GetProductDetails';
import { useProductDetails } from '../hooks/useProductDetails';

/**
 * Typed only against its own route's params, not a specific parent stack's
 * full param list — this screen is reused from both the Products tab's
 * stack and the Categories tab's stack (list -> category products ->
 * shared details), and each passes its own (wider) navigation prop, which
 * is structurally compatible with this narrower requirement.
 */
type ProductDetailsOnlyParamList = { ProductDetails: ProductDetailsParams };
type Props = NativeStackScreenProps<ProductDetailsOnlyParamList, 'ProductDetails'> & {
  getProductDetails: GetProductDetails;
};

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function availabilityColor(status: string): string {
  switch (status) {
    case 'In Stock':
      return '#16a34a';
    case 'Low Stock':
      return '#d97706';
    case 'Out of Stock':
      return '#dc2626';
    default:
      return '#374151';
  }
}

export function ProductDetailsScreen({ route, navigation, getProductDetails }: Props) {
  const { productId } = route.params;
  const { state, retry } = useProductDetails(productId, getProductDetails);
  const [imageFailed, setImageFailed] = useState(false);

  // A fresh product id deserves a fresh chance to load its own image,
  // rather than inheriting the previous product's load failure.
  useEffect(() => {
    setImageFailed(false);
  }, [productId]);

  // The header title isn't known until the fetch resolves, since navigation
  // only carries the id — set it once the product's real title is in.
  useEffect(() => {
    if (state.status === 'success') {
      navigation.setOptions({ title: state.data.title });
    }
  }, [state, navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {state.status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            accessibilityLabel="Loading property details"
          />
          <Text style={styles.centeredText}>Loading details…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <Pressable
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading property details"
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {state.status === 'success' && (
        <>
          {imageFailed ? (
            <View style={[styles.image, styles.imageFallback]}>
              <Text style={styles.imageFallbackText}>Image unavailable</Text>
            </View>
          ) : (
            <Image
              source={{ uri: state.data.imageUrl }}
              style={styles.image}
              onError={() => setImageFailed(true)}
              accessibilityIgnoresInvertColors
              accessibilityLabel={`${state.data.title} image`}
            />
          )}

          <View style={styles.body}>
            <Text style={styles.title} accessibilityRole="header">
              {state.data.title}
            </Text>

            {state.data.brand && (
              <Text
                style={styles.brand}
                accessibilityLabel={`Brand: ${state.data.brand}`}>
                by {state.data.brand}
              </Text>
            )}

            <View style={styles.metaRow}>
              {state.data.discountPercentage > 0 ? (
                <View>
                  <Text style={styles.price}>
                    {priceFormatter.format(
                      state.data.price * (1 - state.data.discountPercentage / 100),
                    )}
                  </Text>
                  <View style={styles.discountRow}>
                    <Text style={styles.originalPrice}>
                      {priceFormatter.format(state.data.price)}
                    </Text>
                    <View
                      style={styles.discountBadge}
                      accessibilityLabel={`Discount: ${Math.round(
                        state.data.discountPercentage,
                      )} percent off`}>
                      <Text style={styles.discountBadgeText}>
                        -{Math.round(state.data.discountPercentage)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.price}>
                  {priceFormatter.format(state.data.price)}
                </Text>
              )}
              <View
                style={styles.categoryBadge}
                accessibilityLabel={`Category: ${state.data.category}`}>
                <Text style={styles.categoryBadgeText}>{state.data.category}</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Text
                style={styles.rating}
                accessibilityLabel={`Rated ${state.data.rating} out of 5`}>
                ★ {state.data.rating} / 5
              </Text>
              <Text
                style={[
                  styles.availability,
                  { color: availabilityColor(state.data.availabilityStatus) },
                ]}
                accessibilityLabel={`Availability: ${state.data.availabilityStatus}`}>
                {state.data.availabilityStatus}
              </Text>
            </View>

            {state.data.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {state.data.tags.map(tag => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.description}>{state.data.description}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 32,
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
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#e1e4e8',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: '#6b7280',
    fontSize: 14,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  brand: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountBadgeText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#e0e7ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#3730a3',
    fontSize: 13,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  rating: {
    fontSize: 16,
    color: '#374151',
  },
  availability: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagChipText: {
    fontSize: 12,
    color: '#374151',
  },
  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
});
