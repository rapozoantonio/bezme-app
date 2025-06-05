// components/onboarding/PotentialMatchesComponent.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { layout, typography, forms, spacing } from "@/styles";
import * as GTM from "@/services/gtm";

interface MatchProfile {
  id: string;
  description: string;
  avatarType: "founder" | "realEstate" | "model" | "blogger" | "nomad" | "videographer";
}

interface PotentialMatchesComponentProps {
  theme: any;
  onSignUp: () => void;
}

const PotentialMatchesComponent: React.FC<PotentialMatchesComponentProps> = ({ theme, onSignUp }) => {
  // Sample match profiles with avatar types
  const potentialMatches: MatchProfile[] = [
    { id: "1", description: "Founder of food experience app", avatarType: "founder" },
    { id: "2", description: "Real estate entrepreneur, YouTuber", avatarType: "realEstate" },
    { id: "3", description: "Founder of creator academy, model", avatarType: "model" },
    { id: "4", description: "Travel and lifestyle blogger", avatarType: "blogger" },
    { id: "5", description: "Influencer, founder of marketing agency", avatarType: "nomad" },
    { id: "6", description: "Drone videographer and affiliate marketer", avatarType: "videographer" },
  ]; 
  const renderAvatar = (avatarType: string) => {
    // Map avatar types to appropriate seeds and styles for professional but modern look
    let style = "lorelei"; 
    let seed = `bezme-${avatarType}`;
    let backgroundColors = encodeURIComponent("f4f4f5"); // Light neutral background
    // Using human-like avatar styles for all personas
    switch (avatarType) {
      case "founder":
        // Professional, confident look for founders
        style = "personas";
        break;
      case "realEstate":
        // Polished, established professional look
        style = "lorelei";
        break;
      case "model":
        // Stylish, fashion-forward look
        style = "micah";
        break;
      case "blogger":
        // Creative, approachable look (changed from bottts to personas)
        style = "personas";
        seed = `bezme-blogger-human`;
        break;
      case "nomad":
        // Adventurous, worldly look
        style = "avataaars";
        break;
      case "videographer":
        // Creative, visual professional (changed from pixel-art to lorelei)
        style = "lorelei";
        seed = `bezme-videographer-creative`;
        break;
    }

    // DiceBear API endpoint with style and seed parameters
    const uri = `https://api.dicebear.com/6.x/${style}/png?seed=${seed}&backgroundColor=${backgroundColors}&scale=80`;

    return (
      <Image
        source={{ uri }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
        }}
        resizeMode="cover"
      />
    );
  };

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
          <Text style={[typography.title, theme.textStyle]}>Ready! Here are some people you may be matched with</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: spacing.md,
            width: "100%",
          }}
        >
          {potentialMatches.map((match) => (
            <View
              key={match.id}
              style={{
                width: "45%",
                borderRadius: 12,
                padding: spacing.sm,
                marginHorizontal: spacing.xs,
                marginBottom: spacing.md,
                borderWidth: 1,
                elevation: 1,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: spacing.sm,
                  backgroundColor: theme.colors.background,
                }}
              >
                {renderAvatar(match.avatarType)}
              </View>
              <Text style={[typography.body, theme.textStyle, { fontSize: 14 }]} numberOfLines={2}>
                {match.description}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[forms.button, forms.primaryButton, { marginTop: spacing.xl, width: "100%" }]}
          onPress={() => {
            // Track with Google Tag Manager
            GTM.pushToDataLayer(GTM.GTMEvents.MATCHES_PROFILES_FUNNEL);
            onSignUp();
          }}
        >
          <Text style={forms.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PotentialMatchesComponent;
