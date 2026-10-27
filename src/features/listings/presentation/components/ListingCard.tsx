import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Listing } from '../../domain/models/Listing';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
}

export function ListingCard({ listing, onPress }: ListingCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const ratingLabel = `rated ${listing.rating} out of 5`;
  const formattedPrice = priceFormatter.format(listing.price);

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${listing.category}, ${formattedPrice}, ${ratingLabel}`}>
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
        />
      )}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {listing.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <Text style={styles.rating}>★ {listing.rating}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
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
  details: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  rating: {
    fontSize: 14,
    color: '#374151',
  },
});
