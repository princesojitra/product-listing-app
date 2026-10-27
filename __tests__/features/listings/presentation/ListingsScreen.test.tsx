import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ListingsScreen } from '../../../../src/features/listings/presentation/screens/ListingsScreen';
import { PropertyDetailsScreen } from '../../../../src/features/listings/presentation/screens/PropertyDetailsScreen';
import { RootStackParamList } from '../../../../src/app/navigation/navigationTypes';
import { Listing } from '../../../../src/features/listings/domain/models/Listing';

const Stack = createNativeStackNavigator<RootStackParamList>();

const sampleListings: Listing[] = [
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
 * `NavigationContainer` isn't enough), so tests render the listing screen
 * through an actual two-route stack rather than in isolation.
 */
function renderNavigator(getListings: jest.Mock) {
  return ReactTestRenderer.create(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Listings">
          {() => <ListingsScreen repository={{ getListings }} />}
        </Stack.Screen>
        <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
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

describe('ListingsScreen', () => {
  let getListings: jest.Mock;

  beforeEach(() => {
    getListings = jest.fn();
  });

  it('shows a loading indicator while the request is in flight', async () => {
    getListings.mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getListings);
    });

    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(findAllText(renderer)).toContain('Loading properties…');
  });

  it('renders listings after a successful fetch', async () => {
    getListings.mockResolvedValue(sampleListings);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getListings);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Sample product 1');
  });

  it('shows an empty state when the fetch succeeds with no listings', async () => {
    getListings.mockResolvedValue([]);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getListings);
    });
    await act(async () => {});

    expect(findAllText(renderer).join(' ')).toMatch(/no properties found/i);
  });

  it('shows an error with a working retry button', async () => {
    getListings
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(sampleListings);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getListings);
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
    expect(getListings).toHaveBeenCalledTimes(2);
  });

  it('does not surface a cancelled request as an ordinary error', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    getListings.mockRejectedValueOnce(abortError);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getListings);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Loading properties…');
    expect(renderer.root.findAllByProps({ children: 'Aborted' })).toHaveLength(0);
  });

  it('does not update state after unmount when a request resolves late', async () => {
    let resolveFetch!: (value: Listing[]) => void;
    getListings.mockReturnValue(
      new Promise<Listing[]>(resolve => {
        resolveFetch = resolve;
      }),
    );

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getListings);
    });

    act(() => {
      renderer.unmount();
    });

    await act(async () => {
      resolveFetch(sampleListings);
    });
    // No assertion beyond "this doesn't throw / warn" — React would log an
    // act()/state-update warning if the hook updated state after unmount.
  });

  it('navigates to the details screen with the selected listing when a card is pressed', async () => {
    getListings.mockResolvedValue(sampleListings);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderNavigator(getListings);
    });
    await act(async () => {});

    const card = renderer.root.findByProps({
      accessibilityLabel: 'Sample product 1, beauty, $9.99, rated 4.5 out of 5',
    });

    await act(async () => {
      (card.props as { onPress: () => void }).onPress();
    });

    // The details screen renders the same listing's full data, proving the
    // correct `Listing` (not just an id) made it through navigation params.
    expect(findAllText(renderer)).toContain('Sample product 1');
    expect(findAllText(renderer)).toContain('A sample product description.');
    expect(findAllText(renderer).join(' ')).toMatch(/beauty/);
  });
});
