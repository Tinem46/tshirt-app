import { CancelOrderAPI } from '@/app/utils/orderService';
import { AlertCircle, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-root-toast';

interface CancelOrderModalProps {
    visible: boolean;
    orderId: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

// Predefined cancellation reasons
const CANCEL_REASONS = [
    'Không cần nữa',
    'Tìm được sản phẩm khác tốt hơn',
    'Giá cả không phù hợp',
    'Thời gian giao hàng quá lâu',
    'Thay đổi ý định mua hàng',
    'Khác'
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
    visible,
    orderId,
    onClose,
    onSuccess
}) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setSelectedReason('');
        setCustomReason('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const getFinalReason = () => {
        if (selectedReason === 'Khác') {
            return customReason.trim();
        }
        return selectedReason;
    };

    const validateInput = () => {
        if (!selectedReason) {
            Toast.show("Vui lòng chọn lý do hủy đơn hàng", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                backgroundColor: "#ff4d4f",
            });
            return false;
        }

        if (selectedReason === 'Khác' && !customReason.trim()) {
            Toast.show("Vui lòng nhập lý do cụ thể", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                backgroundColor: "#ff4d4f",
            });
            return false;
        }

        const finalReason = getFinalReason();
        if (finalReason.length < 5) {
            Toast.show("Lý do hủy đơn phải có ít nhất 5 ký tự", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                backgroundColor: "#ff4d4f",
            });
            return false;
        }

        return true;
    };

    const handleConfirmCancel = async () => {
        if (!validateInput()) return;

        const finalReason = getFinalReason();

        Alert.alert(
            "Xác nhận hủy đơn hàng",
            `Bạn có chắc chắn muốn hủy đơn hàng này?\n\nLý do: ${finalReason}`,
            [
                {
                    text: "Không",
                    style: "cancel"
                },
                {
                    text: "Xác nhận hủy",
                    style: "destructive",
                    onPress: () => submitCancelOrder(finalReason)
                }
            ]
        );
    };

    const submitCancelOrder = async (reason: string) => {
        if (!orderId) return;

        setLoading(true);
        try {
            await CancelOrderAPI(orderId, reason);
            Toast.show("Đơn hàng đã được hủy thành công", {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER,
                backgroundColor: "#52c41a",
                textColor: "#fff",
            });

            handleClose();
            onSuccess();
        } catch (error) {
            console.error("Error cancelling order:", error);
            Toast.show("Không thể hủy đơn hàng. Vui lòng thử lại sau.", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                backgroundColor: "#ff4d4f",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerIconContainer}>
                                    <AlertCircle size={24} color="#ff4d4f" />
                                </View>
                                <Text style={styles.title}>Hủy đơn hàng</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleClose}
                                    disabled={loading}
                                >
                                    <X size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Description */}
                                <Text style={styles.description}>
                                    Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.
                                    Thông tin này sẽ giúp chúng tôi cải thiện dịch vụ tốt hơn.
                                </Text>

                                {/* Reason Selection */}
                                <Text style={styles.sectionTitle}>Chọn lý do hủy đơn:</Text>
                                <View style={styles.reasonsContainer}>
                                    {CANCEL_REASONS.map((reason) => (
                                        <TouchableOpacity
                                            key={reason}
                                            style={[
                                                styles.reasonItem,
                                                selectedReason === reason && styles.selectedReasonItem
                                            ]}
                                            onPress={() => setSelectedReason(reason)}
                                            disabled={loading}
                                        >
                                            <View style={[
                                                styles.radioButton,
                                                selectedReason === reason && styles.selectedRadioButton
                                            ]}>
                                                {selectedReason === reason && (
                                                    <View style={styles.radioButtonInner} />
                                                )}
                                            </View>
                                            <Text style={[
                                                styles.reasonText,
                                                selectedReason === reason && styles.selectedReasonText
                                            ]}>
                                                {reason}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Custom Reason Input */}
                                {selectedReason === 'Khác' && (
                                    <View style={styles.customReasonContainer}>
                                        <Text style={styles.inputLabel}>Lý do cụ thể:</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            multiline
                                            numberOfLines={4}
                                            placeholder="Vui lòng nhập lý do cụ thể (tối thiểu 5 ký tự)"
                                            placeholderTextColor="#999"
                                            value={customReason}
                                            onChangeText={setCustomReason}
                                            maxLength={200}
                                            editable={!loading}
                                            textAlignVertical="top"
                                        />
                                        <Text style={styles.characterCount}>
                                            {customReason.length}/200 ký tự
                                        </Text>
                                    </View>
                                )}

                                {/* Warning */}
                                <View style={styles.warningContainer}>
                                    <AlertCircle size={16} color="#ff9500" />
                                    <Text style={styles.warningText}>
                                        Lưu ý: Đơn hàng đã hủy không thể được khôi phục.
                                        Bạn có thể đặt lại đơn hàng mới nếu cần thiết.
                                    </Text>
                                </View>
                            </ScrollView>

                            {/* Action Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleClose}
                                    disabled={loading}
                                >
                                    <Text style={styles.cancelButtonText}>Không hủy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.confirmButton,
                                        loading && styles.disabledButton
                                    ]}
                                    onPress={handleConfirmCancel}
                                    disabled={loading || !selectedReason}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.confirmButtonText}>Xác nhận hủy</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        maxHeight: '90%',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerIconContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    closeButton: {
        width: 40,
        alignItems: 'flex-end',
        padding: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    reasonsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedReasonItem: {
        backgroundColor: '#fff2f0',
        borderColor: '#ff4d4f',
    },
    radioButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#d9d9d9',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedRadioButton: {
        borderColor: '#ff4d4f',
    },
    radioButtonInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff4d4f',
    },
    reasonText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
    },
    selectedReasonText: {
        color: '#ff4d4f',
        fontWeight: '500',
    },
    customReasonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#d9d9d9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fafafa',
        minHeight: 80,
    },
    characterCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff9f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9500',
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: '#d46b08',
        lineHeight: 16,
        marginLeft: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#d9d9d9',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    confirmButton: {
        backgroundColor: '#ff4d4f',
    },
    disabledButton: {
        backgroundColor: '#ffccc7',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
    },
});