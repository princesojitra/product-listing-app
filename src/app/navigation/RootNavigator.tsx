import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProductsNavigator } from './ProductsNavigator';
import { CategoriesScreen } from '../../features/categories';
import { RootTabParamList } from './navigationTypes';

const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * App-level root: a bottom-tab navigator. Each tab owns its header — the
 * tab navigator's own header is hidden so it never stacks a second header
 * on top of a tab's content (the Products tab already manages its own via
 * its nested stack).
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Products" component={ProductsNavigator} />
        <Tab.Screen name="Categories" component={CategoriesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
