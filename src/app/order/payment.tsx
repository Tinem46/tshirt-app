import { getShippingMethodsAPI, placeOrderAPI } from "@/app/utils/apiall";
import { useCurrentApp } from "@/context/app.context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentPage = () => {
  const { checkoutData, selectedCoupon, userCoupons, setSelectedCoupon } =
    useCurrentApp();
  const {
    cart = [],
    userDetails = {},
    cartSummary = {},
    cartId,
  } = checkoutData || {};

  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingMethodId, setShippingMethodId] = useState(null);
  const [loading, setLoading] = useState(false);

  const enrichCartItems = (cart) => {
    return cart.map((item) => {
      const detail = item.detail || {};
      return {
        ...item,
        productId: item.productId ?? detail.productId ?? null,
        name: item.name ?? detail.productName ?? "",
        image: item.image ?? detail.imageUrl ?? "",
        productVariantId: item.productVariantId ?? detail.id ?? null,
        productVariantName: item.productVariantName ?? detail.variantSku ?? "",
        selectedColor: item.selectedColor ?? detail.color ?? "",
        selectedSize: item.selectedSize ?? detail.size ?? "",
        unitPrice: item.unitPrice ?? detail.price ?? 0,
        quantity: item.quantity,
      };
    });
  };

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
  useEffect(() => {
    console.log("Cart123:", cart);
  }, [cart]);

  // Tính lại phí và tổng tiền
  const shippingFee =
    shippingMethods.find((x) => x.id === shippingMethodId)?.fee ??
    cartSummary?.estimatedShipping ??
    0;
  const estimatedTotal =
    (cartSummary?.totalAmount || 0) +
    shippingFee -
    (cartSummary?.estimatedShipping || 0);

  // Đặt hàng
  const handlePlaceOrder = async () => {
    if (!shippingMethodId) {
      Alert.alert("Vui lòng chọn phương thức vận chuyển!");
      return;
    }
    setLoading(true);

    try {
      const enrichedCart = enrichCartItems(cart);

      const payload = {
        userAddressId: null,
        newAddress: {
          receiverName: userDetails.fullname,
          phone: userDetails.phone_number,
          detailAddress: userDetails.specific_Address,
          ward: userDetails.ward,
          district: userDetails.district,
          province: userDetails.country,
          postalCode: "",
          isDefault: false,
        },
        customerNotes: userDetails.additionalInfo,
        couponId: selectedCoupon?.id || null,
        shippingMethodId,

        orderItems: enrichedCart.map((item) => ({
          cartItemId: item.id,
          productId: item.productId,
          customDesignId: item.customDesignId ?? null,
          productVariantId: item.productVariantId,
          itemName: item.name,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          image: item.image,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod: 1, // Chỉ hỗ trợ COD
        paymentDescription: "Thanh toán khi nhận hàng",
      };

      console.log("OrderItems gửi đi:", payload.orderItems);
      console.log("Payload đặt hàng:", JSON.stringify(payload, null, 2));

      const res = await placeOrderAPI(payload);
      const orderId =
        res?.data?.order?.id ||
        res?.data?.id ||
        res?.data?.data?.id ||
        res?.id ||
        null;

      console.log("Order API response:", JSON.stringify(res, null, 2));
      if (!orderId) {
        Alert.alert("Không thể đặt hàng, vui lòng thử lại sau!");
        return;
      }

      Alert.alert("Đặt hàng thành công!");
      router.replace({
        pathname: "/order/orderSuccessPage",
        params: { orderId },
      });
    } catch (error: any) {
      Alert.alert("Đặt hàng thất bại!", "Vui lòng thử lại.");
      // Log toàn bộ error để debug chính xác lỗi gì:
      console.error("Error placing order:", {
        message: error.message,
        response: error.response ? error.response.data : null,
        status: error.response ? error.response.status : null,
        headers: error.response ? error.response.headers : null,
        config: error.config,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==== UI ====
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
            shippingMethods.map((m) => (
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
            style={[
              styles.optionRow,
              true && styles.selectedOption, // luôn chọn
            ]}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(userCoupons || []).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.couponTag,
                  selectedCoupon?.id === c.id && styles.selectedCoupon,
                ]}
                onPress={() => setSelectedCoupon(c)}
              >
                <Text
                  style={{
                    color: selectedCoupon?.id === c.id ? "#fff" : "#222",
                  }}
                >
                  {c.code} - {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    </SafeAreaView>
  );
};

export default PaymentPage;

// ==== STYLE (giữ nguyên) ====
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
