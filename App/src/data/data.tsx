// src/data/onboarding.ts
import React from "react";
import { 
  TrendingUp, 
  PieChart, 
  Sparkles, 
  Target,  
  ShoppingCart,
  Wallet,
  Utensils,
  Car,
  Shirt,
  Gamepad2,
  Home,
  HeartPulse,
} from "lucide-react-native";

export const onboardingData = [
  {
    icon: <TrendingUp size={70} color="#3B82F6" strokeWidth={2} />,
    title: "Controle Total das suas Finanças",
    description:
      "Acompanhe entradas e saídas de forma simples e intuitiva. Tudo na palma da sua mão.",
  },
  {
    icon: <PieChart size={70} color="#10B981" strokeWidth={2} />,
    title: "Visualize seus Gastos",
    description:
      "Gráficos claros e bonitos para entender exatamente para onde seu dinheiro está indo.",
  },
  {
    icon: <Sparkles size={70} color="#F59E0B" strokeWidth={2} />,
    title: "Receba Insights Inteligentes",
    description:
      "Sugestões de economia e alertas personalizados para melhorar suas finanças.",
  },
  {
    icon: <Target size={70} color="#6366F1" strokeWidth={2} />,
    title: "Alcance seus Objetivos",
    description:
      "Defina metas financeiras e acompanhe seu progresso até realizar seus sonhos.",
  },
];

export const categoriasData = [
  {
    id: "alimentacao",
    label: "Alimentação",
    color: "#3B82F6",
    icon: <Utensils size={22} color="#3B82F6" />,
    tipo: "despesa",
  },
  {
    id: "compras",
    label: "Compras",
    color: "#22C55E",
    icon: <ShoppingCart size={22} color="#22C55E" />,
    tipo: "despesa",
  },
  {
    id: "transporte",
    label: "Transporte",
    color: "#FACC15",
    icon: <Car size={22} color="#FACC15" />,
    tipo: "despesa",
  },
  {
    id: "lazer",
    label: "Lazer",
    color: "#FB923C",
    icon: <Gamepad2 size={22} color="#FB923C" />,
    tipo: "despesa",
  },
  {
    id: "moradia",
    label: "Moradia",
    color: "#6366F1",
    icon: <Home size={22} color="#6366F1" />,
    tipo: "despesa",
  },
  {
    id: "saude",
    label: "Saúde",
    color: "#EF4444",
    icon: <HeartPulse size={22} color="#EF4444" />,
    tipo: "despesa",
  },
  {
    id: "outros",
    label: "Outros",
    color: "#A855F7",
    icon: <Wallet size={22} color="#A855F7" />,
    tipo: "despesa",
  },
];