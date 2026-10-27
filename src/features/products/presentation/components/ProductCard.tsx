import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { Product } from '../../domain/models/Product';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TOP_RATED_THRESHOLD = 4.5;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const ratingLabel = `rated ${product.rating} out of 5`;
  const formattedPrice = priceFormatter.format(product.price);
  const category = product.category.replace(/-/g, ' ');

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${product.category}, ${formattedPrice}, ${ratingLabel}`}>
      <View style={styles.imageContainer}>
        {imageFailed ? (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.imageFallbackText}>Image unavailable</Text>
          </View>
        ) : (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            onError={() => setImageFailed(true)}
            accessibilityIgnoresInvertColors
          />
        )}

        {product.rating >= TOP_RATED_THRESHOLD && (
          <View style={styles.topRatedBadge}>
            <Text style={styles.topRatedBadgeText}>Top Rated</Text>
          </View>
        )}

        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={14} color="#facc15" />
          <Text style={styles.ratingBadgeText}>{product.rating}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          <Pressable
            onPress={() => setIsFavorited(value => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            style={styles.favoriteButton}>
            <MaterialIcons
              name={isFavorited ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorited ? '#dc2626' : '#6b7280'}
            />
          </Pressable>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>

        <View style={styles.descriptionRow}>
          <MaterialIcons name="description" size={16} color="#9ca3af" style={styles.descriptionIcon} />
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
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
  topRatedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topRatedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  body: {
    padding: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  title: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  category: {
    marginTop: 2,
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  descriptionIcon: {
    marginTop: 2,
    marginRight: 6,
  },
  description: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#6b7280',
  },
});
