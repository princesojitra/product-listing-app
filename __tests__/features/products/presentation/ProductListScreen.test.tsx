import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from '../../../../src/features/products/presentation/screens/ProductListScreen';
import { ProductDetailsScreen } from '../../../../src/features/products/presentation/screens/ProductDetailsScreen';
import { RootStackParamList } from '../../../../src/app/navigation/types';
import { Product } from '../../../../src/features/products/domain/models/Product';

const Stack = createNativeStackNavigator<RootStackParamList>();

const sampleProducts: Product[] = [
  {
    id: '1',
    title: 'Sample product 1',
    description: 'A sample product description.',
    price: 9.99,
    category: 'beauty',
    rating: 4.5,
    imageUrl: 'https://dummyjson.com/images/products/1/thumbnail.webp',
  },
];

/**
 * `useNavigation()` needs a real Navigator ancestor (a bare
 * `NavigationContainer` isn't enough), so tests render the list screen
 * through an actual two-route stack rather than in isolation.
 */
function renderNavigator(getProducts: jest.Mock, getProductDetails: jest.Mock = jest.fn()) {
  return ReactTestRenderer.create(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ProductsList">
          {() => <ProductListScreen getProducts={getProducts} />}
        </Stack.Screen>
        <Stack.Screen name="ProductDetails">
          {props => <ProductDetailsScreen {...props} getProductDetails={getProductDetails} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

function findAllText(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');
}

describe('ProductListScreen', () => {
  let getProducts: jest.Mock;

  beforeEach(() => {
    getProducts = jest.fn();
  });

  it('shows a loading indicator while the request is in flight', async () => {
    getProducts.mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProducts);
    });

    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(findAllText(renderer)).toContain('Loading properties…');
  });

  it('renders products after a successful fetch', async () => {
    getProducts.mockResolvedValue(sampleProducts);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProducts);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Sample product 1');
  });

  it('shows an empty state when the fetch succeeds with no products', async () => {
    getProducts.mockResolvedValue([]);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProducts);
    });
    await act(async () => {});

    expect(findAllText(renderer).join(' ')).toMatch(/no properties found/i);
  });

  it('shows an error with a working retry button', async () => {
    getProducts
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(sampleProducts);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProducts);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('boom');

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Retry loading properties',
    });

    await act(async () => {
      (retryButton.props as { onPress: () => void }).onPress();
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Sample product 1');
    expect(getProducts).toHaveBeenCalledTimes(2);
  });

  it('does not surface a cancelled request as an ordinary error', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    getProducts.mockRejectedValueOnce(abortError);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProducts);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Loading properties…');
    expect(renderer.root.findAllByProps({ children: 'Aborted' })).toHaveLength(0);
  });

  it('does not update state after unmount when a request resolves late', async () => {
    let resolveFetch!: (value: Product[]) => void;
    getProducts.mockReturnValue(
      new Promise<Product[]>(resolve => {
        resolveFetch = resolve;
      }),
    );

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProducts);
    });

    act(() => {
      renderer.unmount();
    });

    await act(async () => {
      resolveFetch(sampleProducts);
    });
    // No assertion beyond "this doesn't throw / warn" — React would log an
    // act()/state-update warning if the hook updated state after unmount.
  });

  it('navigates to the details screen with only the selected product id', async () => {
    getProducts.mockResolvedValue(sampleProducts);
    const getProductDetails = jest.fn().mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getProducts, getProductDetails);
    });
    await act(async () => {});

    const card = renderer.root.findByProps({
      accessibilityLabel: 'Sample product 1, beauty, $9.99, rated 4.5 out of 5',
    });

    await act(async () => {
      (card.props as { onPress: () => void }).onPress();
    });

    // Proves navigation carried only the id (not the full Product): the
    // details screen fetches by id, and that's the only thing it could have
    // used to make this exact call.
    expect(getProductDetails).toHaveBeenCalledWith('1', expect.anything());
  });
});
