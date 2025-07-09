import {
  addToCartAPI,
  getProductDetailAPI,
  getProductVariantsAPI,
} from "@/app/utils/apiall";
import SkeletonDetailProduct from "@/components/skeleton/detailSkeleton";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLOR } from "../../utils/constant";

const { width } = Dimensions.get("window");

const MATERIAL_ENUM = [
  "Cotton", // 0
  "Polyester", // 1
  "Linen", // 2
  "Silk", // 3
  "Khác", // 4
];
const SEASON_ENUM = [
  "Xuân", // 0
  "Hạ", // 1
  "Thu", // 2
  "Đông", // 3
  "All", // 4
];
const COLOR_ENUM_MAP = {
  0: "Black",
  1: "Red",
  2: "Blue",
  3: "Green",
  4: "White",
};
const SIZE_ENUM_MAP = { 1: "S", 2: "M", 3: "L", 4: "XL", 5: "XXL" };

function getColorName(color: any) {
  if (typeof color === "string") return color;
  if (typeof color === "number" && COLOR_ENUM_MAP.hasOwnProperty(color))
    return COLOR_ENUM_MAP[color as keyof typeof COLOR_ENUM_MAP];
  return color?.toString() || "";
}
function getSizeName(size: any) {
  if (typeof size === "string") return size;
  if (SIZE_ENUM_MAP[size as keyof typeof SIZE_ENUM_MAP] !== undefined)
    return SIZE_ENUM_MAP[size as keyof typeof SIZE_ENUM_MAP];
  return size?.toString() || "";
}

const fallbackImg = "https://dosi-in.com/images/detailed/42/CDL10_1.jpg";

const DetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([getProductDetailAPI(id), getProductVariantsAPI(id)])
      .then(([prodRes, variantRes]) => {
        console.log("Product response:", prodRes);
        console.log("Variants response:", variantRes);
        const prodData =
          prodRes?.data?.data ||
          prodRes?.data || // fallback nếu API thay đổi
          {};
        const variantData =
          variantRes?.data?.data ||
          variantRes?.data || // fallback nếu API thay đổi
          [];
        setProduct({
          ...prodData,
          images: Array.isArray(prodData.images)
            ? prodData.images
            : prodData.images
            ? [prodData.images]
            : [],
        });
        console.log("Product data:", prodData);
        console.log("Variants data:", variantData);
        setVariants(variantData);
      })
      .catch(() => {
        setProduct(null);
        setVariants([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // --- Size / Color logic giống web ---
  const uniqueColors = [...new Set(variants.map((v) => v.color))];
  const uniqueSizes = [...new Set(variants.map((v) => v.size))];

  const filteredColors = selectedSize
    ? [
        ...new Set(
          variants.filter((v) => v.size === selectedSize).map((v) => v.color)
        ),
      ]
    : uniqueColors;

  const filteredSizes = selectedColor
    ? [
        ...new Set(
          variants.filter((v) => v.color === selectedColor).map((v) => v.size)
        ),
      ]
    : uniqueSizes;

  // Handler thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (filteredSizes.length > 0 && !selectedSize) {
      Alert.alert("Vui lòng chọn kích thước!");
      return;
    }
    if (
      filteredColors.length > 0 &&
      (selectedColor === null || selectedColor === undefined)
    ) {
      Alert.alert("Vui lòng chọn màu sắc!");
      return;
    }
    if (!product?.id) {
      Alert.alert("Không xác định được sản phẩm để lấy giá");
      return;
    }
    let productVariantId: string | null = null;
    if (variants.length > 0) {
      const matched = variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      if (matched) productVariantId = matched.id;
      else {
        Alert.alert("Không tìm thấy biến thể phù hợp!");
        return;
      }
    }
    const cartItemPayload = {
      productId: product.id,
      productVariantId: productVariantId,
      quantity,
    };
    try {
      await addToCartAPI(cartItemPayload);
      Alert.alert("Thêm vào giỏ hàng thành công!");
      router.push("/product/cart");
    } catch (error: any) {
      Alert.alert(
        error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  };

  if (loading) return <SkeletonDetailProduct />;
  if (!product) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );
  }

  // --- UI ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", marginTop: 50 }}>
      <ScrollView style={styles.container}>
        {/* Ảnh chính */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{
              uri: product.images?.[selectedIndex] || fallbackImg,
            }}
            style={styles.mainImage}
          />
        </TouchableOpacity>

        {/* Thumbnail */}
        {product.images && product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
          >
            {product.images.map((img: string, idx: number) => (
              <TouchableOpacity key={idx} onPress={() => setSelectedIndex(idx)}>
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.thumbnail,
                    selectedIndex === idx && styles.activeThumbnail,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {/* Tên + Giá */}
          <Text style={styles.title}>{product?.name ?? "Không xác định"}</Text>
          <Text style={styles.price}>
            {typeof product.price === "number"
              ? product.price.toLocaleString()
              : "Liên hệ"}{" "}
            VND
          </Text>

          {/* Chọn màu (luôn trước, theo bản web!) */}
          {filteredColors.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Chọn màu:</Text>
              <View style={[styles.sizeContainer, { marginBottom: 10 }]}>
                {filteredColors.map((color, idx) => (
                  <TouchableOpacity
                    key={color + idx}
                    style={[
                      styles.sizeButton,
                      selectedColor === color && styles.sizeButtonSelected,
                      {
                        backgroundColor:
                          selectedColor === color ? APP_COLOR.ORANGE : "#fff",
                        borderColor: "#999",
                      },
                    ]}
                    onPress={() => {
                      setSelectedColor(color);
                      // Reset size nếu size hiện tại không còn hợp lệ
                      if (
                        selectedSize &&
                        !variants.some(
                          (v) => v.color === color && v.size === selectedSize
                        )
                      ) {
                        setSelectedSize(null);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedColor === color && styles.sizeTextSelected,
                        { color: selectedColor === color ? "#fff" : "#111" },
                      ]}
                    >
                      {getColorName(color)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Chọn Size */}
          {filteredSizes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Chọn size:</Text>
              <View style={styles.sizeContainer}>
                {filteredSizes.map((size) => (
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
                      {getSizeName(size)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Số lượng */}
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

          {/* Nút hành động */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.buttonText}>Thêm Vào Giỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => {
                handleAddToCart();
                router.push("/order/checkout");
              }}
            >
              <Text style={styles.buttonText}>Mua Ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Chi tiết sản phẩm */}
          <View style={styles.detailBox}>
            <Text style={styles.sectionTitle}>Chi tiết sản phẩm:</Text>
            <Text>
              - Chất liệu:{" "}
              {typeof product.material === "number"
                ? MATERIAL_ENUM[product.material] || "Không xác định"
                : "Không xác định"}
            </Text>
            <Text>
              - Kích thước:{" "}
              {uniqueSizes.length > 0
                ? uniqueSizes.map(getSizeName).join(" - ")
                : "Không có"}
            </Text>
            <Text>
              - Màu:{" "}
              {uniqueColors.length > 0
                ? uniqueColors.map(getColorName).join(" - ")
                : "Không có"}
            </Text>
            <Text>
              - Season:{" "}
              {typeof product.season === "number"
                ? SEASON_ENUM[product.season] || "Không xác định"
                : "Không xác định"}
            </Text>
            <Text>- SKU: {product.sku || "Không có"}</Text>
            <Text>- Mô tả: {product.description || "Không có"}</Text>
          </View>
        </View>

        {/* Modal ảnh lớn */}
        <Modal visible={modalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <Image
              source={{
                uri: product.images?.[selectedIndex] || fallbackImg,
              }}
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mainImage: { width: "100%", height: width, backgroundColor: "#eee" },
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
  activeThumbnail: { borderColor: "black", borderWidth: 2 },
  content: { paddingHorizontal: 15 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 5 },
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
  sizeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  sizeText: { fontSize: 14, color: "#333" },
  sizeTextSelected: { color: "#fff", fontWeight: "bold" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  cartButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "orange",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { textAlign: "center", fontWeight: "bold", color: "#fff" },
  detailBox: { paddingBottom: 40 },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "100%", height: "80%" },
  closeIcon: { position: "absolute", top: 40, right: 20 },
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
  quantityButtonText: { fontSize: 18, fontWeight: "bold" },
  quantityText: { marginHorizontal: 15, fontSize: 16 },
});

export default DetailPage;
