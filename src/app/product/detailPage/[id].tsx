import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ICartItem, IProduct } from "@/app/types/model";
import SkeletonDetailProduct from "@/components/skeleton/detailSkeleton";
import { useCurrentApp } from "@/context/app.context";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLOR } from "../../utils/constant";

const { width } = Dimensions.get("window");

const images = [
  "https://dosi-in.com/images/detailed/42/CDL10_1.jpg",
  "https://dosi-in.com/images/detailed/42/CDL10_2.jpg",
  "https://dosi-in.com/images/detailed/42/CDL10_3.jpg",
];

const sizes = ["XS", "S", "M", "L", "XL"];

const DetailPage = () => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<IProduct | null>(null);
  const { cart, setCart, setBuyNowItem } = useCurrentApp(); // thêm dòng này
  const [quantity, setQuantity] = useState(1);
  const flyAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [showFlyImage, setShowFlyImage] = useState(false);

  const startFlyToCartAnimation = () => {
    setShowFlyImage(true);
    flyAnim.setValue({ x: 150, y: 300 }); // Vị trí bắt đầu (ảnh sản phẩm)

    Animated.timing(flyAnim, {
      toValue: { x: width - 50, y: 0 }, // Vị trí giỏ hàng (top-right)
      duration: 600,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setShowFlyImage(false); // Ẩn sau animation
    });
  };

  useEffect(() => {
    if (id) {
      fetch(`https://682f2e5b746f8ca4a4803faf.mockapi.io/product/${id}`) // <-- Thay bằng mock API thực tế của bạn
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  if (!product) {
    return <SkeletonDetailProduct />;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert("Vui lòng chọn size trước khi thêm vào giỏ.");
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.size === selectedSize
    );

    let updatedCart: ICartItem[];

    if (existingIndex !== -1) {
      // Đã có, tăng số lượng
      const updatedItem = {
        ...cart[existingIndex],
        quantity: cart[existingIndex].quantity + quantity,
      };
      updatedCart = [...cart];
      updatedCart[existingIndex] = updatedItem;
    } else {
      // Chưa có, thêm mới
      updatedCart = [
        ...cart,
        {
          product,
          size: selectedSize,
          quantity,
        },
      ];
    }

    setCart(updatedCart);
    startFlyToCartAnimation();
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      Alert.alert("Vui lòng chọn size trước khi mua.");
      return;
    }

    const item: ICartItem = {
      product,
      size: selectedSize,
      quantity,
    };

    setBuyNowItem(item);
    router.push("/order/checkout");
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", marginTop: 50 }}>
        <ScrollView style={styles.container}>
          {/* Ảnh chính */}
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: images[selectedIndex] }}
              style={styles.mainImage}
            />
          </TouchableOpacity>

          {/* Ảnh thumbnail */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedIndex(index)}
              >
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.thumbnail,
                    selectedIndex === index && styles.activeThumbnail,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tên, giá */}
          <View style={styles.content}>
            <Text style={styles.title}> {product.name}</Text>
            <Text style={styles.price}>
              {Number(product.price).toLocaleString()} VND
            </Text>
            <Text style={styles.sectionTitle}>Số lượng:</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Chọn size */}
            <Text style={styles.sectionTitle}>Chọn size:</Text>
            <View style={styles.sizeContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonSelected,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nút hành động */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={handleAddToCart}
              >
                <Text style={styles.buttonText}>Thêm Vào Giỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
                <Text style={styles.buttonText}>Mua Ngay</Text>
              </TouchableOpacity>
            </View>

            {/* Giao hàng */}
            <View style={styles.deliveryBox}>
              <Text style={styles.sectionTitle}>Khu vực giao hàng</Text>
              <Text style={styles.address}>
                Giao tại Hồ Chí Minh - Chọn lại
              </Text>
              <Text style={styles.storeTitle}>Cửa hàng còn hàng:</Text>
              {[
                "Quận 10: 561 Sư Vạn Hạnh",
                "Quận 1: 26 Lý Tự Trọng",
                "Quận 1: 160 Nguyễn Cư Trinh",
                "Gò Vấp: 326 Quang Trung",
              ].map((store, idx) => (
                <Text key={idx} style={styles.storeItem}>
                  ✓ {store}
                </Text>
              ))}
            </View>

            {/* Chi tiết */}
            <View style={styles.detailBox}>
              <Text style={styles.sectionTitle}>Chi tiết sản phẩm:</Text>
              <Text>- Kích thước: XS - S - M - L - XL</Text>
              <Text>- Chất liệu: Cotton</Text>
              <Text>- Regular fit</Text>
              <Text>- In kỹ thuật cao cấp</Text>
            </View>
          </View>

          {/* Modal ảnh lớn */}
          <Modal visible={modalVisible} transparent={true}>
            <View style={styles.modalContainer}>
              <Image
                source={{ uri: images[selectedIndex] }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-circle" size={36} color="white" />
              </TouchableOpacity>
            </View>
          </Modal>
          {showFlyImage && (
            <Animated.Image
              source={{ uri: images[selectedIndex] }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                position: "absolute",
                top: 0,
                left: 0,
                transform: flyAnim.getTranslateTransform(),
                zIndex: 1000,
              }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainImage: {
    width: "100%",
    height: width,
    backgroundColor: "#eee",
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginVertical: 10,
    paddingHorizontal: 10,
    marginTop: 25,
  },
  thumbnail: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeThumbnail: {
    borderColor: "black",
    borderWidth: 2,
  },
  content: {
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  sizeButtonSelected: {
    backgroundColor: APP_COLOR.ORANGE,
    borderColor: APP_COLOR.ORANGE,
  },
  sizeText: {
    fontSize: 14,
    color: "#333",
  },
  sizeTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  cartButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  deliveryBox: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  address: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  storeTitle: {
    marginTop: 8,
    fontWeight: "bold",
  },
  storeItem: {
    fontSize: 13,
    marginVertical: 2,
  },
  detailBox: {
    paddingBottom: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
  closeIcon: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
  },
});

export default DetailPage;
