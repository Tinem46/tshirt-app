import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // hoặc useLocalSearchParams nếu expo-router
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { getOrderDetailAPI } from "../utils/apiall";
import { SafeAreaView } from "react-native-safe-area-context";

const FormatCost = ({ value }: { value: number }) => (
  <Text style={{ fontWeight: "bold" }}>
    {Number(value || 0).toLocaleString()} VND
  </Text>
);

const OrderSuccessPage = () => {
  const navigation = useNavigation();

  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/"); // Điều hướng về trang chủ nếu không có orderId
      return;
    }

    const fetchOrder = async () => {
        console.log (`Fetching order details for ID: ${orderId}`);
      try {
        setLoading(true);
        const res = await getOrderDetailAPI(orderId); // Sử dụng API mới
        setOrder(res);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#e02828" />
        <Text style={{ marginTop: 16, color: "#888" }}>
          Đang tải chi tiết đơn hàng...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={{ color: "#e02828", fontSize: 18 }}>
          Không tìm thấy đơn hàng!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.homeBtn}
        >
          <Feather name="home" size={24} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "bold" }}>
            Về trang chủ
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    id,
    orderNumber,
    createdAt,
    receiverName,
    receiverPhone,
    shippingAddress,
    orderItems,
    totalAmount,
    subtotalAmount,
    shippingFee,
    taxAmount,
    paymentType,
    shippingMethodName,
  } = order || {};

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <View style={styles.resultBlock}>
        <Ionicons name="happy-outline" size={64} color="#38d63b" />
        <Text style={styles.resultTitle}>Đặt hàng thành công!</Text>
        <Text style={styles.resultSub}>
          <Text style={{ fontWeight: "bold" }}>Mã đơn hàng: </Text>
          <Text style={{ color: "#38d63b" }}>{orderNumber || id}</Text>
        </Text>
        <Text style={styles.resultSub}>
          Ngày đặt: {createdAt ? new Date(createdAt).toLocaleString() : "--"}
        </Text>
        <View style={styles.resultBtns}>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={[styles.btn, styles.btnHome]}
          >
            <Feather name="home" size={18} color="#fff" />
            <Text style={styles.btnText}>Về trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("MyOrders")}
            style={[styles.btn, styles.btnOrders]}
          >
            <Ionicons name="receipt-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>Xem đơn hàng của tôi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thông tin giao hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <View style={styles.descRow}>
          <Text style={styles.descLabel}>Người nhận:</Text>
          <Text style={styles.descValue}>{receiverName}</Text>
        </View>
        <View style={styles.descRow}>
          <Text style={styles.descLabel}>Số điện thoại:</Text>
          <Text style={styles.descValue}>{receiverPhone}</Text>
        </View>
        <View style={styles.descRow}>
          <Text style={styles.descLabel}>Địa chỉ:</Text>
          <Text style={styles.descValue}>{shippingAddress}</Text>
        </View>
        <View style={styles.descRow}>
          <Text style={styles.descLabel}>Hình thức giao hàng:</Text>
          <Text style={styles.descValue}>{shippingMethodName}</Text>
        </View>
      </View>

      {/* Thông tin đơn hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
        {(orderItems || []).map((item: any) => (
          <View style={styles.orderItem} key={item.id}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.itemImg} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.itemName}</Text>
              <Text style={{ color: "#666", fontSize: 13 }}>
                {item.selectedColor && `Màu: ${item.selectedColor} `}
                {item.selectedSize && `Size: ${item.selectedSize}`}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", minWidth: 70 }}>
              <Text>
                SL: <Text style={{ fontWeight: "bold" }}>{item.quantity}</Text>
              </Text>
              <FormatCost value={item.unitPrice * item.quantity} />
            </View>
          </View>
        ))}
      </View>

      {/* Tổng kết */}
      <View style={styles.totalsBlock}>
        <Text style={styles.totalRow}>
          Phí vận chuyển: <FormatCost value={shippingFee} />
        </Text>
        <Text style={styles.totalRow}>
          Thuế: <FormatCost value={taxAmount} />
        </Text>
        <Text style={styles.totalRow}>
          Tổng tiền hàng: <FormatCost value={subtotalAmount} />
        </Text>
        <Text style={styles.totalRowBold}>
          Tổng thanh toán:{" "}
          <Text style={{ color: "#e02828" }}>
            <FormatCost value={totalAmount} />
          </Text>
        </Text>
      </View>

      <View style={{ marginTop: 22, alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", color: "#555" }}>
          Phương thức thanh toán:
        </Text>
        <Text style={{ color: "#444", marginTop: 4 }}>
          {paymentType === "COD"
            ? "Thanh toán khi nhận hàng"
            : paymentType || ""}
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 50,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
    backgroundColor: "#f7f8fa",
  },
  resultBlock: {
    alignItems: "center",
    marginBottom: 22,
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 12,
    shadowColor: "#ececec",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 1,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#38d63b",
    marginTop: 11,
    marginBottom: 8,
  },
  resultSub: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
  },
  resultBtns: {
    flexDirection: "row",
    gap: 14,
    marginTop: 17,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 7,
    marginTop: 0,
  },
  btnHome: {
    backgroundColor: "#38d63b",
  },
  btnOrders: {
    backgroundColor: "#101828",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 11,
    padding: 15,
    marginTop: 18,
    marginBottom: 12,
    shadowColor: "#ececec",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#222",
    marginBottom: 11,
  },
  descRow: {
    flexDirection: "row",
    marginBottom: 7,
  },
  descLabel: {
    minWidth: 112,
    color: "#888",
    fontWeight: "500",
  },
  descValue: {
    color: "#232333",
    fontWeight: "bold",
    flex: 1,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.7,
    borderColor: "#f1f1f1",
    marginBottom: 2,
    minHeight: 54,
  },
  itemImg: {
    width: 52,
    height: 52,
    borderRadius: 7,
    marginRight: 13,
    backgroundColor: "#f7f8fa",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  totalsBlock: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 18,
    padding: 15,
    shadowColor: "#ececec",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
  },
  totalRow: {
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
    textAlign: "right",
  },
  totalRowBold: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
    marginTop: 12,
    textAlign: "right",
  },
  homeBtn: {
    backgroundColor: "#38d63b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 24,
  },
});

export default OrderSuccessPage;
