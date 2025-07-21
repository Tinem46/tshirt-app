import { IOrder } from '@/app/types/model';
import { getReviewByUserId } from '@/app/utils/reviewService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Check, Search, ShoppingCart, Star, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-root-toast';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CancelOrderModal } from '../../../components/modal/cancelOrderModal';
import { confirmDeliveredAPI, getMyOrdersAPI } from '../../utils/orderService';

const STATUS = {
  all: -1,
  pending: 0,
  paid: 1,
  processing: 3,
  shipping: 4,
  delivered: 5,
  completed: 2,
  cancelled: 6,
  returned: 7,
};

const STATUS_LABEL = {
  [STATUS.pending]: "Chờ thanh toán",
  [STATUS.paid]: "Đã thanh toán",
  [STATUS.processing]: "Đang xử lý",
  [STATUS.shipping]: "Đang vận chuyển",
  [STATUS.delivered]: "Đã giao hàng",
  [STATUS.completed]: "Đã hoàn thành",
  [STATUS.cancelled]: "Đã huỷ",
  [STATUS.returned]: "Đã trả hàng/Hoàn tiền",
};

const STATUS_COLORS = {
  [STATUS.pending]: "#ff9500",
  [STATUS.paid]: "#007aff",
  [STATUS.processing]: "#5ac8fa",
  [STATUS.shipping]: "#af52de",
  [STATUS.delivered]: "#34c759",
  [STATUS.completed]: "#30d158",
  [STATUS.cancelled]: "#ff3b30",
  [STATUS.returned]: "#ff2d92",
};

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang vận chuyển' },
  { key: 'delivered', label: 'Đã giao hàng' },
  { key: 'completed', label: 'Đã hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'returned', label: 'Đã hoàn tiền' },
];



export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reviewVariantIds, setReviewedVariantIds] = useState<string[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrdersAPI();
      if (res && res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (res && Array.isArray(res)) {
        setOrders(res);
      } else {
        console.log("Unexpected response format:", res);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error loading orders", err);
      Toast.show("Không thể tải danh sách đơn hàng", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const fetchUserReviews = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      const res = await getReviewByUserId(userId);
      if (res?.data) {
        const ids = res.data.map((r: any) => r.productVariantId);
        setReviewedVariantIds(ids);
        setUserReviews(res.data);
        console.log("User reviews fetched successfully:", res.data);
        console.log("User reviews state:", userReviews);
      }
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      fetchUserReviews();
    }, [])
  );


  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' ? true : order.status === STATUS[activeTab as keyof typeof STATUS];
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.receiverName?.toLowerCase().includes(search.toLowerCase()) ||
      order.orderItems?.some((item) =>
        item.itemName?.toLowerCase().includes(search.toLowerCase())
      );
    return matchesTab && matchesSearch;
  });

  const handleConfirmReceived = async (id: string) => {
    try {
      await confirmDeliveredAPI(id);
      Toast.show("Bạn đã xác nhận đã nhận hàng thành công!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        backgroundColor: "#10B981",
        textColor: "#fff",
        shadow: true,
      });
      await fetchOrders();
    } catch (error) {
      console.error("❌ Lỗi xác nhận:", error);
      Toast.show("Xác nhận thất bại. Vui lòng thử lại sau.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  const openCancelModal = (id: string) => {
    setSelectedOrderId(id);
    setCancelModalVisible(true);
  };

  const handleOpenReviewModal = (order: IOrder, mode: 'create' | 'update' = 'create') => {
    const productList = order.orderItems.map((item) => {
      const oldReview = userReviews.find(
        r => r.productVariantId === item.productVariantId && r.orderId === order.id
      );
      console.log("Old review found:", oldReview);
      return {
        productVariantId: item.productVariantId,
        orderId: order.id,
        name: item.itemName,
        image: "https://via.placeholder.com/150",
        category: item.variantName || `${item.selectedColor} - ${item.selectedSize}`,
        reviewId: oldReview?.id || null,
        rating: oldReview?.rating || 5,
        content: oldReview?.content || "",
        images: oldReview?.images || [],
      }
    })

    router.push({
      pathname: '/review',
      params: {
        products: JSON.stringify(productList),
        mode
      }
    });
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderOrderActions = (order: IOrder) => {
    const actions = [];

    const allReviewed = order.orderItems.every(item => reviewVariantIds.includes(item.productVariantId));
    const noneReviewed = order.orderItems.every(item => !reviewVariantIds.includes(item.productVariantId));

    console.log("Reviewed variant ids: ", reviewVariantIds)
    order.orderItems.forEach(item => {
      console.log("OrderItem variantId: ", item.productVariantId)
    });


    switch (order.status) {
      case STATUS.pending:
      case STATUS.paid:
        actions.push(
          <TouchableOpacity
            key="cancel"
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => openCancelModal(order.id)}
          >
            <X size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        );
        break;
      case STATUS.shipping:
        actions.push(
          <TouchableOpacity
            key="confirm"
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleConfirmReceived(order.id)}
          >
            <Check size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Đã nhận được hàng</Text>
          </TouchableOpacity>
        );
        break;
      case STATUS.delivered:
        if (noneReviewed) {
          actions.push(
            <TouchableOpacity
              key="review"
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => handleOpenReviewModal(order)}
            >
              <Star size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          );
        } else if (allReviewed) {
          actions.push(
            <TouchableOpacity
              key="review-again"
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => handleOpenReviewModal(order, 'update')}
            >
              <Star size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Đánh giá lại</Text>
            </TouchableOpacity>
          );
        }
        break;
      default:
        break;
    }

    return actions;
  };

  const renderOrderCard = (order: IOrder) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusTag, { backgroundColor: STATUS_COLORS[order.status] }]}>
          <Text style={styles.statusText}>{STATUS_LABEL[order.status]}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.orderItems.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.productVariant}>
                Phân loại: {item.selectedColor} - {item.selectedSize}
              </Text>
              <Text style={styles.productQuantity}>x{item.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>{formatVND(item.unitPrice)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderSummary}>
        <View style={styles.shippingInfo}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Người nhận: </Text>
            {order.receiverName}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Điện thoại: </Text>
            {order.receiverPhone}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Địa chỉ: </Text>
            {order.shippingAddress}
          </Text>
          {order.trackingNumber && (
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Mã vận đơn: </Text>
              {order.trackingNumber}
            </Text>
          )}
        </View>

        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tạm tính:</Text>
            <Text style={styles.priceValue}>{formatVND(order.subtotalAmount)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí vận chuyển:</Text>
            <Text style={styles.priceValue}>{formatVND(order.shippingFee)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá:</Text>
              <Text style={[styles.priceValue, styles.discountText]}>
                -{formatVND(order.discountAmount)}
              </Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Thành tiền:</Text>
            <Text style={styles.totalAmount}>{formatVND(order.finalTotal)}</Text>
          </View>
        </View>
      </View>

      {order.status === STATUS.cancelled && order.cancellationReason && (
        <View style={styles.cancellationSection}>
          <View style={styles.cancellationHeader}>
            <X size={16} color="#ff4d4f" />
            <Text style={styles.cancellationTitle}>Lý do hủy đơn hàng</Text>
          </View>
          <View style={styles.cancellationContent}>
            <Text style={styles.cancellationReason}>{order.cancellationReason}</Text>
          </View>
        </View>
      )}

      <View style={styles.orderActions}>
        {renderOrderActions(order)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        </View>
      </View>

      <View style={styles.tabsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đơn hàng..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4d4f" />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingCart size={64} color="#ccc" />
            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào cả</Text>
          </View>
        ) : (
          filteredOrders.map(renderOrderCard)
        )}
      </ScrollView>

      <CancelOrderModal
        visible={cancelModalVisible}
        orderId={selectedOrderId}
        onClose={() => setCancelModalVisible(false)}
        onSuccess={fetchOrders}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#ffffffff',
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  tabsSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContainer: {
    maxHeight: 80,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: '#f4511e',
  },

  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderStyle: 'dashed',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productVariant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4d4f',
  },
  orderSummary: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderStyle: 'dashed',
    gap: 12,
  },
  shippingInfo: {
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  summaryLabel: {
    fontWeight: '600',
    color: '#333',
  },
  priceBreakdown: {
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  discountText: {
    color: '#52c41a',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff4d4f',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderStyle: 'dashed',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  cancelButton: {
    backgroundColor: '#ff4d4f',
  },
  confirmButton: {
    backgroundColor: '#52c41a',
  },
  reviewButton: {
    backgroundColor: '#ff4d4f',
  },
  buyAgainButton: {
    backgroundColor: '#1890ff',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cancellationSection: {
    backgroundColor: '#fff2f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4f',
  },
  cancellationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  cancellationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4d4f',
  },
  cancellationContent: {
    gap: 4,
  },
  cancellationReason: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  cancellationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});