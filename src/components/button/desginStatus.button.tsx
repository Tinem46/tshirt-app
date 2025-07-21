import { updateDesignStatusAPI } from "@/app/utils/apiall";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { CustomDesignStatus } from "../Enums/designEnums";

interface Props {
  designId: string;
  status: CustomDesignStatus | number;
  children: React.ReactNode;
  onSuccess?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const DesignStatusButton: React.FC<Props> = ({
  designId,
  status,
  children,
  onSuccess,
  style,
  textStyle,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    // Nếu là chuyển về Rejected hoặc Draft thì xác nhận với user
    if (
      status === CustomDesignStatus.Rejected ||
      status === CustomDesignStatus.Draft
    ) {
      Alert.alert(
        status === CustomDesignStatus.Rejected
          ? "Xác nhận từ chối thiết kế này?"
          : "Chuyển về bản nháp?",
        status === CustomDesignStatus.Rejected
          ? "Bạn chắc chắn muốn từ chối thiết kế này?"
          : "Thiết kế sẽ trở về bản nháp (Draft)",
        [
          { text: "Huỷ", style: "cancel" },
          { text: "Xác nhận", onPress: () => updateStatus() },
        ]
      );
    } else {
      updateStatus();
    }
  };

  const updateStatus = async () => {
    setLoading(true);
    try {
      await updateDesignStatusAPI(designId, status);
      if (onSuccess) onSuccess?.();
      // Có thể thêm Toast tuỳ ý
    } catch (err) {
      Alert.alert("Có lỗi khi cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          alignItems: "center",
        },
        style,
      ]}
      onPress={handleClick}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[{ color: "#fff", fontWeight: "bold" }, textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DesignStatusButton;
