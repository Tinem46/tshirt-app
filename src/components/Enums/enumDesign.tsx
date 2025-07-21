
import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { CustomDesignStatus, CustomDesignStatusColor, CustomDesignStatusLabel } from "./designEnums";

interface EnumDesignProps {
  status: CustomDesignStatus | number;
  style?: ViewStyle;
}

const EnumDesign: React.FC<EnumDesignProps> = ({ status, style }) => {
  const statusKey = status as CustomDesignStatus;
  const label = CustomDesignStatusLabel[statusKey] || "Không xác định";
  const color = CustomDesignStatusColor[statusKey] || "#999";
  return (
    <View
      style={[
        {
          backgroundColor: color,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginTop: 3,
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "500", fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
};

export default EnumDesign;
