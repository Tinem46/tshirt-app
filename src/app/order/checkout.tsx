import {
    calculateCartTotalAPI,
    getUserAddressesAPI,
    getUserInfoAPI,
} from "@/app/utils/apiall";
import { useCurrentApp } from "@/context/app.context";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
  // Lấy dữ liệu từ context (checkoutData đã có cart chi tiết)
  const { checkoutData, setCheckoutData } = useCurrentApp();
  const { cart = [], cartId } = checkoutData;

  // Lấy ra id cho gọi API tổng tiền (nếu cần)
  const cartItemIds = cart.map((item) => item.id);

  // State cho thông tin user giống web
  const [userDetails, setUserDetails] = useState({
    fullname: "",
    specific_Address: "",
    city: "",
    district: "",
    ward: "",
    phone_number: "",
    email: "",
    gender: "",
    additionalInfo: "",
  });

  // Lấy info từ user đã đăng nhập và địa chỉ mặc định nếu có
  useEffect(() => {
    const fetchUserProfileAndAddress = async () => {
      try {
        const res = await getUserInfoAPI?.();
        const user = res || {};
        setUserDetails((prev) => ({
          ...prev,
          fullname:
            (user?.firstName ? user.firstName + " " : "") +
            (user?.lastName || ""),
          email: user?.email || "",
          gender: user?.gender || "",
          phone_number: user?.phoneNumber || "",
        }));
      } catch {}

      try {
        const res = await getUserAddressesAPI();
        let addresses = [];
        if (Array.isArray(res.data?.data)) {
          addresses = res.data.data;
        } else if (Array.isArray(res.data)) {
          addresses = res.data;
        }
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          setUserDetails((prev) => ({
            ...prev,
            fullname: defaultAddress.receiverName || prev.fullname,
            phone_number: defaultAddress.phone || prev.phone_number,
            specific_Address:
              defaultAddress.detailAddress || prev.specific_Address,
            city: defaultAddress.province || prev.city,
            district: defaultAddress.district || prev.district,
            ward: defaultAddress.ward || prev.ward,
          }));
        }
      } catch {}
    };
    fetchUserProfileAndAddress();
  }, []);

  // Tính tổng tiền
  const [cartSummary, setCartSummary] = useState({ totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        if (!cartItemIds.length) return;
        const res = await calculateCartTotalAPI(cartItemIds);
        setCartSummary(res?.data || res || { totalAmount: 0 });
      } catch (err) {
        setCartSummary({ totalAmount: 0 });
      }
      setLoading(false);
    };
    fetchSummary();
    // eslint-disable-next-line
  }, [cartItemIds.length]);
  useEffect(() => {
    console.log("CartSummary:", cart, checkoutData);
  }, []);

  // Xử lý input
  const handleInputChange = (name: any, value: any) => {
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Sang trang thanh toán (payment)
  const handleCheckout = () => {
    if (
      !userDetails.fullname ||
      !userDetails.specific_Address ||
      !userDetails.phone_number
    ) {
      Alert.alert("Vui lòng điền đầy đủ thông tin nhận hàng!");
      return;
    }
    setCheckoutData({
      ...checkoutData,
      userDetails,
      cartSummary,
      cartId,
      cart, // Giữ nguyên cart đã có detail!
    });
    router.push("/order/payment");
  };

  // Hiển thị 1 item cart (giờ đã có detail, image, name,...)
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
          <Text style={styles.header}>Thông tin giao hàng</Text>
          {/* --- Form --- */}
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
                      userDetails.gender === gen.value && styles.selectedOption,
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
              value={userDetails.specific_Address}
              onChangeText={(val) => handleInputChange("specific_Address", val)}
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
              value={userDetails.phone_number}
              onChangeText={(val) => handleInputChange("phone_number", val)}
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

          {/* --- Button --- */}
          <TouchableOpacity style={styles.button} onPress={handleCheckout}>
            <Text style={styles.buttonText}>Tiếp tục thanh toán</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ...styles giữ nguyên...

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 18,
    textAlign: "center",
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
