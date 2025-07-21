import { useCurrentApp } from "@/context/app.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Calendar,
  Gift,
  Percent,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICoupon } from "../types/model";
import { fetchCouponAPI } from "../utils/apiall";

const CouponScreen = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const { savedCoupons, setSavedCoupons, appState } = useCurrentApp();

  const userId = appState?.user?.id ?? null;
  const LOCAL_KEY = userId ? `user_coupons_${userId}` : "user_coupons_guest";

  useEffect(() => {
    const loadLocalCoupons = async () => {
      try {
        const data = await AsyncStorage.getItem(LOCAL_KEY);
        const arr = data ? JSON.parse(data) : [];
        setSavedCoupons(arr);
      } catch (e) {
        setSavedCoupons([]);
      }
    };
    loadLocalCoupons();
  }, [userId]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetchCouponAPI();
        console.log("Fetched coupons:", res);
        const data = res.data || [];
        setCoupons(data as any);
      } catch {
        Alert.alert("Lỗi", "Không thể tải danh sách coupon!");
      }
      setLoading(false);
    };
    fetchCoupons();
  }, []);

  const saveCouponsToLocal = async (couponsArr: ICoupon[]) => {
    try {
      await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(couponsArr));
    } catch (e) {
      // Handle error if needed
    }
  };

  const handleSave = async (coupon: ICoupon) => {
    if (savedCoupons.find((c) => c.id === coupon.id)) {
      Alert.alert("Thông báo", "Bạn đã lưu mã này rồi.");
      return;
    }
    const updated = [...savedCoupons, coupon];
    await saveCouponsToLocal(updated);
    setSavedCoupons(updated);
    Alert.alert("Thành công", "Đã lưu mã giảm giá!");
  };

  const handleRemove = async (id: any) => {
    const updated = savedCoupons.filter((c) => c.id !== id);
    await saveCouponsToLocal(updated);
    setSavedCoupons(updated);
    Alert.alert("Thông báo", "Đã xóa mã khỏi kho của bạn.");
  };

  const formatValue = (coupon: ICoupon) => {
    if (coupon.type === 0) return `${coupon.value}%`;
    return `${coupon.value?.toLocaleString("vi-VN")}đ`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Gift color="#FFFFFF" size={28} strokeWidth={2} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Ưu đãi đặc biệt</Text>
              <Text style={styles.headerSubtitle}>
                Khám phá và lưu những mã giảm giá tuyệt vời nhất
              </Text>
            </View>
          </View>
          <View style={styles.headerAccent} />
        </View>

        {/* Available Coupons Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mã giảm giá có sẵn</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{coupons.length} mã</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Đang tải ưu đãi...</Text>
            </View>
          ) : (
            <View style={styles.couponGrid}>
              {coupons.map((coupon) => {
                const isSaved = savedCoupons.some((c) => c.id === coupon.id);
                return (
                  <View key={coupon.id} style={styles.couponCard}>
                    {/* Coupon Header */}
                    <View style={styles.couponHeader}>
                      <View style={styles.couponCodeContainer}>
                        <Percent color="#FFFFFF" size={14} strokeWidth={2.5} />
                        <Text style={styles.couponCode}>{coupon.code}</Text>
                      </View>
                      {isSaved && (
                        <View style={styles.savedIndicator}>
                          <Star color="#10B981" size={16} fill="#10B981" />
                        </View>
                      )}
                    </View>

                    {/* Coupon Body */}
                    <View style={styles.couponBody}>
                      <Text style={styles.couponName} numberOfLines={2}>
                        {coupon.name}
                      </Text>
                      <Text style={styles.couponDescription} numberOfLines={3}>
                        {coupon.description}
                      </Text>

                      {/* Value Display */}
                      <View style={styles.valueContainer}>
                        <Text style={styles.valueLabel}>Giảm ngay</Text>
                        <Text style={styles.valueAmount}>{formatValue(coupon)}</Text>
                      </View>

                      {/* Details */}
                      {coupon.minOrderAmount && (
                        <View style={styles.detailRow}>
                          <ShoppingCart color="#6B7280" size={16} strokeWidth={2} />
                          <Text style={styles.detailText}>
                            Đơn tối thiểu {coupon.minOrderAmount.toLocaleString("vi-VN")}đ
                          </Text>
                        </View>
                      )}

                      {(coupon.startDate || coupon.endDate) && (
                        <View style={styles.validityContainer}>
                          <Calendar color="#F59E0B" size={14} strokeWidth={2} />
                          <Text style={styles.validityText}>
                            {coupon.endDate && `Hết hạn: ${new Date(coupon.endDate).toLocaleDateString("vi-VN")}`}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action Button */}
                    <View style={styles.couponFooter}>
                      {isSaved ? (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemove(coupon.id)}
                          activeOpacity={0.8}
                        >
                          <Trash2 color="#FFFFFF" size={16} strokeWidth={2} />
                          <Text style={styles.removeButtonText}>Xóa</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() => handleSave(coupon)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.saveButtonText}>Lưu mã</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Saved Coupons Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kho mã của bạn</Text>
            <View style={[styles.sectionBadge, styles.savedBadge]}>
              <Text style={styles.savedBadgeText}>{savedCoupons.length}</Text>
            </View>
          </View>

          {savedCoupons.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Gift color="#D1D5DB" size={48} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có mã nào</Text>
              <Text style={styles.emptyDescription}>
                Chọn những mã giảm giá ưa thích ở trên để lưu vào kho của bạn
              </Text>
            </View>
          ) : (
            <View style={styles.savedCoupons}>
              {savedCoupons.map((coupon) => (
                <View key={coupon.id} style={styles.savedCouponItem}>
                  <View style={styles.savedCouponContent}>
                    <Text style={styles.savedCouponCode}>{coupon.code}</Text>
                    <Text style={styles.savedCouponName} numberOfLines={1}>
                      {coupon.name}
                    </Text>
                    <Text style={styles.savedCouponValue}>
                      Giảm {formatValue(coupon)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(coupon.id)}
                    style={styles.savedCouponDelete}
                    activeOpacity={0.7}
                  >
                    <Trash2 color="#EF4444" size={20} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CouponScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    marginTop: 30,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header Styles
  header: {
    margin: 20,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    fontWeight: "500",
  },
  headerAccent: {
    height: 4,
    backgroundColor: "#6366F1",
  },

  // Section Styles
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  sectionBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sectionBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  savedBadge: {
    backgroundColor: "#ECFDF5",
  },
  savedBadgeText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "700",
  },

  // Loading State
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 48,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },

  // Coupon Grid
  couponGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  couponCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  // Coupon Header
  couponHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  couponCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  couponCode: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  savedIndicator: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  // Coupon Body
  couponBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  couponName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 22,
  },
  couponDescription: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: "500",
  },
  valueContainer: {
    backgroundColor: "#FEF3F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  valueLabel: {
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "600",
    marginBottom: 2,
  },
  valueAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#DC2626",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
  },
  validityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  validityText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Coupon Footer
  couponFooter: {
    padding: 16,
    paddingTop: 0,
  },
  saveButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  removeButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },

  // Empty State
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F1F5F9",
    borderStyle: "dashed",
  },
  emptyIcon: {
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },

  // Saved Coupons
  savedCoupons: {
    gap: 12,
  },
  savedCouponItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  savedCouponContent: {
    flex: 1,
    paddingRight: 12,
  },
  savedCouponCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6366F1",
    marginBottom: 4,
  },
  savedCouponName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 4,
  },
  savedCouponValue: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "600",
  },
  savedCouponDelete: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});