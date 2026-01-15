// src/components/OnboardingPage.tsx
import React, { JSX } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  icon: JSX.Element;
  title: string;
  description: string;
}

export function OnboardingPage({ icon, title, description }: Props) {
  return (
    <View style={styles.container}>
      {/* Ícone */}
      <View style={styles.iconContainer}>{icon}</View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    backgroundColor: "#EEF3FF",
    borderRadius: 20,
    marginBottom: 24,
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center"
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    width: "85%"
  },

  description: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    width: "80%",
  },
});
