import {
  getCartAPI,
  getProductVariantAPI,
  removeCartItemAPI,
  updateCartItemAPI,
} from "@/app/utils/apiall";
import { APP_COLOR } from "@/app/utils/constant";
import { COLOR_LABELS, SIZE_LABELS } from "@/components/Enums/enumMaps";
import { useCurrentApp } from "@/context/app.context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enum map giống backend

const fallbackImg = "https://dosi-in.com/images/detailed/42/CDL10_1.jpg";

const CartPage = () => {
  const { cart, setCart } = useCurrentApp();
  const [cartDetails, setCartDetails] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const { setCheckoutData } = useCurrentApp();

  // Lấy giỏ hàng & chi tiết variant
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await getCartAPI();
      // Chuẩn hóa cho dạng array, tuỳ backend có thể là res.data hoặc res.data.data
      const cartItems = res || [];
      setCartId(res?.id || null);
      console.log("Cart items:", cartItems);

      // Lấy chi tiết variant từng item (nếu có)
      const details = await Promise.all(
        (Array.isArray(cartItems) ? cartItems : []).map(async (item: any) => {
          let detail = {};
          if (item.productVariantId) {
            try {
              const resVariant = await getProductVariantAPI(
                item.productVariantId
              );
              detail = resVariant.data || {};
              console.log("Variant detail:", detail);
            } catch (err) {
              detail = {};
            }
          }
          return { ...item, detail };
        })
      );
      setCart(cartItems);
      setCartDetails(details);
      setSelectedKeys(details.map((x) => x.id));
      console.log("Cart details:", details);
      console.log("Cart :", cart);
    } catch (e) {
      setCart([]);
      setCartDetails([]);
      Alert.alert("Lỗi", "Không thể tải giỏ hàng!");
      console.log("Cart error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Xóa sản phẩm 1 dòng
  const handleRemove = (id: string) => {
    Alert.alert("Xác nhận", "Bạn chắc chắn xoá sản phẩm này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          setUpdating(true);
          try {
            await removeCartItemAPI([id]);
            fetchCart();
          } catch {
            Alert.alert("Lỗi", "Không thể xoá sản phẩm.");
          }
          setUpdating(false);
        },
      },
    ]);
  };

  // Xóa nhiều sản phẩm đã chọn
  const handleRemoveSelected = () => {
    if (!selectedKeys.length) return;
    Alert.alert(
      "Xác nhận",
      `Bạn chắc chắn xóa ${selectedKeys.length} sản phẩm đã chọn?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setUpdating(true);
            try {
              await removeCartItemAPI(selectedKeys);
              setSelectedKeys([]);
              fetchCart();
              Alert.alert("Thành công", "Đã xóa sản phẩm khỏi giỏ hàng!");
            } catch {
              Alert.alert("Lỗi", "Không thể xóa sản phẩm!");
            }
            setUpdating(false);
          },
        },
      ]
    );
  };

  // Cập nhật số lượng (nếu <1 thì xoá)
  const updateQuantity = async (item: any, newQty: number) => {
    if (newQty < 1) {
      handleRemove(item.id);
      return;
    }
    setUpdating(true);
    try {
      await updateCartItemAPI({ cartItemId: item.id, quantity: newQty });
      fetchCart();
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng.");
    }
    setUpdating(false);
  };

  // Tổng giá trị các dòng được chọn
  const getTotal = () =>
    cartDetails
      .filter((item) => selectedKeys.includes(item.id))
      .reduce(
        (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
        0
      );

  // Multi-select row
  const toggleSelect = (id: string) => {
    setSelectedKeys((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const selectAll = () => setSelectedKeys(cartDetails.map((x) => x.id));
  const clearAll = () => setSelectedKeys([]);

  // Render 1 item cart
  const renderItem = ({ item }: { item: any }) => {
    const detail = item.detail || {};
    const imageUrl = detail.imageUrl || fallbackImg;
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        style={[
          styles.itemContainer,
          selectedKeys.includes(item.id) && styles.itemSelected,
        ]}
        activeOpacity={0.88}
      >
        <View style={{ position: "relative" }}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name} numberOfLines={2}>
            {detail.productName ||
              detail.name ||
              item.productVariantName ||
              "Sản phẩm"}
          </Text>
          <Text style={styles.price}>
            {(item.unitPrice || 0).toLocaleString()} VND
          </Text>
          <View style={styles.attrRow}>
            <Text style={styles.attr}>
              Size:{" "}
              {SIZE_LABELS[detail.size] ||
                detail.size ||
                item.productVariantName?.split(" - ")[1] ||
                "—"}
            </Text>
            <Text style={styles.attr}>
              Màu:{" "}
              {COLOR_LABELS[detail.color] ||
                detail.color ||
                item.productVariantName?.split(" - ")[0] ||
                "—"}
            </Text>
          </View>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              onPress={() => updateQuantity(item, item.quantity - 1)}
              style={styles.qtyButton}
              disabled={updating || item.quantity <= 1}
            >
              <Ionicons name="remove" size={20} color="#555" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item, item.quantity + 1)}
              style={styles.qtyButton}
              disabled={updating}
            >
              <Ionicons name="add" size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemove(item.id)}
              style={styles.removeBtn}
              disabled={updating}
            >
              <MaterialIcons name="delete" size={22} color="#e53935" />
            </TouchableOpacity>
          </View>
        </View>
        {selectedKeys.includes(item.id) && (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#111"
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", paddingTop: 20 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons
            name="shopping-cart"
            size={28}
            color={APP_COLOR.ORANGE}
          />
          <Text style={styles.title}>Giỏ Hàng</Text>
        </View>
        {/* Select multi */}
        <View style={styles.selectBar}>
          <TouchableOpacity onPress={selectAll} style={styles.selectAction}>
            <Text style={{ color: "black", fontWeight: "bold" }}>
              Chọn tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll} style={styles.selectAction}>
            <Text style={{ color: "#d32f2f" }}>Bỏ chọn</Text>
          </TouchableOpacity>
          <Text style={{ marginLeft: 10, color: "#333" }}>
            Đã chọn {selectedKeys.length}/{cartDetails.length}
          </Text>
          {selectedKeys.length > 0 && (
            <TouchableOpacity
              onPress={handleRemoveSelected}
              style={[styles.selectAction, { borderColor: "#d32f2f" }]}
            >
              <Text style={{ color: "#d32f2f", fontWeight: "bold" }}>
                Xóa đã chọn ({selectedKeys.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : !cartDetails.length ? (
          <View style={styles.emptyContainer}>
            <Image
              source={{
                uri: "https://bizweb.dktcdn.net/100/368/179/themes/738982/assets/empty-cart.png?1712982025915",
              }}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.empty}>Giỏ hàng trống</Text>
          </View>
        ) : (
          <FlatList
            data={cartDetails}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold", fontSize: 17 }}>Tổng cộng:</Text>
            <Text
              style={{ fontWeight: "bold", fontSize: 17, color: "#e53935" }}
            >
              {getTotal().toLocaleString()} VND
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => router.navigate("/product/shop")}
              disabled={loading || updating}
            >
              <Text style={styles.buttonText}>Tiếp tục mua</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                if (!selectedKeys.length) {
                  Alert.alert(
                    "Thông báo",
                    "Chưa chọn sản phẩm nào để thanh toán!"
                  );
                  return;
                }
                // Lấy ra các item đã chọn đã có detail
                const selectedItems = cartDetails.filter((item) =>
                  selectedKeys.includes(item.id)
                );
                // SET checkoutData vào context
                setCheckoutData({
                  cart: selectedItems, // đã có detail như web
                  cartId,
                  userDetails: {}, // hoặc null, sẽ nhập ở bước sau
                  cartSummary: {}, // sẽ tính ở bước sau
                });
                router.push("/order/checkout");
              }}
              disabled={loading || updating || !selectedKeys.length}
            >
              <Text style={styles.buttonText}>
                Thanh toán{" "}
                {selectedKeys.length ? `(${selectedKeys.length})` : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginLeft: 12, color: "#111" },

  selectBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
    flexWrap: "wrap",
  },
  selectAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyImage: { width: 180, height: 180, marginBottom: 18, marginTop: 36 },
  empty: { fontSize: 17, color: "#aaa", marginTop: 4 },

  itemContainer: {
    flexDirection: "row",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderColor: "#eaeaea",
    marginBottom: 14,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    position: "relative",
    minHeight: 92,
    paddingHorizontal: 6,
  },
  itemSelected: {
    borderColor: "#111",
    borderWidth: 2,
    backgroundColor: "#f8f8f8",
  },
  checkIcon: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "#fff",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#111",
    zIndex: 10,
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: 11,
    backgroundColor: "#f6f6f6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ededed",
  },
  name: { fontSize: 16, fontWeight: "600", color: "#111", marginBottom: 1 },
  price: { color: "#111", fontWeight: "bold", marginBottom: 1, fontSize: 15.5 },
  attrRow: { flexDirection: "row", gap: 14, marginTop: 4 },
  attr: { fontSize: 13.5, color: "#555" },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  qtyButton: {
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderWidth: 1.2,
    borderColor: "#bbb",
    borderRadius: 7,
    backgroundColor: "#fafafa",
  },
  quantity: {
    marginHorizontal: 13,
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
  removeBtn: { marginLeft: 18, padding: 2 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ececec",
    padding: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  buttonRow: { flexDirection: "row", gap: 16, marginTop: 2 },
  continueBtn: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 13,
    borderRadius: 9,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#111",
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: "orange",
    paddingVertical: 13,
    borderRadius: 9,
    marginLeft: 6,
    borderWidth: 2,
    borderColor: "#111",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});

export default CartPage;
