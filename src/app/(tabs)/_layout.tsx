import Entypo from "@expo/vector-icons/Entypo";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { APP_COLOR } from "../utils/constant";

const getIcons = (routeName: string, focused: boolean, size: number) => {
  let iconName: React.ComponentProps<typeof Entypo>["name"] = "home";
  let iconSize = 28; // mặc định

  if (routeName === "index") {
    iconName = "home";
    iconSize = 20;
  }
  if (routeName === "search") {
    iconName = "magnifying-glass";
    iconSize = 36; // kính lúp to hơn
  }
  if (routeName === "account") {
    iconName = "user";
    iconSize = 20;
  }

  // Căn giữa kính lúp: bạn có thể tăng kích thước View bao ngoài nếu muốn nút tròn lớn hơn
  const isSearch = routeName === "search";
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 40,
        width: isSearch ? 70 : 50, // tăng size vòng tròn cho kính lúp
        height: isSearch ? 70 : 50,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginTop: -20,
      }}
    >
      <Entypo
        name={iconName}
        size={iconSize}
        color={focused ? APP_COLOR.ORANGE : "#222"}
      />
    </View>
  );
};

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => getIcons(route.name, focused, size),
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 16,
          right: 16,
          borderRadius: 50,
          height: 70,
          // backgroundColor: "rgba(0,0,0,0.5)",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 15,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Tìm kiếm" }} />
      <Tabs.Screen name="account" options={{ title: "Tôi" }} />
    </Tabs>
  );
};

export default TabLayout;
