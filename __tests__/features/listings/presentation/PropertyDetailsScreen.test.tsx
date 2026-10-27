import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ListingsScreen } from '../../../../src/features/listings/presentation/screens/ListingsScreen';
import { PropertyDetailsScreen } from '../../../../src/features/listings/presentation/screens/PropertyDetailsScreen';
import { RootStackParamList } from '../../../../src/app/navigation/navigationTypes';
import { Listing } from '../../../../src/features/listings/domain/models/Listing';

const Stack = createNativeStackNavigator<RootStackParamList>();

const sampleListing: Listing = {
  id: '1',
  title: 'Sample product 1',
  description: 'A sample product description.',
  price: 9.99,
  category: 'beauty',
  rating: 4.5,
  imageUrl: 'https://dummyjson.com/images/products/1/thumbnail.webp',
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
 * way a user would: through the real stack, by pressing the listing card.
 */
async function navigateToDetails(
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>,
) {
  const getListings = jest.fn().mockResolvedValue([sampleListing]);

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen name="Listings">
            {() => <ListingsScreen repository={{ getListings }} />}
          </Stack.Screen>
          <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
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

describe('PropertyDetailsScreen', () => {
  it('displays the selected listing title, price, category, rating and description', async () => {
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(navigationRef);

    expect(navigationRef.current?.getCurrentRoute()?.name).toBe('PropertyDetails');
    const texts = findAllText(renderer);
    expect(texts).toContain('Sample product 1');
    expect(texts).toContain('$9.99');
    expect(texts).toContain('beauty');
    expect(texts).toContain('A sample product description.');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Rated 4.5 out of 5' }),
    ).toBeTruthy();
  });

  it('shows a fallback when the listing image fails to load', async () => {
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(navigationRef);

    // The listing card's thumbnail is also still mounted underneath the
    // native-stack transition, so the hero image is found by its own label.
    const image = renderer.root.findByProps({
      accessibilityLabel: 'Sample product 1 image',
    });
    await act(async () => {
      (image.props as { onError: () => void }).onError();
    });

    expect(findAllText(renderer)).toContain('Image unavailable');
  });

  it('returns to the listings screen on back navigation', async () => {
    const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
    const renderer = await navigateToDetails(navigationRef);

    expect(navigationRef.current?.getCurrentRoute()?.name).toBe('PropertyDetails');

    await act(async () => {
      navigationRef.current?.goBack();
    });

    expect(navigationRef.current?.getCurrentRoute()?.name).toBe('Listings');
    expect(findAllText(renderer)).toContain('Sample product 1');
  });
});
