import { ICartItem } from "@/app/types/model";
import { useCurrentApp } from "@/context/app.context";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CheckoutPage = () => {
  const { cart, setCart, buyNowItem, setBuyNowItem } = useCurrentApp();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const items: ICartItem[] = buyNowItem ? [buyNowItem] : cart;

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!name || !address || !phone || !email) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin giao hàng.");
      return;
    }

    const orderDetails = {
      customer: { name, phone, address, email },
      paymentMethod,
      items,
      total,
      orderDate: new Date(),
      type: buyNowItem ? "BUY_NOW" : "CART",
    };

    console.log(orderDetails);

    Alert.alert(
      "Đặt hàng thành công!",
      `Tổng tiền: ${total.toLocaleString()} VND\nThanh toán: ${paymentMethod}`
    );

    // Xử lý riêng từng trường hợp
    if (buyNowItem) {
      setBuyNowItem(null);
    } else {
      setCart([]);
    }

    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setPaymentMethod("COD");

    router.push("/product/shop");
  };

  const renderItem = ({ item }: { item: ICartItem }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.product.image }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productInfo}>
          Size: <Text style={styles.bold}>{item.size}</Text>
        </Text>
        <Text style={styles.productInfo}>
          Số lượng: <Text style={styles.bold}>{item.quantity}</Text>
        </Text>
      </View>
      <Text style={styles.itemPrice}>
        {(Number(item.product.price) * item.quantity).toLocaleString()} VND
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Thông tin đơn hàng</Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.product.id}-${index}`}
        renderItem={renderItem}
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.total}>Tổng cộng: {total.toLocaleString()} VND</Text>

      <Text style={styles.label}>Họ tên người nhận:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Địa chỉ giao hàng:</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Số điện thoại:</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Phương thức thanh toán:</Text>
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            paymentMethod === "COD" && styles.selectedPayment,
          ]}
          onPress={() => setPaymentMethod("COD")}
        >
          <Text
            style={[
              styles.paymentText,
              paymentMethod === "COD" && styles.selectedPaymentText,
            ]}
          >
            Thanh toán khi nhận hàng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentButton,
            paymentMethod === "Card" && styles.selectedPayment,
          ]}
          onPress={() => setPaymentMethod("Card")}
        >
          <Text
            style={[
              styles.paymentText,
              paymentMethod === "Card" && styles.selectedPaymentText,
            ]}
          >
            Thẻ ngân hàng
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCheckout}>
        <Text style={styles.buttonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  productInfo: {
    fontSize: 14,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  itemPrice: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    marginVertical: 15,
    color: "#000",
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedPayment: {
    borderColor: "#000",
    backgroundColor: "#555",
  },
  paymentText: {
    color: "#555",
    fontSize: 14,
  },
  selectedPaymentText: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default CheckoutPage;
