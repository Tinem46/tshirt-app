import Entypo from "@expo/vector-icons/Entypo";
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { APP_COLOR } from "../utils/constant";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;
        let iconName: React.ComponentProps<typeof Entypo>["name"] = "home";
        if (route.name === "search") iconName = "magnifying-glass";
        if (route.name === "account") iconName = "user";

        // Animated scale effect
        const scaleAnim = useRef(new Animated.Value(isFocused ? 1.18 : 1)).current;
        useEffect(() => {
          Animated.timing(scaleAnim, {
            toValue: isFocused ? 1.18 : 1,
            duration: 220,
            useNativeDriver: true,
            easing: Easing.out(Easing.exp),
          }).start();
        }, [isFocused]);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tabBtn}
            activeOpacity={0.85}
          >
            <Animated.View
              style={[
                styles.iconCircle,
                isFocused && styles.iconCircleActive,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Entypo
                name={iconName}
                size={28}
                color={isFocused ? APP_COLOR.ORANGE : "#888"}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const TabLayout = () => {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Tìm kiếm" }} />
      <Tabs.Screen name="account" options={{ title: "Tôi" }} />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    paddingTop: 8,
    height: 80,
    borderTopWidth: 0,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    zIndex: 100,
  },
  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    backgroundColor: "#fff",
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff", // viền trắng mặc định
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  iconCircleActive: {
    borderColor: APP_COLOR.ORANGE, // active mới có viền cam
  },
});

export default TabLayout;
