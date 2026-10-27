import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/navigationTypes';
import { Listing } from '../../domain/models/Listing';
import { ListingRepository } from '../../domain/repositories/ListingRepository';
import { useListings } from '../hooks/useListings';
import { ListingCard } from '../components/ListingCard';

function keyExtractor(item: Listing): string {
  return item.id;
}

type ListingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Listings'
>;

interface ListingsScreenProps {
  repository: ListingRepository;
}

export function ListingsScreen({ repository }: ListingsScreenProps) {
  const { state, retry } = useListings(repository);
  const navigation = useNavigation<ListingsNavigationProp>();

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingCard
        listing={item}
        onPress={() => navigation.navigate('PropertyDetails', { listing: item })}
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header} accessibilityRole="header">
        Properties
      </Text>

      {state.status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            accessibilityLabel="Loading properties"
          />
          <Text style={styles.centeredText}>Loading properties…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <Pressable
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading properties"
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>
            No properties found right now. Check back soon.
          </Text>
        </View>
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <FlatList
          data={state.data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centeredText: {
    marginTop: 12,
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
