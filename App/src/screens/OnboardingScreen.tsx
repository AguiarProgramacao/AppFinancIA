// src/screens/OnboardingScreen.tsx
import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions
} from "react-native";
import { OnboardingPage } from "../components/OnboardingPage";
import { onboardingData } from "../data/data";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const [index, setIndex] = useState(0);

  const { width } = Dimensions.get("window");

  const handleNext = () => {
    if (index < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      navigation.replace("Login");
    }
  };

  const flatListRef = useRef<FlatList>(null);

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={onboardingData}
            keyExtractor={(_, i) => i.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x /
                event.nativeEvent.layoutMeasurement.width
              );
              setIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <OnboardingPage
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </View>
            )}
          />
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.indicators}>
            {onboardingData.map((_, i) => {
              const bg = index === i ? "#3B82F6" : "#C7C7C7";
              const width = index === i ? 20 : 8;

              return (
                <Animated.View
                  key={i}
                  style={[styles.dot, { backgroundColor: bg, width }]}
                />
              );
            })}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {index === onboardingData.length - 1 ? "Começar" : "Próximo →"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },

  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 18,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 5,
  },

  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: "center",
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
