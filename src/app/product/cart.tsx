import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput, // Import TextInput
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fallbackImg = "https://dosi-in.com/images/detailed/42/CDL10_1.jpg";
const SELECTED_KEYS_STORAGE_KEY = '@cart_selected_keys';

const CartPage = () => {
  const { setCart, setCheckoutData } = useCurrentApp();
  
  const [cartDetails, setCartDetails] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  // *** BƯỚC 1: THÊM STATE CHO TÌM KIẾM ***
  const [searchQuery, setSearchQuery] = useState('');

  // Các hàm lưu/tải từ AsyncStorage giữ nguyên
  const saveSelectedKeysToStorage = async (keys: string[]) => {
    try {
      const jsonValue = JSON.stringify(keys);
      await AsyncStorage.setItem(SELECTED_KEYS_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("Lỗi khi lưu lựa chọn vào bộ nhớ:", e);
    }
  };

  const loadSelectedKeysFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(SELECTED_KEYS_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Lỗi khi tải lựa chọn từ bộ nhớ:", e);
      return [];
    }
  };

  const fetchCart = async () => {
    try {
      const res = await getCartAPI();
      const cartItems = res || [];
      setCartId(res?.id || null);

      const details = await Promise.all(
        (Array.isArray(cartItems) ? cartItems : []).map(async (item: any) => {
          let detail = {};
          if (item.productVariantId) {
            try {
              const resVariant = await getProductVariantAPI(item.productVariantId);
              detail = resVariant.data || {};
            } catch (err) {
              detail = {};
            }
          }
          return { ...item, detail };
        })
      );
      setCart(cartItems);
      setCartDetails(details);
    } catch (e) {
      setCart([]);
      setCartDetails([]);
      Alert.alert("Lỗi", "Không thể tải giỏ hàng!");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await fetchCart();
        const storedKeys = await loadSelectedKeysFromStorage();
        setSelectedKeys(storedKeys);
        setLoading(false);
      };
      loadData();
    }, [])
  );

  useEffect(() => {
    const currentCartIds = new Set(cartDetails.map((item) => item.id));
    const cleanedKeys = selectedKeys.filter((id) => currentCartIds.has(id));
    if (cleanedKeys.length !== selectedKeys.length) {
      setSelectedKeys(cleanedKeys);
      saveSelectedKeysToStorage(cleanedKeys);
    }
  }, [cartDetails, selectedKeys]);
  
  // Các hàm tương tác giữ nguyên
  const toggleSelect = (id: string) => {
    const newKeys = selectedKeys.includes(id)
      ? selectedKeys.filter((x) => x !== id)
      : [...selectedKeys, id];
    setSelectedKeys(newKeys);
    saveSelectedKeysToStorage(newKeys);
  };
  
  const selectAll = () => {
    const allKeys = cartDetails.map((x) => x.id);
    setSelectedKeys(allKeys);
    saveSelectedKeysToStorage(allKeys);
  };

  const clearAll = () => {
    setSelectedKeys([]);
    saveSelectedKeysToStorage([]);
  };

  const handleRemoveSelected = () => {
    if (!selectedKeys.length) return;
    Alert.alert("Xác nhận", `Bạn chắc chắn xóa ${selectedKeys.length} sản phẩm đã chọn?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setUpdating(true);
          await removeCartItemAPI(selectedKeys);
          await fetchCart();
          const newKeys: string[] = [];
          setSelectedKeys(newKeys);
          await saveSelectedKeysToStorage(newKeys);
          setUpdating(false);
        },
      },
    ]);
  };

  const handleRemove = (id: string) => {
    Alert.alert("Xác nhận", "Bạn chắc chắn xoá sản phẩm này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          setUpdating(true);
          await removeCartItemAPI([id]);
          await fetchCart();
          setUpdating(false);
        },
      },
    ]);
  };
  
  const updateQuantity = async (item: any, newQty: number) => {
    if (newQty < 1) {
      handleRemove(item.id);
      return;
    }
    if (newQty > (item.detail?.quantity ?? 99)) {
      Alert.alert("Thông báo", "Số lượng vượt quá số lượng tồn kho.");
      return;
    }
    setUpdating(true);
    await updateCartItemAPI({ cartItemId: item.id, quantity: newQty });
    await fetchCart();
    setUpdating(false);
  };

  const handleCheckout = () => {
    if (!selectedKeys.length) {
      Alert.alert("Thông báo", "Vui lòng chọn sản phẩm để thanh toán!");
      return;
    }
    const selectedItems = cartDetails.filter((item) => selectedKeys.includes(item.id));
    setCheckoutData({ cart: selectedItems, cartId, userDetails: {}, cartSummary: {} });
    router.push("/order/checkout");
  };

  const getTotal = () =>
    cartDetails
      .filter((item) => selectedKeys.includes(item.id))
      .reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1), 0);

  // *** BƯỚC 2: LỌC DANH SÁCH SẢN PHẨM DỰA TRÊN TÌM KIẾM ***
  const filteredCartDetails = cartDetails.filter(item => {
    const itemName = (item.detail?.productName || item.productVariantName || '').toLowerCase();
    return itemName.includes(searchQuery.toLowerCase());
  });

  const renderItem = ({ item }: { item: any }) => {
    const detail = item.detail || {};
    const imageUrl = detail.imageUrl || fallbackImg;
    const isSelected = selectedKeys.includes(item.id);

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        style={[styles.itemContainer, isSelected && styles.itemSelected]}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.itemDetails}>
          <Text style={styles.name} numberOfLines={2}>{detail.productName || detail.name || item.productVariantName || "Sản phẩm"}</Text>
          <Text style={styles.price}>{(item.unitPrice || 0).toLocaleString()} VND</Text>
          <View style={styles.attrRow}>
            <Text style={styles.attr}>Size: {SIZE_LABELS[detail.size] || detail.size || "—"}</Text>
            <Text style={styles.attr}>Màu: {COLOR_LABELS[detail.color] || detail.color || "—"}</Text>
          </View>
          <View style={styles.quantityRow}>
            <TouchableOpacity onPress={() => updateQuantity(item, item.quantity - 1)} style={styles.qtyButton} disabled={updating || item.quantity <= 1}><Ionicons name="remove" size={20} color="#666" /></TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item, item.quantity + 1)} style={styles.qtyButton} disabled={updating}><Ionicons name="add" size={20} color="#333" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn} disabled={updating}><MaterialIcons name="delete-outline" size={24} color="#FF6B6B" /></TouchableOpacity>
          </View>
        </View>
        {isSelected && (<View style={styles.checkIconContainer}><Ionicons name="checkmark-circle" size={24} color={APP_COLOR.ORANGE} /></View>)}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><MaterialIcons name="shopping-cart-checkout" size={28} color={APP_COLOR.ORANGE} /><Text style={styles.title}>Giỏ Hàng</Text></View>
      
      {/* *** BƯỚC 3: THÊM THANH TÌM KIẾM VÀO GIAO DIỆN *** */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm trong giỏ..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.selectBar}>
        <TouchableOpacity onPress={selectAll} style={styles.selectAction}><Text style={{ color: APP_COLOR.ORANGE, fontWeight: "bold" }}>Chọn tất cả</Text></TouchableOpacity>
        <TouchableOpacity onPress={clearAll} style={styles.selectAction}><Text style={{ color: "#777" }}>Bỏ chọn</Text></TouchableOpacity>
        <Text style={{ marginLeft: "auto", color: "#555" }}>Đã chọn: {selectedKeys.length}/{cartDetails.length}</Text>
        {selectedKeys.length > 0 && (<TouchableOpacity onPress={handleRemoveSelected} style={[styles.selectAction, { borderColor: "#FF6B6B", marginLeft: 10 }]}><Text style={{ color: "#FF6B6B", fontWeight: "bold" }}>Xóa ({selectedKeys.length})</Text></TouchableOpacity>)}
      </View>
      <View style={{ flex: 1 }}>
        {loading ? (<ActivityIndicator size="large" style={{ marginTop: 50 }} color={APP_COLOR.ORANGE} />)
        : !cartDetails.length ? (
          <View style={styles.emptyContainer}>
            <Image source={{ uri: "https://bizweb.dktcdn.net/100/368/179/themes/738982/assets/empty-cart.png?1712982025915" }} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.navigate("/product/shop")}><Text style={styles.emptyButtonText}>Mua sắm ngay</Text></TouchableOpacity>
          </View>
        ) 
        // *** BƯỚC 4: HIỂN THỊ THÔNG BÁO KHI KHÔNG TÌM THẤY KẾT QUẢ ***
        : !filteredCartDetails.length ? (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-circle-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào khớp với "{searchQuery}"</Text>
            </View>
        )
        : (<FlatList data={filteredCartDetails} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 150, paddingTop: 8 }} />)}
      </View>
      {!loading && cartDetails.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Tổng cộng:</Text><Text style={styles.totalPrice}>{getTotal().toLocaleString()} VND</Text></View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.continueBtn} onPress={() => router.navigate("/product/shop")} disabled={loading || updating}><Text style={styles.continueBtnText}>Tiếp tục mua</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.checkoutBtn, (loading || updating || !selectedKeys.length) && { backgroundColor: "#FFDAB9" }]} onPress={handleCheckout} disabled={loading || updating || !selectedKeys.length}><Text style={styles.checkoutBtnText}>Thanh toán {selectedKeys.length ? `(${selectedKeys.length})` : ""}</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF", paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  title: { fontSize: 22, fontWeight: "bold", marginLeft: 12, color: "#212529" },
  // *** BƯỚC 5: THÊM STYLE CHO THANH TÌM KIẾM ***
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#333',
  },
  selectBar: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, paddingVertical: 10, paddingHorizontal: 16, marginTop: 5 },
  selectAction: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#F8F9FA", borderRadius: 20, borderWidth: 1, borderColor: "#E9ECEF" },
  emptyContainer: { alignItems: "center", justifyContent: 'center', flex: 1, paddingHorizontal: 20, backgroundColor: '#FFF' },
  emptyImage: { width: 150, height: 150, marginBottom: 20 },
  emptyText: { fontSize: 18, color: "#6C757D", marginTop: 16, marginBottom: 20, textAlign: 'center' },
  emptyButton: { backgroundColor: APP_COLOR.ORANGE, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 50 },
  emptyButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  itemContainer: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, marginVertical: 8, marginHorizontal: 16, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, borderWidth: 2, borderColor: 'transparent' },
  itemSelected: { borderColor: APP_COLOR.ORANGE, backgroundColor: '#FFF8E1' },
  checkIconContainer: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFF', borderRadius: 50 },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#F1F1F1" },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: "600", color: "#343A40", marginBottom: 4 },
  price: { color: "#212529", fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  attrRow: { flexDirection: "row", gap: 16, marginBottom: 8 },
  attr: { fontSize: 13, color: "#6C757D" },
  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 'auto' },
  qtyButton: { padding: 6, backgroundColor: "#F1F3F5", borderRadius: 8 },
  quantity: { marginHorizontal: 16, fontSize: 16, fontWeight: "600", color: "#212529" },
  removeBtn: { marginLeft: "auto", padding: 4 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#E9ECEF", paddingVertical: 12, paddingHorizontal: 16, paddingBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
  totalLabel: { fontSize: 18, fontWeight: "500", color: "#495057" },
  totalPrice: { fontSize: 20, fontWeight: "bold", color: '#E53935' },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  continueBtn: { flex: 1, paddingVertical: 14, borderRadius: 50, borderWidth: 1.5, borderColor: "#495057" },
  continueBtnText: { color: "#000000ff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  checkoutBtn: { flex: 1.2, backgroundColor: APP_COLOR.ORANGE, paddingVertical: 14, borderRadius: 50 },
  checkoutBtnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});

export default CartPage;
