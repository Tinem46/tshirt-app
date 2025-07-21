import {
  calculateCartTotalAPI,
  getUserAddressesAPI,
  getUserInfoAPI,
} from "@/app/utils/apiall";
import { useCurrentApp } from "@/context/app.context";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICartItem } from "../types/model";

const GENDERS = [
  { value: "Male", label: "Nam" },
  { value: "Female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const CheckoutPage = () => {
  const { checkoutData, setCheckoutData } = useCurrentApp();
  const { cart = [], cartId } = checkoutData;

  const cartItemIds = cart.map((item) => item.id);

  // Địa chỉ đã lưu
  const [addressList, setAddressList] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Form nhập mới
  const [userDetails, setUserDetails] = useState<any>({
    fullname: "",
    detailAddress: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    email: "",
    gender: "",
    additionalInfo: "",
  });

  // Tổng tiền
  const [cartSummary, setCartSummary] = useState({ totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  // Lấy info user và địa chỉ đã lưu
  useEffect(() => {
    const fetchData = async () => {
      setLoadingAddress(true);
      try {
        // Profile
        const res = await getUserInfoAPI?.();
        const user = res || {};
        setUserDetails((prev: any) => ({
          ...prev,
          fullname:
            (user?.firstName ? user.firstName + " " : "") +
            (user?.lastName || ""),
          email: user?.email || "",
          gender: user?.gender || "",
          phone: user?.phoneNumber || "",
        }));

        // Địa chỉ
        const addrRes = await getUserAddressesAPI();
        let addresses = [];
        if (Array.isArray(addrRes.data?.data)) {
          addresses = addrRes.data.data;
        } else if (Array.isArray(addrRes.data)) {
          addresses = addrRes.data;
        }
        setAddressList(addresses);
        const defaultAddr = addresses.find((a: any) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (e) {}
      setLoadingAddress(false);
    };
    fetchData();
  }, []);

  // Tổng tiền
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        if (cartItemIds.length && cartId) {
          // Đơn mua từ giỏ hàng -> gọi API
          const res = await calculateCartTotalAPI(cartItemIds);
          setCartSummary(res?.data || res || { totalAmount: 0 });
        } else {
          // Đơn "Buy Now" (không có cartId, tự tính)
          const subTotal = cart.reduce(
            (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
            0
          );
          setCartSummary({
            totalAmount: subTotal,
          });
        }
      } catch (err) {
        setCartSummary({ totalAmount: 0 });
      }
      setLoading(false);
    };
    fetchSummary();
  }, [cartItemIds.length, cartId]);

  // Xử lý input nhập mới
  const handleInputChange = (name: string, value: string) => {
    setUserDetails((prev: any) => ({ ...prev, [name]: value }));
  };

  // Chọn địa chỉ đã lưu hoặc nhập mới
  const handleAddressSelect = (addrId: string | "new") => {
    if (addrId === "new") {
      setIsNewAddress(true);
      setSelectedAddressId(null);
    } else {
      setIsNewAddress(false);
      setSelectedAddressId(addrId);
    }
  };

  // Sang payment
  const handleCheckout = () => {
    if (isNewAddress) {
      if (
        !userDetails.fullname ||
        !userDetails.detailAddress ||
        !userDetails.city ||
        !userDetails.district ||
        !userDetails.ward ||
        !userDetails.phone
      ) {
        Alert.alert("Vui lòng nhập đủ thông tin giao hàng!");
        return;
      }
    } else {
      if (!selectedAddressId) {
        Alert.alert("Bạn chưa chọn địa chỉ giao hàng!");
        return;
      }
    }

    setCheckoutData({
      ...checkoutData,
      cartSummary,
      cartId,
      cart,
      userAddressId: isNewAddress ? null : selectedAddressId,
      newAddress: isNewAddress
        ? {
            receiverName: userDetails.fullname,
            phone: userDetails.phone,
            detailAddress: userDetails.detailAddress,
            ward: userDetails.ward,
            district: userDetails.district,
            province: userDetails.city,
            isDefault: false,
          }
        : null,
      userDetails,
    });
    router.push("/order/payment");
  };

  // Render 1 item cart
  const renderItem = ({ item }: { item: ICartItem }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: item.detail?.imageUrl || item.image }}
        style={styles.productImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>
          {item.detail?.productName || item.name}
        </Text>
        <Text style={styles.productInfo}>
          Số lượng: <Text style={styles.bold}>{item.quantity}</Text>
        </Text>
      </View>
      <Text style={styles.itemPrice}>
        {(item.unitPrice * item.quantity).toLocaleString()} VND
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Chọn địa chỉ giao hàng</Text>

          {/* Địa chỉ đã lưu */}
          {loadingAddress ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : (
            <View>
              {addressList.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressCard,
                    !isNewAddress &&
                      selectedAddressId === addr.id &&
                      styles.addressCardSelected,
                  ]}
                  onPress={() => handleAddressSelect(addr.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontWeight: "700", fontSize: 16 }}>
                    {addr.receiverName} | {addr.phone}
                  </Text>
                  <Text style={{ color: "#555", marginTop: 2 }}>
                    {addr.detailAddress}, {addr.ward}, {addr.district},{" "}
                    {addr.province}
                  </Text>
                  {addr.isDefault && (
                    <Text style={styles.defaultBadge}>(Mặc định)</Text>
                  )}
                </TouchableOpacity>
              ))}

              {/* Chọn nhập địa chỉ mới */}
              <TouchableOpacity
                style={[
                  styles.addressCard,
                  isNewAddress && styles.addressCardSelected,
                  { borderStyle: "dashed" },
                ]}
                onPress={() => handleAddressSelect("new")}
                activeOpacity={0.8}
              >
                <Text
                  style={{ fontWeight: "700", fontSize: 16, color: "#3b82f6" }}
                >
                  + Nhập địa chỉ mới
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Nếu nhập mới, hiển thị form */}
          {isNewAddress && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                value={userDetails.fullname}
                onChangeText={(val) => handleInputChange("fullname", val)}
                placeholder="Họ và tên"
                placeholderTextColor="#888"
              />
              <View style={styles.selectInput}>
                <Text style={styles.label}>Giới tính:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {GENDERS.map((gen) => (
                    <TouchableOpacity
                      key={gen.value}
                      style={[
                        styles.selectOption,
                        userDetails.gender === gen.value &&
                          styles.selectedOption,
                      ]}
                      onPress={() => handleInputChange("gender", gen.value)}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          userDetails.gender === gen.value &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {gen.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TextInput
                style={styles.input}
                value={userDetails.detailAddress}
                onChangeText={(val) => handleInputChange("detailAddress", val)}
                placeholder="Địa chỉ chi tiết (số nhà, tên đường)"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                value={userDetails.city}
                onChangeText={(val) => handleInputChange("city", val)}
                placeholder="Tỉnh / Thành phố"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                value={userDetails.district}
                onChangeText={(val) => handleInputChange("district", val)}
                placeholder="Quận / Huyện"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                value={userDetails.ward}
                onChangeText={(val) => handleInputChange("ward", val)}
                placeholder="Phường / Xã"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                value={userDetails.phone}
                onChangeText={(val) => handleInputChange("phone", val)}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                value={userDetails.email}
                onChangeText={(val) => handleInputChange("email", val)}
                placeholder="Địa chỉ email"
                keyboardType="email-address"
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, { height: 76 }]}
                value={userDetails.additionalInfo}
                onChangeText={(val) => handleInputChange("additionalInfo", val)}
                placeholder="Ghi chú thêm (tuỳ chọn)"
                placeholderTextColor="#888"
                multiline
              />
            </View>
          )}

          {/* --- Order Summary --- */}
          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>Đơn hàng của bạn</Text>
            <FlatList
              data={cart}
              keyExtractor={(item: ICartItem, idx) => item.id + "-" + idx}
              renderItem={renderItem}
              scrollEnabled={false}
              style={{ marginBottom: 10 }}
            />

            <View style={styles.summaryRow}>
              <Text style={{ fontWeight: "bold" }}>Tổng cộng:</Text>
              <Text style={{ fontWeight: "bold", color: "#e53935" }}>
                {(cartSummary.totalAmount ?? 0).toLocaleString()} VND
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCheckout}>
            <Text style={styles.buttonText}>Tiếp tục thanh toán</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ---- Styles giữ nguyên + thêm card address ----
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 18,
    textAlign: "center",
  },
  addressCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e4e7ec",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  addressCardSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#e0e7ff",
  },
  defaultBadge: {
    color: "#10b981",
    fontWeight: "700",
    marginTop: 3,
  },
  form: {
    marginBottom: 26,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e4e4e4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 11,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fff",
  },
  selectInput: {
    marginBottom: 11,
  },
  label: {
    fontSize: 15,
    color: "#222",
    marginBottom: 3,
    fontWeight: "500",
  },
  selectOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e4e4",
    borderRadius: 18,
    marginRight: 9,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  selectOptionText: { color: "#111" },
  selectedOptionText: { color: "#fff", fontWeight: "bold" },
  orderSummary: {
    marginBottom: 25,
    marginTop: 10,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 15,
    elevation: 1,
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#111",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#e5e5e5",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  productImage: { width: 56, height: 56, borderRadius: 8, marginRight: 10 },
  itemDetails: { flex: 1 },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  productInfo: { fontSize: 14, color: "#555" },
  bold: { fontWeight: "bold", color: "#111" },
  itemPrice: { fontSize: 15, color: "#111", fontWeight: "600" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 17,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.2,
  },
});

export default CheckoutPage;
