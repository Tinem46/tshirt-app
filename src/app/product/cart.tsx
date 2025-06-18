import { useCurrentApp } from "@/context/app.context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICartItem } from "../types/model";
import { APP_COLOR } from "../utils/constant";

const CartPage = () => {
  const { cart, setCart, setBuyNowItem } = useCurrentApp();
  const handleCheckout = () => {
    setBuyNowItem(null); // reset BuyNow
    router.push("/order/checkout");
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      Alert.alert("Xác nhận", "Bạn có muốn xóa sản phẩm này?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            newCart.splice(index, 1);
            setCart(newCart);
          },
        },
      ]);
      return;
    }

    newCart[index].quantity = newQty;
    setCart(newCart);
  };

  const renderItem = ({ item, index }: { item: ICartItem; index: number }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.product.image }} style={styles.image} />
      <View style={{ flex: 1, paddingLeft: 12 }}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.price}>
          {Number(item.product.price).toLocaleString()} VND
        </Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            onPress={() => updateQuantity(index, -1)}
            style={styles.qtyButton}
          >
            <Ionicons name="remove" size={20} color="#555" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(index, 1)}
            style={styles.qtyButton}
          >
            <Ionicons name="add" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const isEmpty = Array.isArray(cart)
    ? cart.length === 0
    : !cart.items || !Object.keys(cart.items).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", marginTop: 30 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons
            name="shopping-cart"
            size={28}
            color={APP_COLOR.ORANGE}
          />
          <Text style={styles.title}>Giỏ Hàng Của Bạn</Text>
        </View>

        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Image
              source={{
                uri: "https://tse4.mm.bing.net/th/id/OIP.ab45PW30UOa0XJ7sDrQK7QHaHa?rs=1&pid=ImgDetMain",
              }}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.empty}>Giỏ hàng đang trống.</Text>
          </View>
        ) : (
          <FlatList
            data={Array.isArray(cart) ? cart : []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}

        {/* Button section */}
        <View style={styles.totalContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.navigate("/product/shop")}
            >
              <Text style={styles.buttonText}>Tiếp tục mua</Text>
            </TouchableOpacity>
            {!isEmpty && (
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.buttonText}>Thanh toán</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    marginTop: 120,
  },
  empty: {
    fontSize: 16,
    color: "#888",
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  price: {
    color: "#e53935",
    fontWeight: "bold",
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  quantity: {
    marginHorizontal: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  totalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    marginLeft: 32,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: APP_COLOR.ORANGE,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default CartPage;
