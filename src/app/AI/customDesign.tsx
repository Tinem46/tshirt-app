import DesignStatusButton from "@/components/button/desginStatus.button";
import {
  getBaseColorHex,
  getBaseColorText,
} from "@/components/Enums/designColorEnum";
import { getSizeText } from "@/components/Enums/designSizeEnum";
import EnumDesign from "@/components/Enums/enumDesign";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomDesign } from "../types/model";
import {
  createDesignAPI,
  currencyFormatter,
  fetchDesignHistoryAPI,
  fetchNewestDesignAPI,
} from "../utils/apiall";

const SHIRT_TYPES = [
  { value: 1, label: "T-Shirt" },
  { value: 2, label: "Polo Shirt" },
  { value: 3, label: "Long Sleeve" },
  { value: 4, label: "Tank Top" },
  { value: 5, label: "Hoodie" },
];

const ShirtDesignerScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    designName: "",
    promptText: "",
    shirtType: 1,
    baseColor: 1,
    size: 2,
    specialRequirements: "",
    quantity: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [currentDesign, setCurrentDesign] = useState<CustomDesign | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchNewestDesign = async () => {
    try {
      const res = await fetchNewestDesignAPI();
      const items: CustomDesign[] = res.items || [];
      if (items.length > 0) setCurrentDesign(items[0]);
      else setCurrentDesign(null);
    } catch (err) {
      setCurrentDesign(null);
    }
  };

  const loadHistoryDesigns = async () => {
    try {
      const res = await fetchDesignHistoryAPI();
      setDesigns(res.items || []);
      console.log("res.items", res.items);
    } catch (err) {
      setDesigns([]);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: ["quantity", "shirtType", "baseColor", "size"].includes(key)
        ? parseInt(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      await createDesignAPI(formData);
      await fetchNewestDesign();
      if (showHistory) await loadHistoryDesigns();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create design"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      designName: "",
      promptText: "",
      shirtType: 1,
      baseColor: 1,
      size: 2,
      specialRequirements: "",
      quantity: 1,
    });
    setError("");
  };

  const handleHistoryItemClick = (design: CustomDesign) =>
    setCurrentDesign(design);

  // Render từng item lịch sử
  const renderHistoryItem = ({ item }: { item: CustomDesign }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemClick(item)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#f8fafc", "#e2e8f0"]}
        style={styles.historyItemGradient}
      >
        <View style={styles.historyImageContainer}>
          <Image
            source={{
              uri:
                item.designImageUrl ||
                "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=200",
            }}
            style={styles.historyImage}
          />
        </View>
        <Text style={styles.historyDesignName}>{item.designName}</Text>
        <Text style={styles.historyPrice}>
          {currencyFormatter(item.totalPrice)}
        </Text>
        <EnumDesign status={item.status} />
        <Text style={styles.historyDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {[0, 3].includes(item.status) && (
          <DesignStatusButton
            designId={item.id}
            status={item.status === 3 ? 0 : 3}
            onSuccess={loadHistoryDesigns}
            style={styles.statusButton}
          >
            <Text style={styles.statusButtonText}>
              {item.status === 3 ? "Unrequest Order" : "Request Order"}
            </Text>
          </DesignStatusButton>
        )}

        {item.status === 3 && (
          <TouchableOpacity
            style={styles.yourDesignBtn}
            // onPress={() => ...} // Có thể thêm action gì đó, ví dụ show popup, navigate, copy...
            activeOpacity={0.8}
            onPress={() => router.push("/(user)/design.history?tab=liked")}
          >
            <Text style={styles.yourDesignBtnText}>Your Design</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  // Header, Preview, Form
  const renderHeader = () => (
    <>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <LinearGradient
          colors={["#6366f1", "#8b5cf6", "#06b6d4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTitleWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="tshirt-crew"
                  size={32}
                  color="#fff"
                />
              </View>
              <Text style={styles.headerTitle}>AI Shirt Designer</Text>
              <View style={styles.aiLabel}>
                <Text style={styles.aiLabelText}>AI</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Preview */}
        <View style={styles.previewContainer}>
          <LinearGradient
            colors={["#ffffff", "#f8fafc"]}
            style={styles.previewGradient}
          >
            <View style={styles.previewContent}>
              <Text style={styles.formTitle}>AI Preview</Text>
              <View style={styles.previewArea}>
                {currentDesign && currentDesign.designImageUrl ? (
                  <View style={styles.previewResult}>
                    <View style={styles.previewImageContainer}>
                      <Image
                        source={{ uri: currentDesign.designImageUrl }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <View style={styles.aiGeneratedBadge}>
                        <Text style={styles.aiGeneratedText}>AI Generated</Text>
                      </View>
                    </View>
                    <Text style={styles.previewTitle}>
                      {currentDesign.designName}
                    </Text>
                    <Text style={styles.previewPrompt}>
                      {currentDesign.promptText}
                    </Text>
                    <View style={styles.previewDetails}>
                      <View style={styles.previewDetailItem}>
                        <Text style={styles.previewDetailLabel}>Color:</Text>
                        <Text style={styles.previewDetailValue}>
                          {getBaseColorText(currentDesign.baseColor)}
                        </Text>
                        <View
                          style={[
                            styles.previewColorDot,
                            {
                              backgroundColor: getBaseColorHex(
                                currentDesign.baseColor
                              ),
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.previewDetailItem}>
                        <Text style={styles.previewDetailLabel}>Size:</Text>
                        <Text style={styles.previewDetailValue}>
                          {getSizeText(currentDesign.size)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <LinearGradient
                      colors={["#e2e8f0", "#f1f5f9"]}
                      style={styles.placeholderGradient}
                    >
                      <MaterialCommunityIcons
                        name="tshirt-crew-outline"
                        size={54}
                        color="#94a3b8"
                      />
                      <Text style={styles.placeholderText}>
                        Your AI-generated design will appear here
                      </Text>
                      <Text style={styles.placeholderSubtext}>
                        Fill out the form and let AI create magic
                      </Text>
                    </LinearGradient>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <LinearGradient
            colors={["#ffffff", "#f8fafc"]}
            style={styles.formGradient}
          >
            <View style={styles.formContent}>
              <Text style={styles.formTitle}>Create Your Design</Text>
              {error ? (
                <View style={styles.errorMessage}>
                  <Feather name="alert-circle" size={18} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Form fields */}
              <Text style={styles.label}>Design Name</Text>
              <TextInput
                style={styles.input}
                value={formData.designName}
                onChangeText={(text) => handleInputChange("designName", text)}
                placeholder="Enter your creative design name"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>AI Design Prompt</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.promptText}
                onChangeText={(text) => handleInputChange("promptText", text)}
                placeholder="Describe your vision... AI will bring it to life"
                multiline
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>Shirt Type</Text>
              <View style={styles.dropdown}>
                <Picker
                  selectedValue={formData.shirtType}
                  onValueChange={(v) => handleInputChange("shirtType", v)}
                  style={styles.picker}
                >
                  {SHIRT_TYPES.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Base Color</Text>
              <View style={styles.dropdownWithDot}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: getBaseColorHex(formData.baseColor),
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: "#e2e8f0",
                    marginTop: 2,
                    marginRight: 0,
                    marginLeft: 10,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Picker
                    selectedValue={formData.baseColor}
                    onValueChange={(v) => handleInputChange("baseColor", v)}
                    style={styles.picker}
                  >
                    {Array.from({ length: 13 }, (_, i) => i).map((val) => (
                      <Picker.Item
                        key={val}
                        label={getBaseColorText(val)}
                        value={val}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <Text style={styles.label}>Size</Text>
              <View style={styles.dropdown}>
                <Picker
                  selectedValue={formData.size}
                  onValueChange={(v) => handleInputChange("size", v)}
                  style={styles.picker}
                >
                  {Array.from({ length: 7 }, (_, i) => i).map((val) => (
                    <Picker.Item
                      key={val}
                      label={getSizeText(val)}
                      value={val}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Special Requirements</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={formData.specialRequirements}
                onChangeText={(text) =>
                  handleInputChange("specialRequirements", text)
                }
                placeholder="Any specific requirements..."
                multiline
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={String(formData.quantity)}
                onChangeText={(text) =>
                  handleInputChange("quantity", text.replace(/[^0-9]/g, ""))
                }
                placeholder="Enter quantity"
                placeholderTextColor="#64748b"
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={resetForm}
                  disabled={isLoading}
                >
                  <Text style={styles.btnSecondaryText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={
                      isLoading
                        ? ["#64748b", "#475569"]
                        : ["#6366f1", "#8b5cf6"]
                    }
                    style={styles.btnPrimaryGradient}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.btnPrimaryText}>
                          AI Generating...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Feather name="zap" size={18} color="#fff" />
                        <Text style={styles.btnPrimaryText}>
                          Generate with AI
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Floating History Button */}
      <TouchableOpacity
        style={styles.floatingHistoryBtn}
        onPress={() => {
          loadHistoryDesigns();
          setShowHistory(true);
        }}
        activeOpacity={0.85}
      >
        <Feather name="clock" size={20} color="#6366f1" />
        <Text style={styles.historyBtnLabel}>History</Text>
      </TouchableOpacity>
      {/* Main content */}
      <LinearGradient
        colors={["#fdfdffff", "#ffffffff", "#2d2d5a"]}
        style={styles.gradientBackground}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {renderHeader()}
        </ScrollView>
      </LinearGradient>
      {/* Modal hiển thị lịch sử thiết kế */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Design History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Feather name="x" size={26} color="#6366f1" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={designs}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No designs found in history.
                </Text>
              }
              contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShirtDesignerScreen;

// STYLES
const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  header: {
    borderRadius: 16,
    marginBottom: 16,
    marginTop: Platform.OS === "ios" ? 120 : 80,
    shadowColor: "#fcfcffff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 7,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  headerTitleWrapper: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.17)",
    borderRadius: 10,
    padding: 6,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 23,
    marginLeft: 4,
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  aiLabel: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  aiLabelText: { color: "#6366f1", fontWeight: "bold", fontSize: 12 },

  floatingHistoryBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 130,
    right: 0,
    zIndex: 99,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 8,
  },
  historyBtnLabel: { color: "#6366f1", marginLeft: 7, fontWeight: "600" },

  previewContainer: { marginBottom: 14 },
  previewGradient: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  previewContent: { padding: 20 },
  formTitle: {
    color: "#1e293b",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },
  previewArea: {
    minHeight: 230,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewResult: { alignItems: "center", padding: 6 },
  previewImageContainer: { position: "relative", marginBottom: 8 },
  previewImage: {
    width: 170,
    height: 170,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#6366f1",
    backgroundColor: "#fff",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 9,
    elevation: 6,
  },
  aiGeneratedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#10b981",
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  aiGeneratedText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  previewTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 6,
    textAlign: "center",
  },
  previewPrompt: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  previewDetails: { gap: 5 },
  previewDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  previewDetailLabel: { color: "#64748b", fontSize: 13 },
  previewDetailValue: { color: "#1e293b", fontSize: 13, fontWeight: "600" },
  previewColorDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginLeft: 4,
  },
  previewPlaceholder: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  placeholderGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    width: "100%",
  },
  placeholderText: {
    color: "#64748b",
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  placeholderSubtext: {
    color: "#94a3b8",
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
  },

  formContainer: { marginBottom: 12 },
  formGradient: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 7,
  },
  formContent: { padding: 18 },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    fontSize: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
    fontSize: 15,
    color: "#1e293b",
    marginBottom: 4,
  },
  textArea: {
    height: 65,
    textAlignVertical: "top",
  },
  dropdown: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 8,
    overflow: "hidden",
  },
  dropdownWithDot: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 8,
    overflow: "hidden",
    paddingRight: 8,
  },
  picker: { height: 54, color: "#1e293b", flex: 1, minWidth: 0 },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  btnSecondary: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginRight: 4,
  },
  btnSecondaryText: {
    color: "#475569",
    fontWeight: "bold",
    fontSize: 15,
  },
  btnPrimary: {
    borderRadius: 9,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.19,
    shadowRadius: 5,
    elevation: 2,
  },
  btnPrimaryGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  errorMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fef2f2",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#ef4444",
    marginLeft: 7,
    flex: 1,
    fontSize: 14,
  },

  historyTitle: {
    color: "#1e293b",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  historyItem: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    marginHorizontal: 12,
  },
  historyItemGradient: {
    padding: 13,
    alignItems: "center",
    borderRadius: 12,
  },
  historyImageContainer: {
    borderRadius: 9,
    overflow: "hidden",
    marginBottom: 7,
  },
  historyImage: {
    width: 85,
    height: 85,
    backgroundColor: "#f1f5f9",
  },
  historyDesignName: {
    color: "#1e293b",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
    textAlign: "center",
  },
  historyPrice: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  historyDate: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 5,
  },
  statusButton: {
    marginTop: 7,
    width: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 7,
    paddingVertical: 6,
  },
  statusButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 22,
    fontSize: 13,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.27)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "93%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 0,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.19,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 18,
    paddingBottom: 9,
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#6366f1",
    fontSize: 18,
  },
  yourDesignBtn: {
    marginTop: 7,
    width: "100%",
    backgroundColor: "#10b981",
    borderRadius: 7,
    paddingVertical: 6,
    alignItems: "center",
  },
  yourDesignBtnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
