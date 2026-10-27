import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { ProductDetailsParams } from '../../../../app/navigation/types';
import { useGlassScrollInsets, tabBarBottomPadding } from '../../../../app/navigation/shared/layoutInsets';
import { usePulseOpacity } from '../../../../core/ui/usePulseOpacity';
import { ProductReview } from '../../domain/models/ProductDetails';
import { GetProductDetails } from '../../domain/usecases/GetProductDetails';
import { useProductDetails } from '../hooks/useProductDetails';
import { GlassButton } from '../../../../core/ui/GlassButton';

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

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
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

function availabilityBackground(status: string): string {
  switch (status) {
    case 'In Stock':
      return '#dcfce7';
    case 'Low Stock':
      return '#fef3c7';
    case 'Out of Stock':
      return '#fee2e2';
    default:
      return '#f3f4f6';
  }
}

interface ImageSlideProps {
  uri: string;
  width: number;
  label: string;
}

/** One carousel slide: shows a pulsing placeholder until the image loads, or a fallback if it fails. */
function ImageSlide({ uri, width, label }: ImageSlideProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const opacity = usePulseOpacity();

  return (
    <View style={[styles.slide, { width }]}>
      {status === 'error' ? (
        <View style={[styles.slideImage, styles.slideFallback]}>
          <Text style={styles.imageFallbackText}>Image unavailable</Text>
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={styles.slideImage}
          resizeMode="cover"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          accessibilityIgnoresInvertColors
          accessibilityLabel={label}
        />
      )}
      {status === 'loading' && <Animated.View style={[styles.slidePlaceholder, { opacity }]} />}
    </View>
  );
}

interface ImageCarouselProps {
  images: string[];
  title: string;
  rating: number;
}

/** Full-bleed, swipeable image gallery with a page counter, dot indicators, and a rating badge. */
function ImageCarousel({ images, title, rating }: ImageCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(uri, index) => `${uri}-${index}`}
        renderItem={({ item, index }) => (
          <ImageSlide
            uri={item}
            width={width}
            label={index === 0 ? `${title} image` : `${title} image ${index + 1}`}
          />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {images.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      <View style={styles.ratingBadgeOverlay}>
        <MaterialIcons name="star" size={14} color="#facc15" />
        <Text style={styles.ratingBadgeOverlayText}>{rating}</Text>
      </View>

      {images.length > 1 && (
        <View style={styles.dotsRow} pointerEvents="none">
          {images.map((uri, index) => (
            <View
              key={`${uri}-${index}`}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface DetailRowProps {
  icon: MaterialIconName;
  label: string;
  value: string;
  last?: boolean;
}

/** One label/value row inside a details card, e.g. "SKU — BEA-ESS-001". */
function DetailRow({ icon, label, value, last }: DetailRowProps) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <View style={styles.detailIcon}>
        <MaterialIcons name={icon} size={18} color="#6b7280" />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function reviewStars(rating: number): string {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{review.reviewerName}</Text>
        <Text style={styles.reviewStars} accessibilityLabel={`Rated ${review.rating} out of 5`}>
          {reviewStars(review.rating)}
        </Text>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <Text style={styles.reviewDate}>{dateFormatter.format(new Date(review.date))}</Text>
    </View>
  );
}

export function ProductDetailsScreen({ route, navigation, getProductDetails }: Props) {
  const { productId } = route.params;
  const { state, retry } = useProductDetails(productId, getProductDetails);
  const { scrollInsetProps } = useGlassScrollInsets();
  const insets = useSafeAreaInsets();

  // The header title isn't known until the fetch resolves, since navigation
  // only carries the id — set it once the product's real title is in.
  useEffect(() => {
    if (state.status === 'success') {
      navigation.setOptions({ title: state.data.title });
    }
  }, [state, navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarBottomPadding(insets.bottom) }]}
      {...scrollInsetProps}>
      {state.status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            accessibilityLabel="Loading product details"
          />
          <Text style={styles.centeredText}>Loading details…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <GlassButton
            label="Retry"
            onPress={retry}
            accessibilityLabel="Retry loading product details"
            style={styles.retryButton}
          />
        </View>
      )}

      {state.status === 'success' && (
        <>
          <ImageCarousel
            images={state.data.images}
            title={state.data.title}
            rating={state.data.rating}
          />

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

            {state.data.discountPercentage > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {priceFormatter.format(
                    state.data.price * (1 - state.data.discountPercentage / 100),
                  )}
                </Text>
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
            ) : (
              <Text style={styles.price}>{priceFormatter.format(state.data.price)}</Text>
            )}

            <View style={styles.chipsRow}>
              <View
                style={styles.categoryBadge}
                accessibilityLabel={`Category: ${state.data.category}`}>
                <Text style={styles.categoryBadgeText}>{state.data.category}</Text>
              </View>
              <View
                style={[
                  styles.availabilityBadge,
                  { backgroundColor: availabilityBackground(state.data.availabilityStatus) },
                ]}
                accessibilityLabel={`Availability: ${state.data.availabilityStatus}`}>
                <View
                  style={[
                    styles.availabilityDot,
                    { backgroundColor: availabilityColor(state.data.availabilityStatus) },
                  ]}
                />
                <Text
                  style={[
                    styles.availabilityBadgeText,
                    { color: availabilityColor(state.data.availabilityStatus) },
                  ]}>
                  {state.data.availabilityStatus}
                </Text>
              </View>
            </View>

            {(() => {
              // Tags that just repeat the category badge above (e.g. a
              // "beauty" product tagged "beauty") would show the same word
              // twice — drop those rather than list a tag redundantly.
              const otherTags = state.data.tags.filter(
                tag => tag.toLowerCase() !== state.data.category.toLowerCase(),
              );
              return (
                otherTags.length > 0 && (
                  <View style={styles.tagsRow}>
                    <MaterialIcons name="local-offer" size={14} color="#9ca3af" />
                    <Text style={styles.tagsRowText} numberOfLines={1}>
                      {otherTags.join('  ·  ')}
                    </Text>
                  </View>
                )
              );
            })()}

            <Text style={styles.description}>{state.data.description}</Text>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Product details</Text>
              <DetailRow icon="confirmation-number" label="SKU" value={state.data.sku} />
              <DetailRow
                icon="inventory-2"
                label="Stock"
                value={`${state.data.stock} units`}
              />
              <DetailRow
                icon="shopping-cart"
                label="Min. order"
                value={`${state.data.minimumOrderQuantity} units`}
              />
              <DetailRow icon="scale" label="Weight" value={`${state.data.weight}`} />
              <DetailRow
                icon="straighten"
                label="Dimensions (W×H×D)"
                value={`${state.data.dimensions.width} × ${state.data.dimensions.height} × ${state.data.dimensions.depth}`}
                last
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Shipping &amp; returns</Text>
              <DetailRow
                icon="local-shipping"
                label="Shipping"
                value={state.data.shippingInformation}
              />
              <DetailRow
                icon="verified-user"
                label="Warranty"
                value={state.data.warrantyInformation}
              />
              <DetailRow
                icon="assignment-return"
                label="Returns"
                value={state.data.returnPolicy}
                last
              />
            </View>

            {state.data.reviews.length > 0 && (
              <View style={styles.reviewsSection}>
                <View style={styles.reviewsSectionHeader}>
                  <Text style={styles.sectionTitle}>{`Reviews (${state.data.reviews.length})`}</Text>
                  <Text
                    style={styles.rating}
                    accessibilityLabel={`Rated ${state.data.rating} out of 5`}>
                    ★ {state.data.rating} / 5
                  </Text>
                </View>
                {state.data.reviews.map((review, index) => (
                  <ReviewCard key={`${review.reviewerName}-${index}`} review={review} />
                ))}
              </View>
            )}
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
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 96,
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
  carouselContainer: {
    position: 'relative',
  },
  slide: {
    height: 280,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e4e8',
  },
  slidePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e5e7eb',
  },
  slideFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: '#6b7280',
    fontSize: 14,
  },
  ratingBadgeOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingBadgeOverlayText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    width: 16,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 15,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#e0e7ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    color: '#3730a3',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rating: {
    fontSize: 15,
    color: '#374151',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  tagsRowText: {
    flex: 1,
    fontSize: 13,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  sectionCard: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  detailIcon: {
    width: 28,
    alignItems: 'flex-start',
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  reviewsSection: {
    marginTop: 24,
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  reviewStars: {
    fontSize: 13,
    color: '#facc15',
  },
  reviewComment: {
    marginTop: 6,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  reviewDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
  },
});
