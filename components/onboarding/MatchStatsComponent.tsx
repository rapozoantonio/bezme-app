// components/onboarding/MatchStatsComponent.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { layout, typography, forms, spacing } from "@/styles";
import * as GTM from "@/services/gtm";

interface MatchStatsComponentProps {
  theme: any;
  onContinue: () => void;
}

const MatchStatsComponent: React.FC<MatchStatsComponentProps> = ({ theme, onContinue }) => {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.md,
        paddingBottom: spacing.xxl * 2,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[layout.container, layout.center, { paddingHorizontal: spacing.md, width: "100%" }]}>
        <View style={layout.headerContainer}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginVertical: spacing.xl,
            }}
          >
            <View
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                borderWidth: 3,
                borderColor: theme.colors.primary,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
              }}
            >
              <Text style={[typography.title, theme.textStyle, { textAlign: "center", fontSize: 48, fontWeight: "bold" }]}>
                96%
              </Text>
            </View>
          </View>

          <Text style={[typography.subtitle, theme.textSecondaryStyle, { textAlign: "center", marginTop: spacing.xs }]}>
            of matches find them compatible and continue their communication
          </Text>
        </View>
        <TouchableOpacity
          style={[forms.button, forms.primaryButton, { marginTop: spacing.xl, width: "100%" }]}
          onPress={() => {
            GTM.pushToDataLayer(GTM.GTMEvents.MATCHES_COMPATIBILITY_FUNNEL);
            onContinue();
          }}
        >
          <Text style={forms.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MatchStatsComponent;
