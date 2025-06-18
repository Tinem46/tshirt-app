import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { APP_COLOR } from "@/app/utils/constant";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface ShareInputProps {
  title?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  FontAwesome5?: any;
  value: any;
  setValue?: (v: any) => void;
  error?: any;
  onChangeText?: any;
  onBlur?: any;
  touched?: any;
  editable?: boolean;
}

const ShareInput = (props: ShareInputProps) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const {
    title,
    keyboardType,
    secureTextEntry = false,
    value,
    setValue,
    onChangeText,
    onBlur,
    error,
    editable = true,
    touched,
  } = props;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.inputGroup}>
        {title && <Text style={styles.text}>{title}</Text>}
        <View>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocus(true)}
            onBlur={(e) => {
              onBlur?.(e); // Fix here: only call onBlur if it exists
              setIsFocus(false);
            }}
            keyboardType={keyboardType}
            style={[
              styles.input,
              { borderColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.GREY },
            ]}
            secureTextEntry={secureTextEntry && !isShowPassword}
          />
          {error && touched && (
            <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>
          )}
          {secureTextEntry && (
            <FontAwesome5
              style={styles.eye}
              name={isShowPassword ? "eye" : "eye-slash"}
              size={15}
              color="black"
              onPress={() => setIsShowPassword(!isShowPassword)}
            />
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    padding: 5,
    gap: 10,
  },
  text: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 10,
    borderRadius: 10,
  },
  eye: {
    position: "absolute",
    right: 10,
    top: 15,
  },
});

export default ShareInput;
