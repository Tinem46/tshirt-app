import { useCurrentApp } from "@/context/app.context";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { IProduct } from "../../app/types/model";

interface CardProps {
  shirt: IProduct;
}

const Card = ({ shirt }: CardProps) => {
  const { appState } = useCurrentApp();
  const userId = appState?.user?.id;

  // Mỗi khi context likedProductIds hoặc id sản phẩm đổi, cập nhật lại trạng thái "tim"

  const colorHexMap = {
    Trắng: "#fafafa",
    Đen: "#222",
    Xanh: "#7ec1e9",
    Đỏ: "#e55a5a",
    Vàng: "#ffe066",
  };
  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/product/detailPage/[id]",
          params: { id: shirt.id },
        });
        console.log("Navigating to product detail:", shirt.id);
      }}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: "https://dosi-in.com/images/detailed/42/CDL10_1.jpg" }}
          style={styles.img}
        />
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorDot,
              { backgroundColor: colorHexMap[shirt.color] || "#eee" },
            ]}
          />
        </View>
        <Text style={styles.sizeText}>
           {shirt.size ? shirt.size : "XS-XXL"}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {shirt.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Text style={styles.labelNew}>New</Text>
        </View>
        <Text style={styles.price}>
          {Number(shirt.price).toLocaleString()} VND
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get("window").width / 2 - 10,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    marginVertical: 12,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 13,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },
  img: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 3,
    marginTop: 1,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  favoriteIcon: {
    fontSize: 22,
    color: "#bbb",
    marginLeft: 12,
  },
  sizeText: {
    fontSize: 12.5,
    color: "#888",
    marginBottom: 2,
    width: "100%",
    fontWeight: "500",
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    color: "#222",
    width: "100%",
    marginBottom: 1,
  },
  labelNew: {
    backgroundColor: "#f7f7f7",
    color: "#d32f2f",
    fontWeight: "bold",
    fontSize: 13,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 4,
  },
  price: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 4,
    marginBottom: 2,
  },
});

export default Card;
