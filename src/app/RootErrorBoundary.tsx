import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logger } from '../shared/logging/logger';

interface State {
  hasError: boolean;
  error?: Error;
}

export class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('RootErrorBoundary caught unhandled error', {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{this.state.error?.message ?? 'Unexpected error'}</Text>
        <TouchableOpacity style={styles.button} onPress={this.reset}>
          <Text style={styles.buttonText}>Restart Screen</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F6F7F3',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151B14',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#66705F',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1F6E43',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
