import { Image, useColorScheme, ImageStyle, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";
import styles, { colors, spacing, layout } from "@/styles/index";

export default function HomeScreen() {
  const colorScheme = useColorScheme() as "light" | "dark";
  const themeStyles = styles.getThemeStyles(colorScheme);
  const router = useRouter();

  type UserData = {
    displayName: string;
    photoURL: string | null;
    onboardingComplete?: boolean;
    personalityComplete?: boolean;
    testParticipant?: boolean; // New field to check if user is a test participant
    email?: string; // To display in the waitlist message
  };

  const [userData, setUserData] = useState<UserData>({
    displayName: "",
    photoURL: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // Fetch the user's own document using their UID
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const firebaseUserData = userDocSnap.data();

            // Check if user has completed onboarding in Firestore
            if (!firebaseUserData.onboardingComplete && !firebaseUserData.personalityComplete) {
              // Only redirect if we haven't already checked (prevents infinite redirects)
              if (!checkedOnboarding) {
                setCheckedOnboarding(true);
                // Make sure gateway access is set for the onboarding flow
                try {
                  localStorage.setItem("gateway_access_granted", "true");
                } catch (err) {
                  console.error("Failed to set gateway access:", err);
                }
                router.replace("/(auth)/welcome");
                return;
              }
            } else {
              // User has completed onboarding, set user data
              setUserData({
                displayName: firebaseUserData.displayName || user.displayName || "User",
                photoURL: firebaseUserData.photoURL || user.photoURL || null,
                onboardingComplete: firebaseUserData.onboardingComplete,
                personalityComplete: firebaseUserData.personalityComplete,
                testParticipant: firebaseUserData.testParticipant || false,
                email: user.email || firebaseUserData.email || "",
              });
            }
          } else {
            // Document doesn't exist but user is authenticated
            setUserData({
              displayName: user.displayName || "User",
              photoURL: user.photoURL || null,
              email: user.email || "",
            });

            // Only redirect if we haven't already checked (prevents infinite redirects)
            if (!checkedOnboarding) {
              setCheckedOnboarding(true);
              // Make sure gateway access is set for the onboarding flow
              try {
                localStorage.setItem("gateway_access_granted", "true");
              } catch (err) {
                console.error("Failed to set gateway access:", err);
              }
              router.replace("/(auth)/welcome");
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Could not load your profile");
        }
      } else {
        // User is not signed in - should be handled by the tabs layout
        setUserData({
          displayName: "Demo User",
          photoURL: null,
        });
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [router, checkedOnboarding]);

  const profileImageStyle = {
    height: 120,
    width: 120,
    borderRadius: 60,
    bottom: 20,
    alignSelf: "center" as const,
    position: "absolute" as const,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  } as const;

  // Content for test participants
  const TestParticipantContent = () => (
    <>
      <ThemedView
        style={{
          marginVertical: spacing.md,
          padding: spacing.md,
          backgroundColor: colorScheme === "light" ? colors.light.successBackground : colors.dark.successBackground,
          borderRadius: 15,
          width: "100%",
        }}
      >
        <ThemedText
          type="subtitle"
          style={{
            textAlign: "center",
            fontSize: 22,
          }}
        >
          Done! And get ready to meet your matches soon😉
        </ThemedText>
      </ThemedView>

      <ThemedText
        style={{
          textAlign: "center",
          marginVertical: spacing.md,
          fontSize: 16,
          opacity: 0.8,
        }}
      >
        We're connecting you with 3 young founders & creators outside your bubble every month. Not just to connect, but to
        give each other new perspectives and ideas.
      </ThemedText>
    </>
  );

  // Content for waitlisted users
  const WaitlistContent = () => (
    <>
      <ThemedView
        style={{
          marginVertical: spacing.md,
          padding: spacing.lg,
          backgroundColor: colorScheme === "light" ? colors.light.card : colors.dark.card,
          borderRadius: 15,
          width: "100%",
          borderWidth: 1,
          borderColor: colorScheme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <ThemedText
          type="subtitle"
          style={{
            textAlign: "center",
            fontSize: 22,
            marginBottom: spacing.md,
            fontWeight: "600",
          }}
        >
          You're on the waitlist! 🎉
        </ThemedText>

        <ThemedView
          style={{
            width: 60,
            height: 4,
            backgroundColor: colorScheme === "light" ? colors.light.primary : colors.dark.primary,
            alignSelf: "center",
            marginVertical: spacing.md,
            borderRadius: 2,
          }}
        />

        <ThemedText
          style={{
            textAlign: "center",
            fontSize: 16,
            marginBottom: spacing.md,
            lineHeight: 24,
          }}
        >
          We are currently working on the app and you'll be one of the first people to get access on special condition.
        </ThemedText>

        <ThemedText
          style={{
            textAlign: "center",
            fontSize: 16,
            marginBottom: spacing.md,
            lineHeight: 24,
          }}
        >
          Keep an eye on your emailbox for all the updates and invite to the launch party (if you are in Barcelona)😉
        </ThemedText>
      </ThemedView>

      <ThemedText
        style={{
          textAlign: "center",
          marginVertical: spacing.md,
          fontSize: 14,
          opacity: 0.6,
        }}
      >
        We will notify you as soon as your access is granted.
      </ThemedText>
    </>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: colors.light.background,
        dark: colors.dark.background,
      }}
      headerImage={
        userData.photoURL ? (
          <Image source={{ uri: userData.photoURL }} style={profileImageStyle} />
        ) : (
          <ThemedView
            style={[profileImageStyle, { backgroundColor: colorScheme === "light" ? colors.light.card : colors.dark.card }]}
          />
        )
      }
    >
      <ThemedView
        style={{
          ...layout.container,
          padding: spacing.md,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ThemedView style={{ padding: spacing.lg, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colorScheme === "light" ? colors.light.primary : colors.dark.primary} />
            <ThemedText style={{ marginTop: spacing.md }}>Loading...</ThemedText>
          </ThemedView>
        ) : error ? (
          <ThemedText type="title" style={themeStyles.errorTextStyle}>
            {error}
          </ThemedText>
        ) : (
          <>
            <ThemedText
              type="title"
              style={{
                fontSize: 28,
                marginTop: spacing.xl,
                textAlign: "center",
                marginBottom: spacing.md,
              }}
            >
              Hi, {userData.displayName}
            </ThemedText>

            {/* Show different content depending on whether user is a test participant */}
            {userData.testParticipant ? <TestParticipantContent /> : <WaitlistContent />}
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}
