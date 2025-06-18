import { useCurrentApp } from "@/context/app.context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { IProduct } from "../../app/types/model";
import { mockLikeProductAPI } from "../../app/utils/apiall";
import { APP_COLOR } from "../../app/utils/constant";

interface CardProps {
  shirt: IProduct;
}

const Card = ({ shirt }: CardProps) => {
  const {
    appState,
    likeUpdated,
    setLikeUpdated,
    likedProductIds,
    setLikedProductIds,
  } = useCurrentApp();
  const userId = appState?.user?._id;
  const [like, setLike] = useState<boolean>(false);

  // Mỗi khi context likedProductIds hoặc id sản phẩm đổi, cập nhật lại trạng thái "tim"
  useEffect(() => {
    setLike(likedProductIds.includes(shirt.id));
  }, [likedProductIds, shirt.id]);

  const handleLike = async () => {
    if (!userId) {
      alert("Bạn cần đăng nhập để thích sản phẩm.");
      return;
    }
    const quantity = like ? -1 : 1;
    if (!shirt?.id) {
      alert("Không tìm thấy thông tin.");
      return;
    }

    // Gọi mock API (hoặc thật nếu bạn có)
    const res = await mockLikeProductAPI(shirt.id, quantity);
    const result = res as { data?: any; message?: string | string[] };

    if (result.data) {
      // Cập nhật context: Thêm/Xóa id khỏi mảng sản phẩm đã like
      setLikedProductIds(
        like
          ? likedProductIds.filter((id: string) => id !== shirt.id)
          : [...likedProductIds, shirt.id]
      );
      setLikeUpdated(!likeUpdated); // (option) để các chỗ khác nhận biết thay đổi
    } else {
      const m = Array.isArray(result.message)
        ? result.message[0]
        : result.message;
      alert(m);
    }
  };

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
          <View>
            <MaterialIcons
              onPress={handleLike}
              name={like ? "favorite" : "favorite-outline"}
              size={20}
              color={like ? APP_COLOR.ORANGE : APP_COLOR.GREY}
            />
          </View>
        </View>
        <Text style={styles.sizeText}>
          {shirt.gender || "NAM"}, {shirt.size ? shirt.size : "XS-XXL"}
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
