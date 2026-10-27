import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category } from '../../domain/models/Category';
import { GetCategories } from '../../domain/usecases/GetCategories';
import { useCategories } from '../hooks/useCategories';

function keyExtractor(item: Category): string {
  return item.slug;
}

function renderItem({ item }: { item: Category }) {
  return (
    <View style={styles.row} accessibilityLabel={item.name}>
      <Text style={styles.rowText}>{item.name}</Text>
    </View>
  );
}

interface CategoriesScreenProps {
  getCategories: GetCategories;
}

export function CategoriesScreen({ getCategories }: CategoriesScreenProps) {
  const { state, retry } = useCategories(getCategories);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header} accessibilityRole="header">
        Categories
      </Text>

      {state.status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            accessibilityLabel="Loading categories"
          />
          <Text style={styles.centeredText}>Loading categories…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>{state.message}</Text>
          <Pressable
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading categories"
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.centeredText}>
            No categories found right now. Check back soon.
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
  row: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
