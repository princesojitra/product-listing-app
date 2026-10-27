import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import packageInfo from '../../../../../package.json';

const WEBSITE_URL = 'https://github.com/princesojitra/property-listing-app';

/** Minimal app-info screen: icon, name, version, and a link back to the repo. */
export function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <MaterialIcons name="home-work" size={40} color="#ffffff" />
      </View>
      <Text style={styles.name} accessibilityRole="header">
        Product Listing App
      </Text>
      <Text style={styles.version}>Version {packageInfo.version}</Text>

      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="link"
        accessibilityLabel="Website"
        onPress={() => Linking.openURL(WEBSITE_URL)}>
        <Text style={styles.rowText}>Website</Text>
        <Text style={styles.rowValue} numberOfLines={1}>
          {WEBSITE_URL.replace('https://', '')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  version: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowText: {
    fontSize: 16,
    color: '#111827',
  },
  rowValue: {
    fontSize: 14,
    color: '#6b7280',
    flexShrink: 1,
    marginLeft: 12,
  },
});
