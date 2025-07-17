import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";

const categoryData = [
  {
    label: "TOP",
    backgroundImage:
      "https://product.hstatic.net/200000678739/product/25a_90fbab0f674241439ee3647598ea675b_large.jpg",
    productTitle: "Top Basic",
    desc: "Chất vải mềm mại, thoáng mát, trẻ trung cho nữ.",
    price: "210.000 VND",
    id: "shirt",
  },
  {
    label: "OUTTERWEAR",
    backgroundImage:
      "https://bizweb.dktcdn.net/100/287/440/files/cac-local-brand-da-nang-dep.jpg?v=1619602174052",
    productTitle: "Áo Thun Nam Năng Động",
    desc: "Kiểu dáng trẻ trung, năng động, phù hợp nhiều dịp.",
    price: "220.000 VND",
    subDesc: "Có đủ size M-XXL.",
    id: "pant",
  },
  {
    label: "BOTTOM",
    backgroundImage:
      "https://media.coolmate.me/cdn-cgi/image/quality=80/uploads/June2022/quan_ao_tre_em_7.jpg",
    productTitle: "Áo Parka Chống UV Bỏ Túi Line",
    desc: "Thiết kế nhỏ gọn với chất liệu bảo vệ bạn khỏi tia UV, chống mưa nhẹ.*",
    price: "588.000 VND",
    subDesc:
      "*Vải được phủ một lớp chống thấm nước nhẹ. Lớp chống thấm chỉ có tác dụng trong một khoảng thời gian nhất định.",
    id: "pant",
  },
];

const ShopHomeScreen = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const cat = categoryData[selectedIdx];

  const onSwipeLeft = () => {
    if (selectedIdx < categoryData.length - 1) {
      setSelectedIdx(selectedIdx + 1);
    }
  };

  const onSwipeRight = () => {
    if (selectedIdx > 0) {
      setSelectedIdx(selectedIdx - 1);
    }
  };

  return (
    <GestureRecognizer
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() =>
            router.push({
              pathname: "/product/[id]",
              params: { id: cat.id },
            })
          }
        >
          <ImageBackground
            source={{ uri: cat.backgroundImage }}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            {/* Overlay mờ nhẹ */}
            <View style={styles.overlay} />

            {/* Category Menu */}
            <View style={styles.categoryRow}>
              {categoryData.map((catItem, idx) => (
                <TouchableOpacity
                  key={catItem.label}
                  onPress={() => setSelectedIdx(idx)}
                  style={styles.categoryBtn}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedIdx === idx && styles.categoryActive,
                    ]}
                  >
                    {catItem.label}
                  </Text>
                  {selectedIdx === idx && <View style={styles.underline} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Product Info */}
            <View style={styles.contentContainer}>
              <View style={styles.contentBox}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <MaterialIcons name="wb-sunny" size={20} color="#111" style={{ marginRight: 4 }} />
                  <Text style={{ fontWeight: "bold", fontSize: 13, letterSpacing: 1, color: "#111" }}>UV PROTECTION</Text>
                </View>
                <Text style={styles.productTitle}>{cat.productTitle}</Text>
                <Text style={styles.desc}>{cat.desc}</Text>
                <Text style={styles.price}>{cat.price}</Text>
                {/* {cat.subDesc && <Text style={styles.subDesc}>{cat.subDesc}</Text>} */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/product/[id]",
                        params: { id: cat.id },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="shopping-cart" size={22} color="#fff" />
                    <Text style={styles.buyBtnText}>Xem sản phẩm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </View>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 100,
    marginBottom: 12,
    paddingHorizontal: 18,
    gap: 20,
  },
  categoryBtn: {
    alignItems: "center",
    paddingHorizontal: 6,
  },
  categoryText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  categoryActive: {
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: "#fff",
  },
  underline: {
    width: 30,
    height: 2,
    backgroundColor: "#fff",
    marginTop: 2,
    borderRadius: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: 140,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  productTitle: {
    fontSize: 28,
    color: "#111",
    fontWeight: "700",
    marginBottom: 4,
  },
  desc: {
    color: "#111",
    fontSize: 16,
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    color: "#111",
    fontWeight: "bold",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#111",
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  buyBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  // subDesc: {
  //   color: "orange",
  //   fontSize: 14,
  //   opacity: 0.75,
  //   marginTop: 8,
  //   maxWidth: width * 0.92,
  // },
  contentBox: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    width: "100%",
  },
});

export default ShopHomeScreen;
