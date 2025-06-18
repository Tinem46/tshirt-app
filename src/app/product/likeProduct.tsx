import { useCurrentApp } from "@/context/app.context";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/card/card";
import { IProduct } from "../types/model";

const LikedProducts = () => {
  const { likedProductIds, appState } = useCurrentApp();
  const userId = appState?.user?._id;
  const [products, setProducts] = useState<IProduct[]>([]);

  // Fetch danh sách sản phẩm (giữ nguyên như cũ)
  useEffect(() => {
    fetch("https://682f2e5b746f8ca4a4803faf.mockapi.io/product")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  // Lọc sản phẩm đã thích dựa vào context
  const likedProducts = products.filter((product) =>
    likedProductIds.includes(product.id)
  );

  if (!userId) {
    return (
      <Text style={styles.note}>
        Bạn cần đăng nhập để xem sản phẩm đã thích.
      </Text>
    );
  }

  if (likedProducts.length === 0) {
    return (
      <View style={styles.container2}>
        <Image
          style={{ width: 200, height: 200 }}
          source={{
            uri: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482852sOF/anh-mo-ta.png",
          }}
        />
        <Text style={styles.note}>Chưa có sản phẩm nào được thích.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Sản phẩm đã thích</Text>
        <FlatList
          data={likedProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card shirt={item} />}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingTop: 30,
  },
  container2: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "bold", margin: 12 },
  list: { paddingHorizontal: 8, paddingBottom: 16 },
  note: {
    margin: 24,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
});

export default LikedProducts;
