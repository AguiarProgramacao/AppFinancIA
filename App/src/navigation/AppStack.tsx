import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

import TabNavigator from "./TabNavigation";
import NovaTransacaoScreen from "../components/formularios/TransacoesForm";
import ObjetivoForm from "../components/formularios/ObjetivoForm";
import TransacaoDetalheScreen from "../screens/TransacaoDetalheScreen";
import ObjetivoDetalheScreen from "../screens/ObjetivoDetalheScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SecurityScreen from "../screens/SecurityScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ExportDataScreen from "../screens/ExportDataScreen";
import AboutScreen from "../screens/AboutScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs */}
      <Stack.Screen name="Dashboard" component={TabNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ExportData" component={ExportDataScreen} />
      <Stack.Screen name="About" component={AboutScreen} />

      {/* Modais / telas fora da tab */}
      <Stack.Screen name="NovaTransacao" component={NovaTransacaoScreen} />
      <Stack.Screen name="ObjetivoForm" component={ObjetivoForm} />
      <Stack.Screen name="TransacaoDetalhe" component={TransacaoDetalheScreen} />
      <Stack.Screen name="ObjetivoDetalhe" component={ObjetivoDetalheScreen} />
    </Stack.Navigator>
  );
}


