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

// Bạn có thể lấy data từ context hoặc params, ở đây lấy từ context (chuẩn best practice)
const PaymentPage = () => {
  const { checkoutData } = useCurrentApp();
  const {
    userDetails,
    cartSummary: summaryInit,
    cart,
    cartId,
  } = checkoutData || {};

  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"COD" | "VNPAY">("COD");
  const [loading, setLoading] = useState(false);

  // Không fetch lại cartSummary! Sử dụng đúng giá trị từ checkout
  const [summary, setSummary] = useState<any>(summaryInit || {});

  // Lấy shipping methods
  useEffect(() => {
    const fetchShipping = async () => {
      try {
        setLoading(true);
        const res = await getShippingMethodsAPI();
        setShippingMethods(res.data);
        console.log("Shipping methods:", res);
      } catch {
        Alert.alert("Không thể tải phương thức vận chuyển");
      } finally {
        setLoading(false);
      }
    };
    fetchShipping();
  }, []);

  // Tính lại estimatedTotal khi đổi shipping (giống web, chỉ tính lại ở client)
  const shippingFee =
    (Array.isArray(shippingMethods)
      ? shippingMethods.find((x) => x.id === shippingMethodId)?.fee
      : undefined) ??
    summary?.estimatedShipping ??
    0;
  const estimatedTotal =
    (summary?.estimatedTotal || 0) +
    shippingFee -
    (summary?.estimatedShipping || 0);

  // Đặt hàng
  const handlePlaceOrder = async () => {
    if (!shippingMethodId) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn phương thức giao hàng!");
      return;
    }
    if (!paymentType) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn phương thức thanh toán!");
      return;
    }
    console.log("Phone number gửi lên:", userDetails.phone_number);
    console.log("OrderItems gửi lên:", cart);

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
      couponId: null,
      shippingMethodId,
      orderItems: cart.map((item: any) => ({
        cartItemId: item.id,
        productId: item.productId,
        customDesignId: item.customDesignId || null,
        productVariantId: item.productVariantId || null,
        itemName: item.name,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      paymentType,
    };

    try {
      setLoading(true);
      const res = await placeOrderAPI(payload);
      console.log("Kết quả đặt hàng:", res);
      const orderId = res.id;
      console.log("OrderId trả về từ API:", orderId); // <--- LOG ORDER ID

      Alert.alert("Đặt hàng thành công!");
      router.push({
        pathname: "/order/orderSuccessPage",
        params: { orderId }, // Truyền orderId qua params
      });
    } catch (err) {
      Alert.alert("Đặt hàng thất bại! Vui lòng thử lại.");
      console.log("Lỗi đặt hàng:", err);
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
                    {m.name} ({m.description})
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

        {/* PAYMENT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
          {["COD", "VNPAY"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionRow,
                paymentType === type && styles.selectedOption,
              ]}
              onPress={() => setPaymentType(type as any)}
            >
              <Text style={{ fontWeight: "500" }}>
                {type === "COD"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : "VNPay (ATM/QR)"}
              </Text>
              {paymentType === type && (
                <Ionicons name="checkmark-circle" size={22} color="#111" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryTitle}>Chi tiết đơn hàng</Text>
          {cart.map((item: any) => (
            <View key={item.id} style={styles.summaryRow}>
              <Image source={{ uri: item.image }} style={styles.summaryImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>
                  x {item.quantity}
                  {item.selectedColor ? ` - ${item.selectedColor}` : ""}
                  {item.selectedSize ? ` - ${item.selectedSize}` : ""}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {(item.unitPrice * item.quantity).toLocaleString()} VND
              </Text>
            </View>
          ))}
         
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={styles.totalsValue}>
              {shippingFee.toLocaleString()} VND
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>
              {summary?.estimatedTax?.toLocaleString() || 0} VND
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
          <Text style={styles.orderBtnText}>Đặt hàng</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentPage;

// ==== STYLE ====
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
