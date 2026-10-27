import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoryProductsScreen } from '../../../../src/features/products/presentation/screens/CategoryProductsScreen';
import { ProductDetailsScreen } from '../../../../src/features/products/presentation/screens/ProductDetailsScreen';
import { ProductCardSkeleton } from '../../../../src/features/products/presentation/components/ProductCardSkeleton';
import { CategoriesStackParamList } from '../../../../src/app/navigation/types';
import { Product } from '../../../../src/features/products/domain/models/Product';
import { ProductsPage } from '../../../../src/features/products/domain/models/ProductsPage';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

const productA: Product = {
  id: '121',
  title: 'iPhone 5s',
  description: 'A classic smartphone.',
  price: 199.99,
  category: 'smartphones',
  rating: 2.83,
  imageUrl: 'https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp',
};

const productB: Product = {
  id: '122',
  title: 'iPhone 6',
  description: 'Another classic smartphone.',
  price: 299.99,
  category: 'smartphones',
  rating: 3.5,
  imageUrl: 'https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp',
};

function pageOf(products: Product[], total: number): ProductsPage {
  return { products, total };
}

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

async function triggerEndReached(renderer: ReactTestRenderer.ReactTestRenderer) {
  const list = renderer.root.findByType(FlatList);
  await act(async () => {
    (list.props as { onEndReached: () => void }).onEndReached();
  });
}

describe('CategoryProductsScreen', () => {
  let getProductsByCategory: jest.Mock;

  beforeEach(() => {
    getProductsByCategory = jest.fn();
  });

  it('fetches the first page for the given category with limit=10 and skip=0', async () => {
    getProductsByCategory.mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });

    expect(getProductsByCategory).toHaveBeenCalledWith('smartphones', 10, 0, expect.anything());
    expect(renderer.root.findAllByType(ProductCardSkeleton)).toHaveLength(4);
  });

  it('renders products after a successful fetch', async () => {
    getProductsByCategory.mockResolvedValue(pageOf([productA], 1));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('iPhone 5s');
  });

  it('shows an empty state when the category has no products', async () => {
    getProductsByCategory.mockResolvedValue(pageOf([], 0));

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
      .mockResolvedValueOnce(pageOf([productA], 1));

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
    expect(getProductsByCategory).toHaveBeenNthCalledWith(2, 'smartphones', 10, 0, expect.anything());
  });

  it('navigates to the shared ProductDetails screen with only the product id when a card is pressed', async () => {
    getProductsByCategory.mockResolvedValue(pageOf([productA], 1));
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

  it('loads and appends the next page when the list end is reached', async () => {
    getProductsByCategory
      .mockResolvedValueOnce(pageOf([productA], 2))
      .mockResolvedValueOnce(pageOf([productB], 2));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    await triggerEndReached(renderer);

    expect(getProductsByCategory).toHaveBeenCalledTimes(2);
    expect(getProductsByCategory).toHaveBeenNthCalledWith(2, 'smartphones', 10, 1, expect.anything());
    const texts = findAllText(renderer);
    expect(texts).toContain('iPhone 5s');
    expect(texts).toContain('iPhone 6');
  });

  it('stops requesting more pages once every product has been loaded', async () => {
    getProductsByCategory.mockResolvedValue(pageOf([productA], 1));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    await triggerEndReached(renderer);
    await triggerEndReached(renderer);

    expect(getProductsByCategory).toHaveBeenCalledTimes(1);
  });

  it('does not issue a second request while a page is already loading (rapid scrolling)', async () => {
    let resolveSecondPage!: (page: ProductsPage) => void;
    getProductsByCategory
      .mockResolvedValueOnce(pageOf([productA], 2))
      .mockReturnValueOnce(new Promise<ProductsPage>(resolve => (resolveSecondPage = resolve)));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    const list = renderer.root.findByType(FlatList);
    await act(async () => {
      (list.props as { onEndReached: () => void }).onEndReached();
      (list.props as { onEndReached: () => void }).onEndReached();
      (list.props as { onEndReached: () => void }).onEndReached();
    });

    expect(getProductsByCategory).toHaveBeenCalledTimes(2);
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);

    await act(async () => {
      resolveSecondPage(pageOf([productB], 2));
    });

    expect(getProductsByCategory).toHaveBeenCalledTimes(2);
  });

  it('keeps the loaded products and offers a retry when loading the next page fails', async () => {
    getProductsByCategory
      .mockResolvedValueOnce(pageOf([productA], 2))
      .mockRejectedValueOnce(new Error('load more boom'))
      .mockResolvedValueOnce(pageOf([productB], 2));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProductsByCategory);
    });
    await act(async () => {});

    await triggerEndReached(renderer);

    expect(findAllText(renderer)).toContain('iPhone 5s');
    expect(findAllText(renderer)).toContain('load more boom');

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Retry loading more products',
    });
    await act(async () => {
      (retryButton.props as { onPress: () => void }).onPress();
    });
    await act(async () => {});

    expect(getProductsByCategory).toHaveBeenCalledTimes(3);
    expect(getProductsByCategory).toHaveBeenNthCalledWith(3, 'smartphones', 10, 1, expect.anything());
    const texts = findAllText(renderer);
    expect(texts).toContain('iPhone 5s');
    expect(texts).toContain('iPhone 6');
  });
});
