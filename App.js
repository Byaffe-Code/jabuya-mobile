import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/Login";
import LandingScreen from "./screens/LandingScreen";
import SalesEntry from "./screens/SalesEntry";
import ViewSales from "./screens/ViewSales";
import ShopSummary from "./screens/ShopSummary";
import Stocking from "./screens/Stocking";
import { UserSessionUtils } from "./utils/UserSessionUtils";
import StockPurchaseForm from "./forms/StockPurchaseForm";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" component={Login} />

        <Stack.Screen name="welcome" component={LandingScreen} />

        <Stack.Screen name="salesEntry" component={SalesEntry} />

        <Stack.Screen name="viewSales" component={ViewSales} />

        <Stack.Screen name="shopSummary" component={ShopSummary} />

        <Stack.Screen name="stocking" component={Stocking} />

        <Stack.Screen name="stockPurchaseForm" component={StockPurchaseForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
