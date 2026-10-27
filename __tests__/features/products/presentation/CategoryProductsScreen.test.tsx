import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoryProductsScreen } from '../../../../src/features/products/presentation/screens/CategoryProductsScreen';
import { ProductDetailsScreen } from '../../../../src/features/products/presentation/screens/ProductDetailsScreen';
import { CategoriesStackParamList } from '../../../../src/app/navigation/navigationTypes';
import { Product } from '../../../../src/features/products/domain/models/Product';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

const sampleProducts: Product[] = [
  {
    id: '121',
    title: 'iPhone 5s',
    description: 'A classic smartphone.',
    price: 199.99,
    category: 'smartphones',
    rating: 2.83,
    imageUrl: 'https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp',
  },
];

function findAllText(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');
}

function renderNavigator(getProductsByCategory: jest.Mock, getProductDetails: jest.Mock = jest.fn()) {
  return ReactTestRenderer.create(
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CategoryProducts">
        <Stack.Screen
          name="CategoryProducts"
          initialParams={{ categorySlug: 'smartphones', categoryName: 'Smartphones' }}>
          {props => (
            <CategoryProductsScreen {...props} getProductsByCategory={getProductsByCategory} />
          )}
        </Stack.Screen>
        <Stack.Screen name="ProductDetails">
          {props => <ProductDetailsScreen {...props} getProductDetails={getProductDetails} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('CategoryProductsScreen', () => {
  let getProductsByCategory: jest.Mock;

  beforeEach(() => {
    getProductsByCategory = jest.fn();
  });

  it('fetches products for the given category slug', async () => {
    getProductsByCategory.mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });

    expect(getProductsByCategory).toHaveBeenCalledWith('smartphones', expect.anything());
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(findAllText(renderer)).toContain('Loading products…');
  });

  it('renders products after a successful fetch', async () => {
    getProductsByCategory.mockResolvedValue(sampleProducts);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('iPhone 5s');
  });

  it('shows an empty state when the category has no products', async () => {
    getProductsByCategory.mockResolvedValue([]);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    expect(findAllText(renderer).join(' ')).toMatch(/no products found in this category/i);
  });

  it('shows an error with a working retry button', async () => {
    getProductsByCategory
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(sampleProducts);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('boom');

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Retry loading products',
    });
    await act(async () => {
      (retryButton.props as { onPress: () => void }).onPress();
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('iPhone 5s');
    expect(getProductsByCategory).toHaveBeenCalledTimes(2);
  });

  it('navigates to the shared ProductDetails screen with only the product id when a card is pressed', async () => {
    getProductsByCategory.mockResolvedValue(sampleProducts);
    const getProductDetails = jest.fn().mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory, getProductDetails);
    });
    await act(async () => {});

    const card = renderer.root.findByProps({
      accessibilityLabel: 'iPhone 5s, smartphones, $199.99, rated 2.83 out of 5',
    });
    await act(async () => {
      (card.props as { onPress: () => void }).onPress();
    });

    expect(getProductDetails).toHaveBeenCalledWith('121', expect.anything());
  });
});
