// src/navigation/TabNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Receipt, Target, Settings, PieChart } from "lucide-react-native";
import { View, Text } from "react-native";

import DashboardScreen from "../screens/DashboardScreen";
import TransacoesScreen from "../screens/TransacoesScreen";
import GraficosScreen from "../screens/GraficosScreen";
import ObjetivosScreen from "../screens/ObjetivoScreen";
import ConfigScreen from "../screens/ConfigScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 100,
          paddingBottom: 10,
          paddingTop: 6,
          backgroundColor: "#FFF",
          borderTopWidth: 0,
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === "Dashboard") icon = <Home size={24} color={color} />;
          if (route.name === "Transações") icon = <Receipt size={24} color={color} />;
          if (route.name === "Gráficos") icon = <PieChart size={24} color={color} />;
          if (route.name === "Objetivos") icon = <Target size={24} color={color} />;
          if (route.name === "Config") icon = <Settings size={24} color={color} />;

          return icon;
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transações" component={TransacoesScreen} />
      <Tab.Screen name="Gráficos" component={GraficosScreen} />
      <Tab.Screen name="Objetivos" component={ObjetivosScreen} />
      <Tab.Screen name="Config" component={ConfigScreen} />
    </Tab.Navigator>
  );
}