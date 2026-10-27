import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetails'>;

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function PropertyDetailsScreen({ route }: Props) {
  const { listing } = route.params;
  const [imageFailed, setImageFailed] = useState(false);
  const formattedPrice = priceFormatter.format(listing.price);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      {imageFailed ? (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.imageFallbackText}>Image unavailable</Text>
        </View>
      ) : (
        <Image
          source={{ uri: listing.imageUrl }}
          style={styles.image}
          onError={() => setImageFailed(true)}
          accessibilityIgnoresInvertColors
          accessibilityLabel={`${listing.title} image`}
        />
      )}

      <View style={styles.body}>
        <Text style={styles.title} accessibilityRole="header">
          {listing.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <View
            style={styles.categoryBadge}
            accessibilityLabel={`Category: ${listing.category}`}>
            <Text style={styles.categoryBadgeText}>{listing.category}</Text>
          </View>
        </View>

        <Text
          style={styles.rating}
          accessibilityLabel={`Rated ${listing.rating} out of 5`}>
          ★ {listing.rating} / 5
        </Text>

        <Text style={styles.description}>{listing.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    paddingBottom: 32,
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
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
  rating: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
  },
  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
});
