import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const CustomHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.leftIcon}
        onPress={() => router.push("/")}
      >
        <Feather name="home" size={24} />
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <View style={styles.iconGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/product/shop")}
        >
          <Feather name="plus-circle" size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/product/likeProduct")}
        >
          <AntDesign name="hearto" size={24} />
        </TouchableOpacity>
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
