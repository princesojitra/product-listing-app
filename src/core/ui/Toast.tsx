import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VISIBLE_DURATION_MS = 2500;
const FADE_DURATION_MS = 150;

/** App-wide, non-blocking success/status messages — mounted once at the root. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      setMessage(text);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start();
      hideTimeout.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }).start(() => setMessage(null));
      }, VISIBLE_DURATION_MS);
    },
    [opacity],
  );

  useEffect(
    () => () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message !== null && (
        <SafeAreaView pointerEvents="none" edges={['bottom']} style={styles.safeArea}>
          <Animated.View style={[styles.container, { opacity }]} accessibilityLiveRegion="polite">
            <Text style={styles.text}>{message}</Text>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
