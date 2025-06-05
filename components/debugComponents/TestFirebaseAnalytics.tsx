// TestAnalyticsButton.tsx
import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { logAnalyticsEvent } from "../../firebase";

const TestAnalyticsButton: React.FC = () => {
  const [testing, setTesting] = useState(false);

  const runAnalyticsTest = () => {
    setTesting(true);
    console.log("\n-------- ANALYTICS TEST STARTING --------");

    // Generate a unique ID to track this specific test
    const testId = Date.now().toString();
    
    try {
      // Test Firebase Analytics
      console.log("1. Testing Firebase Analytics...");
      
      // Use synchronous logAnalyticsEvent
      const eventLogged = logAnalyticsEvent("test_firebase_event", {
        test_id: testId,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`Firebase Analytics event sent: ${eventLogged ? 'SUCCESS' : 'FAILED'}`);
      
      // Test GTM dataLayer (web only)
      console.log("2. Testing GTM dataLayer...");
      
      if (typeof window !== "undefined" && window.dataLayer) {
        const dataLayerEvent = {
          event: "test_gtm_event",
          test_id: testId,
          timestamp: new Date().toISOString(),
        };

        window.dataLayer.push(dataLayerEvent);
        console.log("✓ GTM dataLayer event pushed!");
      } else {
        console.log("× GTM dataLayer not available");
      }

      console.log("-------- ANALYTICS TEST COMPLETE --------\n");

      Alert.alert(
        "Analytics Test Completed",
        `Test ID: ${testId}\n\nCheck your console for detailed results.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("❌ ANALYTICS TEST ERROR:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert("Analytics Test Failed", `Error: ${errorMessage}`, [{ text: "OK" }]);
    } finally {
      setTesting(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={runAnalyticsTest} disabled={testing}>
      {testing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Test Analytics</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    // Use boxShadow instead of shadowX properties for web
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TestAnalyticsButton;