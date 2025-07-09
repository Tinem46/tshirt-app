import { useCurrentApp } from "@/context/app.context";
import { router, useLocalSearchParams } from "expo-router";
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
import { getCartSummaryAPI } from "../utils/apiall";

// Quốc gia (tuỳ chỉnh theo backend của bạn)
const COUNTRIES = [
  { value: "", label: "Chọn quốc gia/khu vực" },
  { value: "Vietnam", label: "Việt Nam" },
  { value: "Laos", label: "Lào" },
  { value: "Cambodia", label: "Campuchia" },
  { value: "Thailand", label: "Thái Lan" },
];

const GENDERS = [
  { value: "", label: "Giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];
const CheckoutPage = () => {
  const { cartId } = useLocalSearchParams<{ cartId?: string }>();
  const {
    cart,
    setCart,
    buyNowItem,
    setBuyNowItem,
    appState,
    setCheckoutData,
  } = useCurrentApp();

  // Nếu mua ngay thì chỉ lấy đúng item đó, ngược lại lấy cả cart
  const items = buyNowItem ? [buyNowItem] : cart;

  // State cho thông tin user
  const [userDetails, setUserDetails] = useState({
    fullname: "",
    country: "",
    specific_Address: "",
    city: "",
    district: "",
    ward: "",
    phone_number: "",
    email: "",
    gender: "",
    additionalInfo: "",
  });

  // Tự động điền thông tin từ appState nếu có (nếu user đã login)
  useEffect(() => {
    if (!appState?.user) return;
    const user = appState.user;
    setUserDetails((prev) => ({
      ...prev,
      fullname:
        (user?.firstName ? user.firstName + " " : "") + (user?.lastName || ""),
      country: "",
      specific_Address: user?.address || "",
      city: user?.city || "",
      district: user?.district || "",
      ward: user?.ward || "",
      phone_number: user?.phoneNumber || "",
      email: user?.email || "",
      gender:
        Number(user?.gender) === 0
          ? "male"
          : Number(user?.gender) === 1
          ? "female"
          : Number(user?.gender) === 2
          ? "other"
          : "",
    }));
  }, [appState?.user]);

  // Giả lập API tính tổng
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    estimatedShipping: 0,
    estimatedTax: 0,
    estimatedTotal: 0,
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await getCartSummaryAPI();
        setCartSummary(res);
        console.log("Cart summary:", res);
      } catch (err) {
        setCartSummary({
          subtotal: 0,
          estimatedShipping: 0,
          estimatedTax: 0,
          estimatedTotal: 0,
        });
      }
      setLoading(false);
    };
    fetchSummary();
  }, []);

  // Xử lý input
  const handleInputChange = (name: string, value: string) => {
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý thanh toán
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
      userDetails,
      cartSummary,
      cartId,
      cart,
    });
    router.push("/order/payment");
  };

  // Hiển thị 1 item cart
  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Image
        source={{ uri: item.product?.image || item.image }}
        style={styles.productImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>
          {item.product?.name || item.name}
        </Text>
        <Text style={styles.productInfo}>
          Số lượng: <Text style={styles.bold}>{item.quantity}</Text>
        </Text>
      </View>
      <Text style={styles.itemPrice}>
        {(
          (item.product?.price || item.unitPrice) * item.quantity
        ).toLocaleString()}{" "}
        VND
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Billing Details</Text>
          {/* --- Form --- */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={userDetails.fullname}
              onChangeText={(val) => handleInputChange("fullname", val)}
              placeholder="Full Name"
              placeholderTextColor="#888"
            />
            {/* Quốc gia */}
            <View style={styles.selectInput}>
              <Text style={styles.label}>Country/Region:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {COUNTRIES.map((ct) => (
                  <TouchableOpacity
                    key={ct.value}
                    style={[
                      styles.selectOption,
                      userDetails.country === ct.value && styles.selectedOption,
                    ]}
                    onPress={() => handleInputChange("country", ct.value)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        userDetails.country === ct.value &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {ct.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* Gender */}
            <View style={styles.selectInput}>
              <Text style={styles.label}>Gender:</Text>
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
              placeholder="Street Address"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={userDetails.city}
              onChangeText={(val) => handleInputChange("city", val)}
              placeholder="City"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={userDetails.district}
              onChangeText={(val) => handleInputChange("district", val)}
              placeholder="District (Quận/Huyện)"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={userDetails.ward}
              onChangeText={(val) => handleInputChange("ward", val)}
              placeholder="Ward (Phường/Xã)"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={userDetails.phone_number}
              onChangeText={(val) => handleInputChange("phone_number", val)}
              placeholder="Phone"
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={userDetails.email}
              onChangeText={(val) => handleInputChange("email", val)}
              placeholder="Email Address"
              keyboardType="email-address"
              placeholderTextColor="#888"
            />
            <TextInput
              style={[styles.input, { height: 76 }]}
              value={userDetails.additionalInfo}
              onChangeText={(val) => handleInputChange("additionalInfo", val)}
              placeholder="Additional Information"
              placeholderTextColor="#888"
              multiline
            />
          </View>

          {/* --- Order Summary --- */}
          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <FlatList
              data={items}
              keyExtractor={(item, idx) => item.product?.id + "-" + idx}
              renderItem={renderItem}
              scrollEnabled={false}
              style={{ marginBottom: 10 }}
            />

           
            <View style={styles.summaryRow}>
              <Text>Tax:</Text>
              <Text>{cartSummary.estimatedTax?.toLocaleString() || 0} VND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontWeight: "bold" }}>Total:</Text>
              <Text style={{ fontWeight: "bold", color: "#e53935" }}>
                {cartSummary.estimatedTotal?.toLocaleString() || 0} VND
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
  summaryLabel: { fontSize: 15, color: "#555" },
  summaryValue: { fontSize: 15, color: "#111" },
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
