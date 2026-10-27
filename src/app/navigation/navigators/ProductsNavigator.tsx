import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { container } from '../../../di/container';
import {
  ProductListScreen,
  ProductDetailsScreen,
  ProductFiltersScreen,
  ProductFilters,
  DEFAULT_PRODUCT_FILTERS,
} from '../../../features/products';
import { RootStackParamList } from '../types';
import { glassHeaderScreenOptions } from '../shared/glassHeaderScreenOptions';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface FilterButtonProps {
  onPress: () => void;
}

function FilterButton({ onPress }: FilterButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel="Filters">
      <MaterialIcons name="tune" size={20} color="#2563eb" />
    </Pressable>
  );
}

/**
 * The Products tab's own nested stack: list -> details. Extracted unchanged
 * from the old single-stack `RootNavigator` so it can be mounted as one tab
 * among others. Filters live here (not in `ProductListScreen`) so the
 * filter screen — pushed as a sibling route — can update them directly
 * through a plain prop, rather than passing a function through navigation
 * params (which React Navigation can't serialize).
 */
export function ProductsNavigator() {
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_PRODUCT_FILTERS);

  return (
    <Stack.Navigator initialRouteName="ProductsList" screenOptions={glassHeaderScreenOptions}>
      <Stack.Screen
        name="ProductsList"
        options={({ navigation }) => ({
          title: 'Properties',
          headerRight: () => (
            <FilterButton onPress={() => navigation.navigate('ProductFilters')} />
          ),
        })}>
        {() => <ProductListScreen getProducts={container.getProducts} filters={filters} />}
      </Stack.Screen>
      <Stack.Screen
        name="ProductFilters"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5, 1],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetExpandsWhenScrolledToEdge: false,
        }}>
        {({ navigation }) => (
          <ProductFiltersScreen
            filters={filters}
            onApply={next => {
              setFilters(next);
              navigation.goBack();
            }}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ProductDetails"
        options={{
          title: 'Property Details',
          headerBackButtonDisplayMode: 'minimal',
        }}>
        {props => (
          <ProductDetailsScreen
            {...props}
            getProductDetails={container.getProductDetails}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
