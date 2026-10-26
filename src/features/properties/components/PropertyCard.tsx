import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Property } from '../types/property';

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const bedroomsLabel = `${property.bedrooms} ${
    property.bedrooms === 1 ? 'bedroom' : 'bedrooms'
  }`;
  const formattedPrice = priceFormatter.format(property.price);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${property.title}, ${property.location}, ${formattedPrice}, ${bedroomsLabel}`}>
      {imageFailed ? (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.imageFallbackText}>Image unavailable</Text>
        </View>
      ) : (
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.image}
          onError={() => setImageFailed(true)}
          accessibilityIgnoresInvertColors
        />
      )}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>
        <Text style={styles.location}>{property.location}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <Text style={styles.bedrooms}>{bedroomsLabel}</Text>
        </View>
      </View>
    </View>
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
  location: {
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
  bedrooms: {
    fontSize: 14,
    color: '#374151',
  },
});
