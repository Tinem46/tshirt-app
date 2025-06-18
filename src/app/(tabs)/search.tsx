import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import debounce from "debounce";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IProduct } from "../types/model";
import { APP_COLOR } from "../utils/constant";

const defaultData = [
  {
    key: 1,
    name: "Áo thun",
    source: { uri: "https://dosi-in.com/images/detailed/42/CDL10_1.jpg" },
  },
  {
    key: 2,
    name: "Áo sơ mi",
    source: { uri: "https://dosi-in.com/images/detailed/42/CDL10_1.jpg" },
  },
  {
    key: 3,
    name: "Quần dài",
    source: { uri: "https://dosi-in.com/images/detailed/42/CDL10_1.jpg" },
  },
  {
    key: 4,
    name: "Đầm váy",
    source: { uri: "https://dosi-in.com/images/detailed/42/CDL10_1.jpg" },
  },
  {
    key: 5,
    name: "Áo khoác",
    source: { uri: "https://dosi-in.com/images/detailed/42/CDL10_1.jpg" },
  },
  {
    key: 6,
    name: "Phụ kiện",
    source: { uri: "https://dosi-in.com/images/detailed/42/CDL10_1.jpg" },
  },
  // Thêm icon khác nếu bạn có
];

const DefaultResult = () => {
  return (
    <View style={{ backgroundColor: "white", padding: 10, gap: 10 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
        Danh mục phổ biến
      </Text>
      <FlatList
        data={defaultData}
        numColumns={2}
        keyExtractor={(item) => item.key.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              borderColor: "#eee",
              borderWidth: 1,
              margin: 8,
              borderRadius: 10,
              padding: 12,
              gap: 10,
              backgroundColor: "#fafafa",
            }}
          >
            <Image
              source={item.source}
              style={{ width: 36, height: 36, marginRight: 8 }}
            />
            <Text style={{ fontSize: 15 }}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const SearchScreen = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Gọi API sản phẩm
  const handleSearch = debounce(async (text: string) => {
    setSearchTerm(text);
    if (!text) {
      setProducts([]);
      return;
    }
    try {
      const res = await fetch(
        `https://682f2e5b746f8ca4a4803faf.mockapi.io/product?search=${encodeURIComponent(
          text
        )}`
      );
      const data = await res.json();
      setProducts(data ?? []);
    } catch (e) {
      setProducts([]);
    }
  }, 300);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
          padding: 10,
          paddingTop: StatusBar.currentHeight,
        }}
      >
        <MaterialIcons
          name="arrow-back"
          size={24}
          onPress={() => router.back()}
          color={APP_COLOR.ORANGE}
        />
        <TextInput
          placeholder="Tìm kiếm sản phẩm..."
          onChangeText={(text: string) => handleSearch(text)}
          autoFocus={true}
          style={{
            flex: 1,
            backgroundColor: "#eee",
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 3,
          }}
        />
      </View>

      <View style={{ backgroundColor: "#eee", flex: 1 }}>
        {searchTerm.length === 0 ? (
          <DefaultResult />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            numColumns={2}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 100, color: "#888" }}
              >
                Không tìm thấy sản phẩm nào...
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/product/detailPage/[id]",
                    params: { id: item.id },
                  })
                }
                style={{
                  flex: 1,
                  margin: 8,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  padding: 10,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Image
                  source={{
                    uri:
                      item.image ||
                      "https://via.placeholder.com/100x100.png?text=No+Image",
                  }}
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: "#f4f4f4",
                  }}
                  resizeMode="cover"
                />
                <Text
                  numberOfLines={2}
                  style={{
                    fontWeight: "500",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{ color: "#e53935", marginTop: 4, fontWeight: "bold" }}
                >
                  {Number(item.price).toLocaleString()} VND
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
