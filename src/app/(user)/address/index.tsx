import { IAddress } from "@/app/types/model";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { getUserAddress, setDefaultAddress } from "../../utils/addressService";
import { DeleteAddressModal } from "@/components/modal/deleteAddressModal";

export default function AddressScreen() {
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedAddressName, setSelectedAddressName] = useState<string | undefined>(undefined);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const res = await getUserAddress();
            setAddresses(res.data);
        } catch {
            Toast.show("Không thể tải địa chỉ", {
                backgroundColor: "#f44336",
                position: Toast.positions.CENTER,
            });
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [])
    );

    const handleDelete = (id: string, name?: string) => {
        setSelectedAddressId(id);
        setSelectedAddressName(name);
        setShowDeleteModal(true);
    };


    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultAddress(id);
            Toast.show("Thiết lập mặc định thành công", {
                backgroundColor: "#4CAF50",
                position: Toast.positions.CENTER,
            });
            loadAddresses();
        } catch {
            Toast.show("Lỗi thiết lập mặc định", {
                backgroundColor: "#f44336",
                position: Toast.positions.CENTER,
            });
        }
    };

    const renderItem = ({ item }: { item: IAddress }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                    <Text style={styles.receiverName}>{item.receiverName}</Text>
                    <Text style={styles.receiverPhone}>{item.phone}</Text>
                </View>
                {item.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                    </View>
                )}
            </View>

            <View style={styles.addressContent}>
                <Text style={styles.addressText}>
                    {item.detailAddress}
                </Text>
                <Text style={styles.addressLocation}>
                    {item.ward}, {item.district}, {item.province}
                </Text>
            </View>

            <View style={styles.addressActions}>
                <Pressable
                    style={styles.actionButton}
                    onPress={() => router.push({
                        pathname: "/(user)/address/form",
                        params: { mode: "edit", id: item.id }
                    })}
                >
                    <Feather name="edit-2" size={16} color="#666" />
                    <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
                </Pressable>

                <Pressable
                    style={styles.actionButton}
                    onPress={() => handleDelete(item.id!, item.detailAddress)}
                >
                    <Feather name="trash-2" size={16} color="#f44336" />
                    <Text style={[styles.actionButtonText, { color: "#f44336" }]}>Xóa</Text>
                </Pressable>

                {!item.isDefault && (
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(item.id!)}
                    >
                        <Feather name="star" size={16} color="#ff9800" />
                        <Text style={[styles.actionButtonText, { color: "#ff9800" }]}>Mặc định</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Feather name="map-pin" size={48} color="#bdbdbd" />
            <Text style={styles.emptyStateTitle}>Chưa có địa chỉ nào</Text>
            <Text style={styles.emptyStateDescription}>
                Thêm địa chỉ giao hàng để thuận tiện khi đặt hàng
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft} />
                <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
                <Pressable
                    onPress={() => router.push("/(user)/address/form")}
                    style={styles.addButton}
                >
                    <Feather name="plus" size={24} color="#2c2c2c" />
                </Pressable>
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id!}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                refreshing={loading}
                onRefresh={loadAddresses}
            />

            <Pressable
                style={styles.floatingAddButton}
                onPress={() => router.push("/(user)/address/form")}
            >
                <Feather name="plus" size={24} color="#ffffff" />
                <Text style={styles.floatingAddButtonText}>Thêm địa chỉ</Text>
            </Pressable>
            <DeleteAddressModal
                visible={showDeleteModal}
                addressId={selectedAddressId}
                addressName={selectedAddressName}
                onClose={() => setShowDeleteModal(false)}
                onSuccess={() => {
                    loadAddresses();
                    setShowDeleteModal(false);
                }}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 100,
        paddingBottom: 20,
        backgroundColor: "#ffffff",
        borderBottomWidth: 2,
        borderBottomColor: "#f0f0f0",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2c2c2c",
        flex: 1,
        textAlign: "center",
    },
    addButton: {
        padding: 8,
    },
    headerLeft: {
        width: 40,
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    addressCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    addressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    addressInfo: {
        flex: 1,
    },
    receiverName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c2c2c",
        marginBottom: 4,
    },
    receiverPhone: {
        fontSize: 14,
        color: "#666",
    },
    defaultBadge: {
        backgroundColor: "#e8f5e8",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#4caf50",
    },
    defaultBadgeText: {
        fontSize: 12,
        color: "#4caf50",
        fontWeight: "500",
    },
    addressContent: {
        marginBottom: 16,
    },
    addressText: {
        fontSize: 15,
        color: "#2c2c2c",
        marginBottom: 4,
        lineHeight: 20,
    },
    addressLocation: {
        fontSize: 14,
        color: "#666",
    },
    addressActions: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#f5f5f5",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2c2c2c",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateDescription: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
        maxWidth: 280,
    },
    floatingAddButton: {
        position: "absolute",
        bottom: 32,
        left: 20,
        right: 20,
        backgroundColor: "#2c2c2c",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    floatingAddButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});