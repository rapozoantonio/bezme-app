// components/onboarding/PotentialMatchesComponent.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { layout, typography, forms, spacing } from "@/styles";
import { Svg, Path, Circle, G } from "react-native-svg";

interface MatchProfile {
  id: string;
  description: string;
  avatarType: "founder" | "realEstate" | "model" | "blogger" | "nomad" | "videographer";
}

interface PotentialMatchesComponentProps {
  theme: any;
  onSignUp: () => void;
}

const PotentialMatchesComponent: React.FC<PotentialMatchesComponentProps> = ({ 
  theme, 
  onSignUp 
}) => {
  // Sample match profiles with avatar types
  const potentialMatches: MatchProfile[] = [
    { id: '1', description: 'Founders of apps curating dining experiences in major cities', avatarType: "founder" },
    { id: '2', description: 'Real estate entrepreneurs, founders of pet communities & e-commerce shops', avatarType: "realEstate" },
    { id: '3', description: 'Models, podcast hosts, founders of academies for creators', avatarType: "model" },
    { id: '4', description: 'Travelers and lifestyle bloggers', avatarType: "blogger" },
    { id: '5', description: 'Digital nomad marketing agency owners and influencers', avatarType: "nomad" },
    { id: '6', description: 'Drone videographers and affiliate marketers', avatarType: "videographer" },
  ];

  // Render appropriate avatar based on type
  const renderAvatar = (avatarType: string, color: string) => {
    switch (avatarType) {
      case 'founder':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L2 7L12 12L22 7L12 2Z" fill={color} />
            <Path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke={color} strokeWidth="2" />
          </Svg>
        );
      case 'realEstate':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M3 21H21M5 21V8L12 2L19 8V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 14H15M9 10H15M9 18H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'model':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
            <Path d="M6 18C6 15.7909 8.68629 14 12 14C15.3137 14 18 15.7909 18 18V22H6V18Z" stroke={color} strokeWidth="2" />
            <Path d="M15 8L17 6M9 8L7 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        );
      case 'blogger':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M4 19H20M4 5H20M12 3V21M8 9H8.01M8 15H8.01M16 9H16.01M16 15H16.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'nomad':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M2 12H4M20 12H22M12 2V4M12 20V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        );
      case 'videographer':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M15 10L20 7V17L15 14M4 17H15V7H4C2.89543 7 2 7.89543 2 9V15C2 16.1046 2.89543 17 4 17Z" stroke={color} strokeWidth="2" />
          </Svg>
        );
      default:
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
            <Path d="M6 20C7.5 17 9.5 15.5 12 15.5C14.5 15.5 16.5 17 18 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
    }
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
          <Text style={[typography.title, theme.textStyle]}>
            Ready! Here are some people you may be matched with
          </Text>
        </View>
        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: spacing.md,
          width: "100%",
        }}>
          {potentialMatches.map((match) => (
            <View 
              key={match.id} 
              style={{
                width: '45%',
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
                borderColor: theme.colors.border
              }}
            >
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
                backgroundColor: theme.colors.background
              }}>
                {renderAvatar(match.avatarType, theme.colors.primary)}
              </View>
              <Text 
                style={[
                  typography.body, 
                  theme.textStyle, 
                  { fontSize: 14 }
                ]}
                numberOfLines={2}
              >
                {match.description}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[
            forms.button,
            forms.primaryButton,
            { marginTop: spacing.xl, width: "100%" }
          ]}
          onPress={onSignUp}
        >
          <Text style={forms.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};



export default PotentialMatchesComponent;