import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Trash2, X } from 'lucide-react-native';
import { deleteAddress } from '../../app/utils/addressService';
import Toast from 'react-native-root-toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DeleteAddressModalProps {
    visible: boolean;
    onClose: () => void;
    addressId: string | null;
    addressName?: string;
    onSuccess?: () => void;
}

export const DeleteAddressModal: React.FC<DeleteAddressModalProps> = ({
    visible,
    onClose,
    addressId,
    addressName,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        } else {
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleDelete = async () => {
        if (!addressId) return;

        setLoading(true);
        try {
            await deleteAddress(addressId);
            Toast.show("Xóa địa chỉ thành công!", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                backgroundColor: "#10B981",
                textColor: "#fff",
                shadow: true,
            });
           
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Lỗi xóa địa chỉ:", error);
            Toast.show("Không thể xóa địa chỉ", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
                backgroundColor: "#EF4444",
                textColor: "#fff",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
            <BlurView intensity={20} style={styles.modalOverlay}>
                <TouchableOpacity 
                    style={styles.backdrop} 
                    activeOpacity={1} 
                    onPress={handleClose}
                />
                
                <Animated.View 
                    style={[
                        styles.modalContent,
                        {
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* Close Button */}
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={handleClose}
                        disabled={loading}
                    >
                        <X size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconWrapper}>
                            <Trash2 size={32} color="#EF4444" />
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        <Text style={styles.modalTitle}>Xóa địa chỉ</Text>
                        <Text style={styles.modalDescription}>
                            {addressName ? (
                                <>Bạn có chắc chắn muốn xóa địa chỉ <Text style={styles.addressName}>"{addressName}"</Text> không? Hành động này không thể hoàn tác.</>
                            ) : (
                                "Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác."
                            )}
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.secondaryButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.disabledButton]}
                            onPress={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.loadingText}>Đang xóa...</Text>
                                </View>
                            ) : (
                                <Text style={styles.primaryButtonText}>Xóa địa chỉ</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: SCREEN_WIDTH - 48,
        maxWidth: 380,
        paddingTop: 24,
        paddingBottom: 24,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 20,
        },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 25,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FECACA',
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 28,
    },
    modalDescription: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    addressName: {
        fontWeight: '600',
        color: '#374151',
    },
    actionsContainer: {
        gap: 12,
    },
    secondaryButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    primaryButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
        shadowOpacity: 0.1,
    },
});