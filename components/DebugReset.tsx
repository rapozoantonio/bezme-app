// components/DebugReset.tsx
import React from 'react';
import { Button, View, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function DebugReset() {
  const resetGatewayAccess = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('gateway_access_granted');
        console.log('Gateway access reset using localStorage on web.');
      } else {
        await SecureStore.deleteItemAsync('gateway_access_granted');
        console.log('Gateway access reset.');
      }
    } catch (error) {
      console.error('Error resetting gateway access:', error);
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Button title="(REMOVE LATER) Reset Gateway Access" onPress={resetGatewayAccess} />
    </View>
  );
}
