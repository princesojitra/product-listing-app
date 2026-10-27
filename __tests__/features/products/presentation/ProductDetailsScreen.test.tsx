import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from '../../../../src/features/products/presentation/screens/ProductListScreen';
import { ProductDetailsScreen } from '../../../../src/features/products/presentation/screens/ProductDetailsScreen';
import { RootStackParamList } from '../../../../src/app/navigation/navigationTypes';
import { Product } from '../../../../src/features/products/domain/models/Product';
import { ProductDetails } from '../../../../src/features/products/domain/models/ProductDetails';

const Stack = createNativeStackNavigator<RootStackParamList>();

// The list card only needs the list-level `Product` shape.
const sampleProduct: Product = {
  id: '1',
  title: 'Sample product 1',
  description: 'A sample product description.',
  price: 9.99,
  category: 'beauty',
  rating: 4.5,
  imageUrl: 'https://dummyjson.com/images/products/1/thumbnail.webp',
};

// The details screen fetches the richer `ProductDetails` shape independently.
const sampleProductDetails: ProductDetails = {
  id: '1',
  title: 'Sample product 1',
  description: 'A sample product description.',
  price: 9.99,
  discountPercentage: 0,
  category: 'beauty',
  rating: 4.5,
  brand: 'SampleBrand',
  stock: 42,
  availabilityStatus: 'In Stock',
  tags: ['beauty', 'mascara'],
  imageUrl: 'https://dummyjson.com/images/products/1/thumbnail.webp',
  images: ['https://dummyjson.com/images/products/1/thumbnail.webp'],
};

function findAllText(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');
}

/**
 * The details screen is only ever reached via navigation (it has no
 * standalone route-param-free entry point), so tests get there the same
 * way a user would: through the real stack, by pressing the product card.
 * `getProductDetails` is the thing each test actually configures;
 * `getProducts` only needs to resolve so the card exists to tap.
 */
async function navigateToDetails(
  getProductDetails: jest.Mock,
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>,
) {
  const getProducts = jest.fn().mockResolvedValue([sampleProduct]);

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen name="Products">
            {() => <ProductListScreen getProducts={getProducts} />}
          </Stack.Screen>
          <Stack.Screen name="ProductDetails">
            {props => (
              <ProductDetailsScreen {...props} getProductDetails={getProductDetails} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>,
    );
  });
  await act(async () => {});

  const card = renderer.root.findByProps({
    accessibilityLabel: 'Sample product 1, beauty, $9.99, rated 4.5 out of 5',
  });
  await act(async () => {
    (card.props as { onPress: () => void }).onPress();
  });

  return renderer;
}

describe('ProductDetailsScreen', () => {
  it('shows a loading indicator while the details request is in flight', async () => {
    const getProductDetails = jest.fn().mockReturnValue(new Promise(() => {}));
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(getProductDetails, navigationRef);

    expect(getProductDetails).toHaveBeenCalledWith('1', expect.anything());
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(findAllText(renderer)).toContain('Loading details…');
  });

  it('displays the fetched product title, price, category, rating, brand, stock and tags', async () => {
    const getProductDetails = jest.fn().mockResolvedValue(sampleProductDetails);
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(getProductDetails, navigationRef);
    await act(async () => {});

    const texts = findAllText(renderer);
    expect(texts).toContain('Sample product 1');
    expect(texts).toContain('$9.99');
    expect(texts).toContain('beauty');
    expect(texts).toContain('A sample product description.');
    expect(texts).toContain('mascara');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Rated 4.5 out of 5' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Availability: In Stock' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Brand: SampleBrand' }),
    ).toBeTruthy();
  });

  it('shows the discounted price and original price when a discount applies', async () => {
    const getProductDetails = jest
      .fn()
      .mockResolvedValue({ ...sampleProductDetails, discountPercentage: 10 });
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(getProductDetails, navigationRef);
    await act(async () => {});

    const texts = findAllText(renderer);
    expect(texts).toContain('$8.99'); // 9.99 - 10%
    expect(texts).toContain('$9.99'); // original, struck through
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Discount: 10 percent off' }),
    ).toBeTruthy();
  });

  it('shows an error with a working retry button', async () => {
    const getProductDetails = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(sampleProductDetails);
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(getProductDetails, navigationRef);
    await act(async () => {});

    expect(findAllText(renderer)).toContain('boom');

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Retry loading property details',
    });
    await act(async () => {
      (retryButton.props as { onPress: () => void }).onPress();
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Sample product 1');
    expect(getProductDetails).toHaveBeenCalledTimes(2);
  });

  it('does not surface a cancelled request as an ordinary error', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    const getProductDetails = jest.fn().mockRejectedValueOnce(abortError);
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(getProductDetails, navigationRef);
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Loading details…');
    expect(renderer.root.findAllByProps({ children: 'Aborted' })).toHaveLength(0);
  });

  it('shows a fallback when the product image fails to load', async () => {
    const getProductDetails = jest.fn().mockResolvedValue(sampleProductDetails);
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(getProductDetails, navigationRef);
    await act(async () => {});

    // The product card's thumbnail is also still mounted underneath the
    // native-stack transition, so the hero image is found by its own label.
    const image = renderer.root.findByProps({
      accessibilityLabel: 'Sample product 1 image',
    });
    await act(async () => {
      (image.props as { onError: () => void }).onError();
    });

    expect(findAllText(renderer)).toContain('Image unavailable');
  });

  it('returns to the products screen on back navigation', async () => {
    const getProductDetails = jest.fn().mockResolvedValue(sampleProductDetails);
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(getProductDetails, navigationRef);
    await act(async () => {});

    expect(navigationRef.current?.getCurrentRoute()?.name).toBe('ProductDetails');

    await act(async () => {
      navigationRef.current?.goBack();
    });

    expect(navigationRef.current?.getCurrentRoute()?.name).toBe('Products');
    expect(findAllText(renderer)).toContain('Sample product 1');
  });
});
