import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { cancelOrderAPI } from '../../app/utils/orderService';
import Toast from 'react-native-root-toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CancelOrderModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string | null;
  onSuccess?: () => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  visible,
  onClose,
  orderId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      await cancelOrderAPI(orderId);
      Toast.show("Huỷ đơn hàng thành công!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("lỗi hủy đơn", error);
      Toast.show("Không thể hủy đơn hàng", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Xác nhận hủy đơn hàng</Text>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn huỷ đơn hàng này không?
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Không</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.disabledButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Hủy đơn hàng</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: SCREEN_WIDTH - 64,
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#ff4d4f',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});