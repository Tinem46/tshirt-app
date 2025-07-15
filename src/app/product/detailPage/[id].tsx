import { IProduct, IProductVariant } from "@/app/types/model";
import {
  addToCartAPI,
  getProductDetailAPI,
  getProductVariantsAPI,
} from "@/app/utils/apiall";
import {
  COLOR_HEX,
  COLOR_LABELS,
  SIZE_LABELS,
} from "@/components/Enums/enumMaps";
import SkeletonDetailProduct from "@/components/skeleton/detailSkeleton";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
const fallbackImg = "https://dosi-in.com/images/detailed/42/CDL10_1.jpg";

// Mapping helpers
function getColorName(color: any) {
  if (typeof color === "string") return color;
  if (COLOR_LABELS[color] !== undefined) return COLOR_LABELS[color];
  return color?.toString() || "";
}
function getSizeName(size: any) {
  if (typeof size === "string") return size;
  if (SIZE_LABELS[size] !== undefined) return SIZE_LABELS[size];
  return size?.toString() || "";
}
function getColorHex(color: any) {
  if (COLOR_HEX[color] !== undefined) return COLOR_HEX[color];
  return "#eee";
}

// Helper build item info từ variant và product
function buildOrderItem(
  product: IProduct,
  variant: IProductVariant,
  selectedIndex: any
) {
  if (!variant) return null;
  return {
    productId: variant.productId || product.id || "",
    productVariantId: variant.id,
    itemName: variant.productName || product.name || "",
    image: variant.imageUrl || product.images?.[selectedIndex] || fallbackImg,
    selectedColor: variant.color,
    selectedSize: variant.size,
    unitPrice:
      typeof variant.price === "number" ? variant.price : product.price || 0,
    quantity: 1,
  };
}

const DetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch product & variants
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getProductDetailAPI(id), getProductVariantsAPI(id)])
      .then(([prodRes, variantRes]) => {
        const data = prodRes?.data?.data || prodRes?.data || {};
        const variantData = Array.isArray(variantRes?.data?.data)
          ? variantRes.data.data
          : Array.isArray(variantRes?.data)
          ? variantRes.data
          : [];
        let images: string[] = [];
        try {
          images =
            typeof data.images === "string"
              ? JSON.parse(data.images)
              : Array.isArray(data.images)
              ? data.images
              : [];
        } catch {
          images = [];
        }
        setProduct({ ...data, images });
        setVariants(variantData);
      })
      .catch(() => {
        setProduct(null);
        setVariants([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Lấy size/màu
  const uniqueSizes = [...new Set(variants.map((v) => v.size))];
  const uniqueColors = [...new Set(variants.map((v) => v.color))];
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

  // Thumbnail scroll
  const scrollRef = useRef<ScrollView>(null);
  const handleScrollThumbnails = (direction: "left" | "right") => {
    if (!product?.images?.length) return;
    const itemWidth = 80;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x:
          direction === "left"
            ? Math.max(0, (selectedIndex - 1) * itemWidth)
            : Math.min(
                (product.images.length - 1) * itemWidth,
                (selectedIndex + 1) * itemWidth
              ),
        animated: true,
      });
    }
    setSelectedIndex((prev) =>
      direction === "left"
        ? prev > 0
          ? prev - 1
          : product.images.length - 1
        : (prev + 1) % product.images.length
    );
  };

  // Xử lý Add to cart
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
    let matched = variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    if (!matched) {
      Alert.alert("Không tìm thấy biến thể phù hợp!");
      return;
    }
    const cartItemPayload = [
      {
        productVariantId: matched.id,
        customDesignId: null,
        quantity: 1,
      },
    ];
    setLoading(true);
    try {
      await addToCartAPI(cartItemPayload);
      Alert.alert("Thêm vào giỏ hàng thành công!");
      router.push("/product/cart");
    } catch (error: any) {
      Alert.alert(
        error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Buy now (giống web)
  const handleBuyNow = () => {
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
      Alert.alert("Không xác định được sản phẩm để mua");
      return;
    }
    let matched = variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    if (!matched) {
      Alert.alert("Không tìm thấy biến thể phù hợp!");
      return;
    }
    const checkoutItem = buildOrderItem(product, matched, selectedIndex);
    router.push({
      pathname: "/order/checkout",
      params: { items: JSON.stringify([checkoutItem]) },
    });
  };

  if (loading) return <SkeletonDetailProduct />;
  if (!product)
    return (
      <View style={{ padding: 20 }}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container}>
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
          <View style={styles.thumbnailSection}>
            <TouchableOpacity
              onPress={() => handleScrollThumbnails("left")}
              style={styles.thumbNavBtn}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <ScrollView
              horizontal
              ref={scrollRef}
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
            >
              {product.images.map((img: string, idx: number) => (
                <TouchableOpacity
                  key={`${img}_${idx}`}
                  onPress={() => setSelectedIndex(idx)}
                >
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
            <TouchableOpacity
              onPress={() => handleScrollThumbnails("right")}
              style={styles.thumbNavBtn}
            >
              <Ionicons name="chevron-forward" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{product?.name ?? "Không xác định"}</Text>
          <Text style={styles.price}>
            {typeof product.price === "number"
              ? product.price.toLocaleString()
              : "Liên hệ"}{" "}
            VND
          </Text>
          {/* Chọn Size */}
          {filteredSizes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Chọn size:</Text>
              <View style={styles.sizeContainer}>
                {filteredSizes.map((size, idx) => (
                  <TouchableOpacity
                    key={`size_${size}_${idx}`}
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

          {/* Chọn màu */}
          {filteredColors.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Chọn màu:</Text>
              <View style={[styles.colorContainer, { marginBottom: 10 }]}>
                {filteredColors.map((color, idx) => (
                  <TouchableOpacity
                    key={`color_${color}_${idx}`}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: getColorHex(color) },
                      selectedColor === color && styles.colorCircleActive,
                    ]}
                    onPress={() => {
                      setSelectedColor(color);
                      // Nếu size hiện tại không hợp lệ với màu này thì reset size
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
                        styles.colorText,
                        selectedColor === color && styles.colorTextActive,
                        {
                          color:
                            selectedColor === color ||
                            getColorHex(color) === "#222"
                              ? "#fff"
                              : "#222",
                        },
                      ]}
                    >
                      {getColorName(color)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

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
          {/* Chi tiết sản phẩm */}
          <View style={styles.detailBox}>
            <Text style={styles.sectionTitle}>Chi tiết sản phẩm:</Text>
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
  thumbnailSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 10,
  },
  thumbNavBtn: {
    padding: 4,
    marginHorizontal: 2,
    borderRadius: 22,
    backgroundColor: "#f4f4f4",
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    flex: 1,
  },
  thumbnail: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f8f8f8",
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
  colorContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorCircle: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  colorCircleActive: {
    borderColor: APP_COLOR.ORANGE,
  },
  colorText: { fontSize: 14, color: "#333" },
  colorTextActive: { fontWeight: "bold" },
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
});

export default DetailPage;
