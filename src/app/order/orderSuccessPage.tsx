import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrderDetailAPI } from "../utils/apiall";
import { APP_COLOR } from '../utils/constant'; // Giả sử bạn có file này

// --- COMPONENT NHỎ ---
const FormatCost = ({ value }: { value: number }) => (
  <Text style={{ fontWeight: "bold" }}>
    {Number(value || 0).toLocaleString()} VND
  </Text>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

// --- COMPONENT CHÍNH ---
const OrderSuccessPage = () => {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.replace("/"); // Điều hướng về trang chủ nếu không có orderId
      return;
    }

    const fetchOrderAndClearSelections = async () => {
      console.log(`Fetching order details for ID: ${orderId}`);
      try {
        setLoading(true);
        const res = await getOrderDetailAPI(orderId);
        setOrder(res);
        console.log("API Response for Order Detail:", JSON.stringify(res, null, 2));
        await AsyncStorage.removeItem('@cart_selected_keys');
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderAndClearSelections();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator size="large" color={APP_COLOR.ORANGE} />
        <Text style={{ marginTop: 16, color: "#888", fontSize: 16 }}>
          Đang tải chi tiết đơn hàng...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerWrap}>
        <Ionicons name="alert-circle-outline" size={64} color="#E53935" />
        <Text style={{ color: "#E53935", fontSize: 18, marginTop: 16, fontWeight: 'bold' }}>
          Không tìm thấy đơn hàng!
        </Text>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.primaryBtn}>
          <Feather name="home" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Về trang chủ</Text>
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
    paymentType,
    shippingMethodName,
  } = order || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.resultBlock}>
          <Ionicons name="checkmark-circle" size={64} color={APP_COLOR.ORANGE} />
          <Text style={styles.resultTitle}>Đặt hàng thành công!</Text>
          <Text style={styles.resultSub}>
            <Text style={{ fontWeight: "bold" }}>Mã đơn hàng: </Text>
            <Text style={{ color: APP_COLOR.ORANGE, fontWeight: 'bold' }}>{orderNumber || id}</Text>
          </Text>
          <Text style={styles.resultSub}>
            Ngày đặt: {createdAt ? new Date(createdAt).toLocaleString() : "--"}
          </Text>
          <View style={styles.resultBtns}>
            <TouchableOpacity onPress={() => router.replace("/")} style={styles.primaryBtn}>
              <Feather name="home" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Về trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            onPress={() => router.push("/(user)/orders")} 
            style={styles.secondaryBtn}>
              <Ionicons name="receipt-outline" size={20} color="#495057" />
              <Text style={styles.secondaryBtnText}>Xem đơn hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thông tin giao hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <InfoRow label="Người nhận:" value={receiverName} />
          <InfoRow label="Số điện thoại:" value={receiverPhone} />
          <InfoRow label="Địa chỉ:" value={shippingAddress} />
          <InfoRow label="Giao hàng:" value={shippingMethodName} />
        </View>

        {/* Thông tin đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {(orderItems || []).map((item: any) => (
            <View style={styles.orderItem} key={item.id}>
              <Image source={{ uri: item.image || 'https://placehold.co/100x100/f1f1f1/ccc?text=Image' }} style={styles.itemImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>{item.variantName}</Text>
                <Text style={styles.itemAttr}>
                  {item.selectedColor && `Màu: ${item.selectedColor} `}
                  {item.selectedSize && `Size: ${item.selectedSize}`}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", minWidth: 80 }}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <FormatCost value={item.unitPrice * item.quantity} />
              </View>
            </View>
          ))}
        </View>

        {/* Tổng kết */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng kết đơn hàng</Text>
             <InfoRow label="Tổng tiền hàng:" value={`${(subtotalAmount || 0).toLocaleString()} VND`} />
             <InfoRow label="Phí vận chuyển:" value={`${(shippingFee || 0).toLocaleString()} VND`} />
             <View style={styles.totalFinalRow}>
                <Text style={styles.totalFinalLabel}>Tổng thanh toán:</Text>
                <Text style={styles.totalFinalPrice}><FormatCost value={totalAmount} /></Text>
             </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  resultBlock: {
    alignItems: "center",
    margin: 16,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#212529",
    marginTop: 12,
    marginBottom: 8,
  },
  resultSub: {
    fontSize: 15,
    color: "#495057",
    marginBottom: 4,
  },
  resultBtns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: APP_COLOR.ORANGE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#DEE2E6'
  },
  secondaryBtnText: {
    color: "#495057",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#212529",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: "#6C757D",
    fontSize: 15,
  },
  infoValue: {
    color: "#212529",
    fontWeight: "600",
    fontSize: 15,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#F1F3F5",
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F8F9FA",
  },
  itemName: {
    fontWeight: "600",
    color: '#343A40',
    fontSize: 15,
  },
  itemAttr: {
    color: "#868E96",
    fontSize: 13,
    marginTop: 4,
  },
  itemQuantity: {
    color: '#495057',
    fontSize: 14,
    marginBottom: 4,
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#F1F3F5',
  },
  totalFinalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  totalFinalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
  }
});

export default OrderSuccessPage;
