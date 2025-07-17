import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const CustomHeader = () => {
  const pathname = usePathname();
  // Các path chính không hiển thị nút back
  const mainScreens = ["/", "/search", "/account"];
  // Các route auth không hiển thị icon
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot.password",
    "/request.password",
    "/verify"
  ];
  const isMainScreen = mainScreens.includes(pathname);
  const isAuthScreen = authRoutes.includes(pathname);
  if (isAuthScreen) {
    return <View style={styles.headerContainer} />;
  }
  return (
    <View style={styles.headerContainer}>
      {isMainScreen ? (
        <TouchableOpacity
          style={styles.leftIcon}
          onPress={() => router.push("/")}
        >
          <Feather name="home" size={24} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.leftIcon}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }} />
      <View style={styles.iconGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/product/shop")}
        >
          <Feather name="plus-circle" size={24} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/product/likeProduct")}
        >
          <AntDesign name="hearto" size={24} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/product/cart")}
        >
          <Feather name="shopping-cart" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 45,
    paddingHorizontal: 20,
    height: 90,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  leftIcon: {
    paddingRight: 10,
  },
  iconGroup: {
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    marginLeft: 16,
  },
});

export default CustomHeader;
