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
import { IProduct, IProductVariant } from "../../app/types/model";
import { COLOR_HEX, SIZE_LABELS } from "../Enums/enumMaps";

interface CardProps {
  shirt: IProduct;
  variants?: IProductVariant[];
}

const Card = ({ shirt, variants = [] }: CardProps) => {
  const imageUrl =
    (variants[0]?.imageUrl && variants[0].imageUrl.startsWith("http")
      ? variants[0].imageUrl
      : variants[0]?.imageUrl
      ? "http://localhost:5265" + variants[0]?.imageUrl
      : "") ||
    shirt.images?.[0] ||
    "https://cdn-icons-png.flaticon.com/512/2748/2748558.png";

  // Lấy unique màu & size từ variants
  const uniqueColors = Array.from(new Set(variants.map((v) => v.color)));
  const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/product/detailPage/[id]",
          params: { id: shirt.id },
        });
      }}
    >
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.img} />

        <View
          style={{ flex: 1, width: "100%", justifyContent: "space-between" }}
        >
          {/* Hàng màu */}
          <View style={styles.colorRow}>
            {uniqueColors.map((color, idx) => (
              <View
                key={`color_${color}_${idx}`}
                style={[
                  styles.colorDot,
                  { backgroundColor: COLOR_HEX[color] || "#eee" },
                ]}
              />
            ))}
          </View>

          {/* Hàng size */}
          <View style={styles.sizeRow}>
            {uniqueSizes.map((size, idx) => (
              <Text key={`size_${size}_${idx}`} style={styles.sizeBadge}>
                {SIZE_LABELS[size] || size}
              </Text>
            ))}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {shirt.name}
          </Text>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 0,
            }}
          >
            <Text style={styles.labelNew}>New</Text>
          </View>
          <Text style={styles.price}>
            {Number(
              variants[0]?.salePrice ??
                variants[0]?.price ??
                shirt.salePrice ??
                shirt.price
            ).toLocaleString()}{" "}
            VND
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get("window").width / 2 - 14,
    height: 400,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    marginVertical: 12,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 15,
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
    resizeMode: "cover",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
    justifyContent: "flex-start", // fix badge sát trái
    width: "100%",
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 7,
    justifyContent: "flex-start", // fix badge sát trái
    width: "100%",
   
  },
  sizeBadge: {
    backgroundColor: "#f2f2f2",
    color: "#444",
    fontSize: 12,
    fontWeight: "500",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 3,
    overflow: "hidden",
    minWidth: 28,
    textAlign: "center",
  },
  // Other card styles
  favoriteIcon: {
    fontSize: 22,
    color: "#bbb",
    marginLeft: 12,
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
    paddingVertical: 0,
    marginRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
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
