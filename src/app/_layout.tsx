import CustomHeader from "@/components/header/header";
import { AppProvider } from "@/context/app.context";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { ErrorBoundaryProps, Stack } from "expo-router";
import React from "react";
import { Button, StatusBar, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLOR } from "./utils/constant";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 10, gap: 15 }}>
        <View
          style={{
            backgroundColor: "#333",
            padding: 10,
            borderRadius: 3,
            gap: 10,
          }}
        >
          <Text style={{ color: "red", fontSize: 20 }}>
            Something went wrong
          </Text>
          <Text style={{ color: "#fff" }}>{error.message}</Text>
        </View>
        <Button title="Try Again ?" onPress={retry} />
      </View>
    </SafeAreaView>
  );
}

const RootLayout = () => {
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "white",
    },
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <RootSiblingParent>
        <AppProvider>
          {/* <SafeAreaView style={{ flex: 1 }}> */}
          <ThemeProvider value={navTheme}>
            <CustomHeader />
            <Stack
              screenOptions={{
                headerTintColor: APP_COLOR.ORANGE,
                headerStyle: {
                  backgroundColor: "white",
                },
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="index"
                options={{ headerTitle: "Trang chủ" }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{ headerTitle: "Trang chủ" }}
              />
              <Stack.Screen
                name="(auth)/signup"
                options={{ headerTitle: "Đăng ký" }}
              />
              <Stack.Screen
                name="(auth)/verify"
                options={{ headerTitle: "Verify OTP" }}
              />
              <Stack.Screen
                name="(auth)/login"
                options={{ headerTitle: "Login Page" }}
              />
              <Stack.Screen
                name="(auth)/forgot.password"
                options={{ headerTitle: "Forgot Password Page" }}
              />
              <Stack.Screen
                name="(auth)/welcome"
                options={{ headerTitle: "Login Page" }}
              />
              <Stack.Screen
                name="(auth)/request.password"
                options={{ headerTitle: "Request Password Page" }}
              />
              <Stack.Screen
                name="(auth)/search.deal"
                options={{ headerTitle: "Search Page" }}
              />
              <Stack.Screen
                name="(auth)/restaurants"
                options={{ headerTitle: "Search Page" }}
              />
              <Stack.Screen
                name="product/shirt"
                options={{ headerTitle: "Login Page" }}
              />
              <Stack.Screen
                name="product/shop"
                options={{ headerTitle: "Login Page" }}
              />
              <Stack.Screen
                name="product/pant"
                options={{ headerTitle: "Login Page" }}
              />
              <Stack.Screen
                name="product/likeProduct"
                options={{ headerTitle: "Login Page" }}
              />

              <Stack.Screen
                name="product/detailPage/[id]"
                options={{ headerTitle: "Detail Page" }}
              />
              <Stack.Screen
                name="product/cart"
                options={{ headerTitle: "Cart Page" }}
              />

              <Stack.Screen
                name="(user)/user.infor"
                options={{ headerTitle: "User Page" }}
              />
              <Stack.Screen
                name="(user)/user.changePassword"
                options={{
                  headerTitle: "Cập nhật mật khẩu",
                }}
              />

              <Stack.Screen
                name="product/create.modal"
                options={{
                  presentation: "transparentModal",
                  animation: "fade_from_bottom",
                }}
              />
              <Stack.Screen
                name="product/update.modal"
                options={{
                  presentation: "transparentModal",
                  animation: "fade_from_bottom",
                }}
              />
              <Stack.Screen
                name="product/order.detail"
                options={{
                  presentation: "transparentModal",
                  animation: "fade_from_bottom",
                }}
              />
            </Stack>
          </ThemeProvider>
          {/* </SafeAreaView> */}
        </AppProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
};
export default RootLayout;
