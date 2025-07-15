import { APP_COLOR } from "@/app/utils/constant";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface IProps {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  textStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  pressStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;

  // Custom dynamic style
  isValid?: boolean;
  dirty?: boolean;
  useDynamicStyle?: boolean;
}

const ShareButton = ({
  title,
  onPress,
  icon,
  textStyle,
  buttonStyle,
  pressStyle,
  loading = false,
  disabled = false,
  isValid = false,
  dirty = false,
  useDynamicStyle = false,
}: IProps) => {
  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => {
        const dynamicBackground = useDynamicStyle
          ? isValid && dirty
            ? "black"
            : APP_COLOR.GREY
          : "black";

        const dynamicOpacity =
          useDynamicStyle && (pressed || loading) ? 0.5 : 1;

        return [
          {
            opacity: dynamicOpacity,
            backgroundColor: dynamicBackground,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginVertical: 5,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
          },
          pressStyle,
        ];
      }}
      onPress={onPress}
    >
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          },
          buttonStyle,
        ]}
      >
        {loading && <ActivityIndicator size="small" color="white" />}
        {icon}
        <Text
          style={[
            {
              color: useDynamicStyle
                ? isValid && dirty
                  ? "white"
                  : "grey"
                : "white",
              fontSize: 14,
              fontWeight: "600",
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

export default ShareButton;
