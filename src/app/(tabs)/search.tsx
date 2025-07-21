import { api } from "@/config/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import debounce from "lodash.debounce";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLOR } from "../utils/constant";

// ...rest import

const SearchScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Hàm search gọi API thực tế
  const doSearch = async (text: string) => {
    try {
      const response = await api.get(
        `Product?Name=${encodeURIComponent(text)}`
      );
      const res = response.data as any;
      setProducts(res?.data || []);
    } catch {
      setProducts([]);
    }
  };

  // Dùng useCallback + lodash.debounce, luôn giữ cùng context
  const debouncedSearch = useRef(
    debounce((text: string) => {
      setSearchTerm(text);
      if (!text.trim()) {
        setProducts([]);
        return;
      }
      doSearch(text);
    }, 350)
  ).current;

  // Cleanup debounce khi unmount (tránh memory leak)
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

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
          onChangeText={debouncedSearch}
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
          <>
            <Image
              source={{
                uri: "https://ngocthang.net/wp-content/uploads/2020/04/sticker-facebook.gif",
              }}
              style={{
                height: 200,
                width: 200,
                borderRadius: 8,
                marginBottom: 8,
                alignSelf: "center",
                marginTop: 150,
              }}
            />
            <Text style={{ textAlign: "center", color: "#888", fontSize: 16 , marginTop: 10 }}>
              Hãy nhập từ khóa tìm kiếm để xem sản phẩm
            </Text>
          </>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
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
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "flex-start",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                  elevation: 2,
                  minWidth: 160,
                  maxWidth: "48%",
                }}
              >
                {/* Ảnh sản phẩm */}
                <Image
                  source={{
                    uri: item.image || "https://via.placeholder.com/100x100.png?text=No+Image",
                  }}
                  style={{
                    height: 100,
                    width: "100%",
                    borderRadius: 10,
                    marginBottom: 8,
                    backgroundColor: "#f4f4f4",
                  }}
                  resizeMode="cover"
                />

                {/* Màu sắc */}
                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  {(item.colors || []).map((color: string, idx: number) => (
                    <View
                      key={color + idx}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: color,
                        marginRight: 6,
                        borderWidth: 1,
                        borderColor: "#ccc",
                      }}
                    />
                  ))}
                </View>

                {/* Size */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
                  {(item.sizes || []).map((size: string, idx: number) => (
                    <View
                      key={size + idx}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                        backgroundColor: "#f5f5f5",
                        marginRight: 6,
                        marginBottom: 4,
                        borderWidth: 1,
                        borderColor: "#eee",
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#444" }}>{size}</Text>
                    </View>
                  ))}
                </View>

                {/* Tên sản phẩm */}
                <Text
                  numberOfLines={2}
                  style={{
                    fontWeight: "600",
                    fontSize: 15,
                    marginBottom: 2,
                    color: "#222",
                  }}
                >
                  {item.name}
                </Text>

                {/* Nhãn New */}
                <Text style={{ color: "#e53935", fontWeight: "bold", fontSize: 13, marginBottom: 2 }}>
                  New
                </Text>

                {/* Giá sản phẩm */}
                <Text style={{ color: "#e53935", fontWeight: "bold", fontSize: 17 }}>
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
