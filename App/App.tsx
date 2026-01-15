import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/contexts/AuthContext";
import Routes from "./src/navigation/Routes";
import { TransacoesProvider } from "./src/contexts/TransacoesContext";

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <TransacoesProvider>
          <Routes />
        </TransacoesProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}