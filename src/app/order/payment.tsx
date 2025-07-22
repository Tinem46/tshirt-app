import { getShippingMethodsAPI, placeOrderAPI, fetchCouponAPI } from "@/app/utils/apiall";
import { api } from "@/config/api";
import { useCurrentApp } from "@/context/app.context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentPage = () => {
  const { checkoutData, appState } = useCurrentApp();
  const { cart = [], userDetails = {}, cartSummary = {} } = checkoutData || {};

  type ShippingMethod = {
    id: number | string;
    name: string;
    description?: string;
    fee: number;
  };

  // Coupon state
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCoupon, setModalCoupon] = useState<any>(null);

  // Shipping
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Đồng bộ lại coupon nếu cart thay đổi (reset mã)
  useEffect(() => {
    setSelectedCoupon(null);
    setDiscountAmount(0);
  }, [cartSummary?.totalAmount, cart]);

  // Lấy phương thức giao hàng
  useEffect(() => {
    const fetchShipping = async () => {
      setLoading(true);
      try {
        const res = await getShippingMethodsAPI();
        setShippingMethods(res?.data?.data || res?.data || []);
      } catch {
        Alert.alert("Không thể tải phương thức vận chuyển");
      }
      setLoading(false);
    };
    fetchShipping();
  }, []);

  // Lấy danh sách coupon (gọi API mỗi lần vào page)
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const res = await fetchCouponAPI();
        setCoupons(res.data || []);
      } catch {
        Alert.alert("Lỗi", "Không thể tải danh sách coupon!");
        setCoupons([]);
      }
      setLoadingCoupons(false);
    };
    fetchCoupons();
  }, []);

  // Lấy userId từ AsyncStorage
  const getUserId = async () => {
    const userId = await AsyncStorage.getItem("userId");
    return userId;
  };

  // ===== APPLY COUPON =====
  const handleApplyCoupon = async (coupon: any) => {
    if (!coupon) {
      setSelectedCoupon(null);
      setDiscountAmount(0);
      return;
    }
    
    try {
      const userId = await getUserId();
      const payload: any = {
        code: coupon.code,
        orderAmount: cartSummary?.totalAmount || 0,
        userId: userId,
      };
      const res = await api.post("Coupons/apply", payload);
      const data = res.data;
      if (!data?.isValid) {
        setSelectedCoupon(null);
        setDiscountAmount(0);
        Alert.alert(
          "Mã giảm giá không hợp lệ!",
          data?.message || "Không đủ điều kiện áp dụng."
        );
        return;
      }
      setSelectedCoupon(coupon);
      setDiscountAmount(data.discountAmount);
      Alert.alert("Áp dụng mã thành công!");
    } catch (err) {
      setSelectedCoupon(null);
      setDiscountAmount(0);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message ||
          "Không áp dụng được mã giảm giá. Vui lòng thử lại!"
      );
      console.error("Error applying coupon:", err?.response?.data, err);
    }
    
  };

  // ==== Tính lại phí, tổng tiền
  const shippingFee =
    shippingMethods.find((x: any) => x.id === shippingMethodId)?.fee ??
    cartSummary?.estimatedShipping ??
    0;
  const estimatedTotal =
    (cartSummary?.totalAmount || 0) +
    shippingFee -
    (cartSummary?.estimatedShipping || 0) -
    (discountAmount || 0);

  // ===== Đặt hàng
  const handlePlaceOrder = async () => {
    if (!shippingMethodId) {
      Alert.alert("Vui lòng chọn phương thức vận chuyển!");
      return;
    }
    setLoading(true);
    try {
      // Đảm bảo lấy userAddressId và newAddress từ checkoutData
      const { userAddressId, newAddress } = checkoutData;

      const payload = {
        UserAddressId: userAddressId || null,
        NewAddress: newAddress || null,
        CustomerNotes: userDetails?.additionalInfo || "",
        CouponId: selectedCoupon?.id || null,
        ShippingMethodId: shippingMethodId,
        OrderItems: cart.map((item) => ({
          ...(checkoutData.cartId ? { CartItemId: item.id ?? null } : {}),
          ProductVariantId: item.productVariantId ?? item.detail?.id ?? null,
          Quantity: item.quantity,
        })),
        PaymentMethod: 0, // Chỉ COD
      };

      const res = await placeOrderAPI(payload);
      const orderId = res?.order?.id || res?.orderId || null;

      Alert.alert("Đặt hàng thành công!", "", [
        {
          text: "OK",
          onPress: () => {
            router.replace({
              pathname: "/order/orderSuccessPage",
              params: { orderId },
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Đặt hàng thất bại!", "Vui lòng thử lại.");
    }
    setLoading(false);
  };

  // ==== RENDER ====
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#e5e2e2", paddingTop: 30 }}
    >
      <ScrollView style={styles.root}>
        {/* SHIPPING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức vận chuyển</Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            shippingMethods.map((m: any) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.optionRow,
                  shippingMethodId === m.id && styles.selectedOption,
                ]}
                onPress={() => setShippingMethodId(m.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "500" }}>
                    {m.name} {m.description ? `(${m.description})` : ""}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    Phí: {m.fee ? `${m.fee.toLocaleString()} VND` : "Miễn phí"}
                  </Text>
                </View>
                {shippingMethodId === m.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#111" />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* PAYMENT - chỉ COD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={[styles.optionRow, styles.selectedOption]}
            activeOpacity={1}
          >
            <Text style={{ fontWeight: "500" }}>
              Thanh toán khi nhận hàng (COD)
            </Text>
            <Ionicons name="checkmark-circle" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        {/* COUPON */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          {loadingCoupons ? (
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
              <ActivityIndicator size="small" color="#6366F1" style={{ marginRight: 8 }} />
              <Text style={{ color: "#6366F1" }}>Đang tải...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(coupons || []).map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.couponTag,
                    selectedCoupon?.id === c.id && styles.selectedCoupon,
                  ]}
                  onPress={() => {
                    setModalCoupon(c);
                    setModalVisible(true);
                  }}
                >
                  <Text
                    style={{
                      color: selectedCoupon?.id === c.id ? "#fff" : "#222",
                      fontWeight: selectedCoupon?.id === c.id ? "bold" : "500",
                    }}
                  >
                    {c.code} - {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {selectedCoupon && (
                <TouchableOpacity
                  style={[
                    styles.couponTag,
                    { backgroundColor: "#f43f5e", borderColor: "#f43f5e" },
                  ]}
                  onPress={() => handleApplyCoupon(null)}
                >
                  <Text style={{ color: "#fff" }}>Bỏ mã</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryTitle}>Chi tiết đơn hàng</Text>
          {(cart || []).map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Image
                source={{ uri: item.image || item.detail?.imageUrl }}
                style={styles.summaryImg}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.name || item.itemName || item.detail?.productName || ""}
                </Text>
                <Text style={styles.itemDetail}>x {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {(item.unitPrice * item.quantity).toLocaleString()} VND
              </Text>
            </View>
          ))}

          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>
              {(cartSummary?.totalAmount || 0).toLocaleString()} VND
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={styles.totalsValue}>
              {shippingFee.toLocaleString()} VND
            </Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, { color: "#10b981" }]}>
                Giảm giá
              </Text>
              <Text style={[styles.totalsValue, { color: "#10b981" }]}>
                -{discountAmount.toLocaleString()} VND
              </Text>
            </View>
          )}
          <View style={[styles.totalsRow, { marginTop: 7 }]}>
            <Text style={styles.totalsLabelBold}>Total</Text>
            <Text style={styles.totalsValueBold}>
              {estimatedTotal.toLocaleString()} VND
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.orderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.orderBtnText}>
            {loading ? "Đang đặt hàng..." : "Đặt hàng"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ===== COUPON MODAL ===== */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            {modalCoupon && (
              <>
                <Text style={modalStyles.modalTitle}>Chi tiết mã giảm giá</Text>
                <Text style={modalStyles.codeText}>
                  {modalCoupon.code} - {modalCoupon.name}
                </Text>
                <Text style={modalStyles.descText}>{modalCoupon.description}</Text>
                <Text style={modalStyles.valueText}>
                  Giảm: {modalCoupon.type === 0
                    ? `${modalCoupon.value}%`
                    : `${modalCoupon.value?.toLocaleString("vi-VN")}đ`}
                </Text>
                {modalCoupon.minOrderAmount && (
                  <Text style={modalStyles.condText}>
                    Đơn tối thiểu: {modalCoupon.minOrderAmount.toLocaleString("vi-VN")}đ
                  </Text>
                )}
                {modalCoupon.endDate && (
                  <Text style={modalStyles.condText}>
                    Hạn sử dụng: {new Date(modalCoupon.endDate).toLocaleDateString("vi-VN")}
                  </Text>
                )}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 22, justifyContent: "flex-end" }}>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={modalStyles.cancelBtn}
                  >
                    <Text style={{ color: "#555" }}>Huỷ</Text>
                  </Pressable>
                  <Pressable
                    style={modalStyles.applyBtn}
                    onPress={async () => {
                      setModalVisible(false);
                      await handleApplyCoupon(modalCoupon);
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Chọn mã này</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentPage;

const styles = StyleSheet.create({
  root: { flex: 1, padding: 14, backgroundColor: "#e5e2e2" },
  section: {
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 17,
    paddingHorizontal: 14,
    shadowColor: "#8a94a6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 11,
    color: "#232333",
    letterSpacing: 0.2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 9,
    backgroundColor: "#f9fafb",
    paddingVertical: 13,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e4e5f2",
  },
  selectedOption: { borderColor: "#111", backgroundColor: "#ececec" },
  couponTag: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: "#f4f4f4",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 10,
    marginBottom: 6,
  },
  selectedCoupon: {
    backgroundColor: "#111",
    borderColor: "#111",
    color: "#fff",
  },
  summaryBlock: {
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    marginTop: 5,
    shadowColor: "#8a94a6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 12,
    color: "#232333",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    gap: 9,
  },
  summaryImg: {
    width: 46,
    height: 46,
    borderRadius: 7,
    marginRight: 9,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemName: { fontWeight: "500", fontSize: 15, color: "#232333" },
  itemDetail: { fontSize: 13, color: "#757885" },
  itemPrice: { fontWeight: "600", fontSize: 15, color: "#232333" },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    marginTop: 1,
  },
  totalsLabel: { fontSize: 15, color: "#555" },
  totalsValue: { fontSize: 15, color: "#111" },
  totalsLabelBold: { fontSize: 17, color: "#222", fontWeight: "bold" },
  totalsValueBold: {
    fontSize: 18,
    color: "#bf0909",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  orderBtn: {
    marginTop: 2,
    backgroundColor: "#111",
    borderRadius: 9,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  orderBtnText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 0.7,
  },
});

// -------- MODAL STYLES --------
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
    color: "#2a2a2a",
  },
  codeText: {
    color: "#0f52ba",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  descText: {
    color: "#444",
    fontSize: 15,
    marginBottom: 6,
  },
  valueText: {
    fontSize: 16,
    color: "#d90429",
    fontWeight: "bold",
    marginBottom: 6,
  },
  condText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 2,
  },
  applyBtn: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
    marginRight: 6,
  },
});
