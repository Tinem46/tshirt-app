import {
  fetchDesignHistoryAPI,
  updateDesignStatusAPI,
} from "@/app/utils/apiall";

import {
  CustomDesignStatus,
  CustomDesignStatusColor,
  CustomDesignStatusLabel,
} from "@/components/Enums/designEnums";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router"; // expo-router hook
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width } = Dimensions.get("window");

// Tab cấu hình
const TAB_LIST = [
  { key: "all", label: "Tất cả", status: -1 },
  { key: "draft", label: "Nháp", status: CustomDesignStatus.Draft },
  { key: "liked", label: "Yêu thích", status: CustomDesignStatus.Liked },
  { key: "accepted", label: "Đã duyệt", status: CustomDesignStatus.Accepted },
  { key: "request", label: "Chờ duyệt", status: CustomDesignStatus.Request },
  { key: "order", label: "Đã đặt hàng", status: CustomDesignStatus.Order },
  {
    key: "shipping",
    label: "Đang giao hàng",
    status: CustomDesignStatus.Shipping,
  },
  { key: "delivered", label: "Đã giao", status: CustomDesignStatus.Delivered },
  { key: "done", label: "Hoàn thành", status: CustomDesignStatus.Done },
  { key: "rejected", label: "Từ chối", status: CustomDesignStatus.Rejected },
];

const DesignHistoryScreen: React.FC = () => {
  const params = useLocalSearchParams(); // params.tab lấy giá trị "liked" nếu có
  const defaultTab = params.tab ? String(params.tab) : "all";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [designs, setDesigns] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    if (params.tab && params.tab !== activeTab) {
      setActiveTab(String(params.tab));
    }
    // eslint-disable-next-line
  }, [params.tab]);

  useEffect(() => {
    fetchDesigns();
  }, [activeTab]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await fetchDesignHistoryAPI();
      console.log("Fetched designs:", res);
      let items = res.items || [];
      // Lọc theo tab
      if (getStatus() !== -1) {
        items = items.filter((d) => d.status === getStatus());
      }
      setDesigns(items);
      console.log("Fetched designs:", items);
    } catch {
      setDesigns([]);
      Alert.alert("Không tải được danh sách thiết kế!");
       
    }
    setLoading(false);
  };

  const getStatus = () => {
    const found = TAB_LIST.find((t) => t.key === activeTab);
    return found ? found.status : -1;
  };

  // Định dạng giá
  const formatCost = (value: number) => {
    return value?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Toggle Like/Unlike (chuyển trạng thái Liked/Draft)
  const handleToggleLike = async (design) => {
    const newStatus =
      design.status === CustomDesignStatus.Liked
        ? CustomDesignStatus.Draft
        : CustomDesignStatus.Liked;
    try {
      await updateDesignStatusAPI(design.id, newStatus);
      fetchDesigns();
    } catch {
      Alert.alert("Không cập nhật được trạng thái!");
    }
  };

  // ==== RENDER CARD ====
  const renderItem = ({
    item,
  }: {
    item: { status: CustomDesignStatus; [key: string]: any };
  }) => (
    <View style={styles.card}>
      <View style={styles.cardImageWrap}>
        <Image
          source={{
            uri:
              item.designImageUrl ||
              "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400",
          }}
          style={styles.cardImage}
        />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.1)"]}
          style={styles.imageGradient}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.designName} numberOfLines={2}>
          {item.designName}
        </Text>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={() => handleToggleLike(item)}
          activeOpacity={0.7}
        >
          <Feather
            name={item.status === CustomDesignStatus.Liked ? "heart" : "heart"}
            size={20}
            color={
              item.status === CustomDesignStatus.Liked ? "#FF6B6B" : "#fff"
            }
            fill={item.status === CustomDesignStatus.Liked ? "#FF6B6B" : "none"}
          />
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={16}
              color="#4F46E5"
            />
            <Text style={styles.infoText}>{formatCost(item.totalPrice)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusTag,
            { backgroundColor: CustomDesignStatusColor[item.status] + "20" },
          ]}
        >
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: CustomDesignStatusColor[item.status] },
            ]}
          />
          <Text
            style={[
              styles.statusTagText,
              { color: CustomDesignStatusColor[item.status] },
            ]}
          >
            {CustomDesignStatusLabel[item.status]}
          </Text>
        </View>

        {/* ======= Các nút trạng thái đặc biệt ======= */}
        <View style={styles.actionContainer}>
          {item.status === CustomDesignStatus.Accepted && (
            <TouchableOpacity style={styles.primaryActionBtn}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <MaterialCommunityIcons
                  name="cart-plus"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.primaryActionBtnText}>Đặt hàng</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {item.status === CustomDesignStatus.Shipping && (
            <TouchableOpacity style={styles.primaryActionBtn}>
              <LinearGradient
                colors={["#059669", "#10B981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.primaryActionBtnText}>Đã giao hàng</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch sử thiết kế AI</Text>
          <View style={styles.headerIcon}>
            <Feather name="activity" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
          contentContainerStyle={styles.tabsContent}
        >
          {TAB_LIST.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Đang tải thiết kế...</Text>
          </View>
        ) : designs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconContainer}>
              <Feather name="search" size={48} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>Không có thiết kế nào</Text>
            <Text style={styles.emptyText}>
              Không tìm thấy thiết kế nào trong mục này.
            </Text>
          </View>
        ) : (
          <FlatList
            data={designs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            numColumns={1}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default DesignHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    marginTop: 90,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    height: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 28,
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: "#fff",
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  tabsContent: {
    paddingRight: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: "#F1F5F9",
    position: "relative",
    minWidth: 80,
    alignItems: "center",
    marginBottom: 8,
  },
  tabActive: {
    backgroundColor: "#4F46E5",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  tabTextActive: {
    color: "#fff",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -16,
    left: "50%",
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4F46E5",
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  loadingText: {
    color: "#6B7280",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 40,
    padding: 24,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1F2937",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    flexDirection: "row",
    minHeight: 160,
  },
  cardImageWrap: {
    width: 140,
    height: 140,
    margin: 16,
    marginRight: 0,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  likeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  designName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 24,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  statusTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTagText: {
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionContainer: {
    marginTop: "auto",
  },
  primaryActionBtn: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryActionBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  yourDesignBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  yourDesignBtnText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
