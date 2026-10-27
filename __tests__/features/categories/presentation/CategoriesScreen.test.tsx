import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoriesScreen } from '../../../../src/features/categories/presentation/screens/CategoriesScreen';
import { CategoryProductsScreen } from '../../../../src/features/products/presentation/screens/CategoryProductsScreen';
import { ProductDetailsScreen } from '../../../../src/features/products/presentation/screens/ProductDetailsScreen';
import { CategoriesStackParamList } from '../../../../src/app/navigation/types';
import { Category } from '../../../../src/features/categories/domain/models/Category';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

const sampleCategories: Category[] = [
  { slug: 'beauty', name: 'Beauty' },
  { slug: 'fragrances', name: 'Fragrances' },
];

/**
 * `useNavigation()` needs a real Navigator ancestor (a bare
 * `NavigationContainer` isn't enough), so tests render the list screen
 * through an actual stack rather than in isolation.
 */
function renderNavigator(
  getCategories: jest.Mock,
  getProductsByCategory: jest.Mock = jest.fn(),
  getProductDetails: jest.Mock = jest.fn(),
) {
  return ReactTestRenderer.create(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="CategoriesList">
          {() => <CategoriesScreen getCategories={getCategories} />}
        </Stack.Screen>
        <Stack.Screen name="CategoryProducts">
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

function findAllText(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');
}

describe('CategoriesScreen', () => {
  let getCategories: jest.Mock;

  beforeEach(() => {
    getCategories = jest.fn();
  });

  it('shows a loading indicator while the request is in flight', async () => {
    getCategories.mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getCategories);
    });

    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(findAllText(renderer)).toContain('Loading categories…');
  });

  it('renders categories after a successful fetch', async () => {
    getCategories.mockResolvedValue(sampleCategories);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getCategories);
    });
    await act(async () => {});

    const texts = findAllText(renderer);
    expect(texts).toContain('Beauty');
    expect(texts).toContain('Fragrances');
  });

  it('shows an empty state when the fetch succeeds with no categories', async () => {
    getCategories.mockResolvedValue([]);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getCategories);
    });
    await act(async () => {});

    expect(findAllText(renderer).join(' ')).toMatch(/no categories found/i);
  });

  it('shows an error with a working retry button', async () => {
    getCategories
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(sampleCategories);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getCategories);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('boom');

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Retry loading categories',
    });

    await act(async () => {
      (retryButton.props as { onPress: () => void }).onPress();
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Beauty');
    expect(getCategories).toHaveBeenCalledTimes(2);
  });

  it('does not surface a cancelled request as an ordinary error', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    getCategories.mockRejectedValueOnce(abortError);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getCategories);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Loading categories…');
    expect(renderer.root.findAllByProps({ children: 'Aborted' })).toHaveLength(0);
  });

  it('does not update state after unmount when a request resolves late', async () => {
    let resolveFetch!: (value: Category[]) => void;
    getCategories.mockReturnValue(
      new Promise<Category[]>(resolve => {
        resolveFetch = resolve;
      }),
    );

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getCategories);
    });

    act(() => {
      renderer.unmount();
    });

    await act(async () => {
      resolveFetch(sampleCategories);
    });
    // No assertion beyond "this doesn't throw / warn" — React would log an
    // act()/state-update warning if the hook updated state after unmount.
  });

  it('navigates to CategoryProducts with the selected category slug and name when tapped', async () => {
    getCategories.mockResolvedValue(sampleCategories);
    const getProductsByCategory = jest.fn().mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getCategories, getProductsByCategory);
    });
    await act(async () => {});

    const row = renderer.root.findByProps({ accessibilityLabel: 'Beauty' });
    await act(async () => {
      (row.props as { onPress: () => void }).onPress();
    });

    expect(getProductsByCategory).toHaveBeenCalledWith('beauty', expect.anything());
  });
});
