import { IProduct, IProductVariant } from "@/app/types/model";
import {
  addToCartAPI,
  getProductDetailAPI,
  getProductVariantsAPI,
} from "@/app/utils/apiall";
import { getReviewsByVariantId } from "@/app/utils/reviewService";
import {
  COLOR_HEX,
  COLOR_LABELS,
  SIZE_LABELS,
} from "@/components/Enums/enumMaps";
import SkeletonDetailProduct from "@/components/skeleton/detailSkeleton";
import { useCurrentApp } from "@/context/app.context";
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
    image: variant.imageUrl || product.image?.[selectedIndex] || fallbackImg,
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
  const [reviews, setReviews] = useState<any[]>([]);
  const { setCheckoutData } = useCurrentApp();

  useEffect(() => {
    if (variants.length > 0 && variants[0].id) {
      getReviewsByVariantId(variants[0].id)
        .then((res) => {
          const items = res?.data?.data?.items || [];
          setReviews(items);
        })
        .catch(() => setReviews([]));
    }
  }, [variants]);

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
  // Thứ tự size đúng: XXXL -> XS
  const sizeOrder = [0, 1, 2, 3, 4, 5, 6];

  const uniqueSizes = sizeOrder.filter((s) =>
    variants.some((v) => v.size === s)
  );

  const uniqueColors = [...new Set(variants.map((v) => v.color))];
  const filteredColors = selectedSize
    ? [
        ...new Set(
          variants.filter((v) => v.size === selectedSize).map((v) => v.color)
        ),
      ]
    : uniqueColors;
  const filteredSizes = selectedColor
    ? sizeOrder.filter((s) =>
        variants.some((v) => v.color === selectedColor && v.size === s)
      )
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

  // Tìm đúng variant
  let matched = null;
  if (variants.length > 0) {
    matched = variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    if (!matched) {
      Alert.alert("Không tìm thấy biến thể phù hợp!");
      return;
    }
  }

  // Chuẩn hóa 1 item giống web
  const checkoutItem = {
    id: matched.id, // Bạn cần id để CheckoutPage dùng .map
    productVariantId: matched.id,
    name: product.name,
    image: product.images?.[selectedIndex] || "",
    size: selectedSize,
    color: selectedColor,
    quantity: 1,
    unitPrice: matched.price ?? product.price,
    detail: {
      imageUrl: matched.imageUrl || product.images?.[selectedIndex] || "",
      productName: matched.productName || product.name,
    }
  };

  // Reset lại context Checkout (không giữ cart cũ)
  setCheckoutData({
    cart: [checkoutItem], // 1 item, như web
    cartId: null,
    // Có thể thêm các field khác nếu cần
  });

  // Sang trang checkout
  router.push("/order/checkout");
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
              <Ionicons name="cart-outline" size={18} color="#1e88e5" />
              <Text style={[styles.buttonText, styles.cartButtonText]}>
                Thêm Vào Giỏ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={[styles.buttonText, styles.buyButtonText]}>
                Mua Ngay
              </Text>
            </TouchableOpacity>
          </View>
          {/* Chi tiết sản phẩm */}
          <View style={styles.detailBox}>
            <Text style={styles.sectionTitle}>Chi tiết sản phẩm:</Text>
            <Text style={styles.detailText}>
              <Ionicons name="resize" size={14} color="#666" /> Kích thước:{" "}
              {uniqueSizes.length > 0
                ? uniqueSizes.map(getSizeName).join(" - ")
                : "Không có"}
            </Text>

            <Text style={styles.detailText}>
              <Ionicons name="color-palette-outline" size={14} color="#666" />{" "}
              Màu:{" "}
              {uniqueColors.length > 0
                ? uniqueColors.map(getColorName).join(" - ")
                : "Không có"}
            </Text>

            <Text style={styles.detailText}>
              <Ionicons name="pricetag-outline" size={14} color="#666" /> SKU:{" "}
              {product.sku || "Không có"}
            </Text>

            <Text style={styles.detailText}>
              <Ionicons name="document-text-outline" size={14} color="#666" />{" "}
              Mô tả: {product.description || "Không có"}
            </Text>
          </View>
          <View style={styles.reviewBox}>
            <Text style={styles.sectionTitle}>Đánh giá từ người mua:</Text>
            {reviews.length === 0 ? (
              <Text style={styles.detailText}>Chưa có đánh giá nào.</Text>
            ) : (
              reviews.map((review, idx) => {
                const images =
                  typeof review.images === "string"
                    ? JSON.parse(review.images)
                    : Array.isArray(review.images)
                    ? review.images
                    : [];

                return (
                  <View key={`review_${idx}`} style={styles.reviewItem}>
                    <Text style={styles.reviewUser}>
                      {review.user?.fullName || "Người dùng"}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </Text>
                    <Text style={styles.reviewRating}>
                      ⭐ {review.rating} sao
                    </Text>
                    <Text style={styles.reviewContent}>{review.content}</Text>

                    {images.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 8 }}
                      >
                        {images.map((img: string, i: number) => (
                          <Image
                            key={`r_img_${i}`}
                            source={{ uri: img }}
                            style={styles.reviewImage}
                          />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                );
              })
            )}
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
  mainImage: {
    width: "100%",
    height: width,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
  },
  thumbnailSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 10,
  },
  thumbNavBtn: {
    padding: 6,
    marginHorizontal: 4,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    flex: 1,
  },
  thumbnail: {
    width: 68,
    height: 68,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  activeThumbnail: { borderColor: "#000", borderWidth: 2 },
  content: { paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4, color: "#111" },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e53935",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#444",
  },
  sizeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sizeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
  },
  sizeButtonSelected: {
    backgroundColor: "#1a73e8",
    borderColor: "#1a73e8",
  },
  sizeText: { fontSize: 14, color: "#333" },
  sizeTextSelected: { color: "#fff", fontWeight: "600" },
  colorContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorCircle: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  colorCircleActive: {
    borderColor: "#1a73e8",
    borderWidth: 2,
  },
  colorText: { fontSize: 14, color: "#333" },
  colorTextActive: { fontWeight: "600" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
    gap: 12,
  },
  cartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#1e88e5", // blue
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  buyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6d00", // orange
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
  cartButtonText: {
    color: "#1e88e5",
  },
  buyButtonText: {
    color: "#fff",
  },
  detailBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginHorizontal: 16,
  },

  detailTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },

  detailText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 4,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "100%", height: "80%" },
  closeIcon: { position: "absolute", top: 40, right: 20 },
  reviewBox: {
    marginTop: 20,
    backgroundColor: "#fdfdfd",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  reviewUser: {
    fontWeight: "600",
    fontSize: 14,
    color: "#222",
  },
  reviewDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  reviewRating: {
    fontSize: 14,
    color: "#f39c12",
    marginBottom: 4,
  },
  reviewContent: {
    fontSize: 14,
    color: "#444",
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
});

export default DetailPage;
