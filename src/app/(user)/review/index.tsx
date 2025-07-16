import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Star, Camera, ArrowLeft, Coins } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createReviewAPI } from '../../utils/reviewService';
import Toast from 'react-native-root-toast';

const ratingTexts: { [key: number]: string } = {
  1: "Rất Tệ",
  2: "Tệ", 
  3: "Bình Thường",
  4: "Tốt",
  5: "Tuyệt Vời",
};

interface Product {
  productId: string;
  orderId: string;
  name: string;
  image: string;
  category: string;
}

interface Review {
  rating: number;
  content: string;
  images: string[];
}

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [productList, setProductList] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.products) {
      try {
        const products = JSON.parse(params.products as string);
        setProductList(products);
        setReviews(
          products.map(() => ({
            rating: 5,
            content: "",
            images: [],
          }))
        );
      } catch (error) {
        console.error('Error parsing products:', error);
        router.back();
      }
    }
  }, [params.products]);

  const handleChange = (index: number, key: keyof Review, value: any) => {
    const updated = [...reviews];
    updated[index] = { ...updated[index], [key]: value };
    setReviews(updated);
  };

  const handleSubmit = async () => {
    // Validate all reviews
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      if (!review.rating) {
        Alert.alert("Lỗi", `Vui lòng chọn số sao cho sản phẩm thứ ${i + 1}`);
        return;
      }
      if (!review.content.trim()) {
        Alert.alert("Lỗi", `Vui lòng nhập nội dung đánh giá cho sản phẩm thứ ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const reviewDataList = productList.map((product, index) => ({
        productId: product.productId,
        orderId: product.orderId,
        rating: reviews[index].rating,
        content: reviews[index].content.trim(),
        images: reviews[index].images,
      }));

      await Promise.all(reviewDataList.map((review) => createReviewAPI(review)));
      
      Toast.show("Gửi đánh giá thành công!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      
      router.back();
    } catch (error) {
      console.error("❌ Lỗi khi gửi đánh giá:", error);
      Toast.show("Gửi đánh giá thất bại. Vui lòng thử lại sau.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, onPress: (star: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={star <= rating ? "#faad14" : "#d9d9d9"}
              fill={star <= rating ? "#faad14" : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (productList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d4f" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          
        </TouchableOpacity>
        <Text style={styles.title}>Đánh giá sản phẩm</Text>
        <View style={styles.placeholder} />
      </View>

    

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {productList.map((product, index) => {
          const review = reviews[index] || {};
          
          return (
            <View key={index} style={styles.productReview}>
              <View style={styles.productHeader}>
                <Image
                  source={{ uri: product.image || "https://via.placeholder.com/150" }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>
                    {product.category}
                  </Text>
                </View>
              </View>

              <View style={styles.ratingSection}>
                <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(review.rating, (star) => 
                    handleChange(index, 'rating', star)
                  )}
                </View>
                <Text style={styles.ratingText}>
                  {ratingTexts[review.rating]}
                </Text>
              </View>

              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>
                  Thêm hình ảnh về sản phẩm
                 
                </Text>
                
                <TouchableOpacity style={styles.addImageButton}>
                  <View style={styles.imageUploadArea}>
                    <Camera size={32} color="#999" />
                    <Text style={styles.addImageText}>Hình ảnh</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.sectionTitle}>
                  Viết đánh giá từ 50 ký tự
                </Text>
                <Text style={styles.reviewSubtitle}>
                  Chất lượng sản phẩm:
                </Text>
                <TextInput
                  style={styles.reviewInput}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={review.content}
                  onChangeText={(text) => handleChange(index, 'content', text)}
                  placeholder="Hãy chia sẻ nhận xét cho sản phẩm này bạn nhé!"
                  placeholderTextColor="#ccc"
                />
                <Text style={styles.characterCount}>
                  {review.content?.length || 0} ký tự
                </Text>
              </View>

            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingTop:30,
    paddingLeft: 10
  },
  placeholder: {
    width: 32,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe58f',
    gap: 8,
  },
  rewardText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  rewardHighlight: {
    color: '#ff9500',
    fontWeight: '600',
  },
  rewardArrow: {
    fontSize: 18,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productReview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  ratingContainer: {
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#faad14',
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 24,
  },
  rewardPoints: {
    color: '#ff9500',
    fontWeight: '600',
  },
  addImageButton: {
    marginTop: 8,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: '#d9d9d9',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  addImageText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  reviewSection: {
    marginBottom: 16,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});