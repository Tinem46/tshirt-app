import { View, Button, StyleSheet, Text, Keyboard } from "react-native";
import React, { useRef, useState } from "react";
import { OtpInput, OtpInputProps } from "react-native-otp-entry";
import LoadingOverlay from "@/components/loading/overlay";
import { resendCodeAPI, verifyAPI } from "../utils/apiall";
import Toast from "react-native-root-toast";
import { router, useLocalSearchParams } from "expo-router";
import { Try } from "expo-router/build/views/Try";

const VerifyPage = () => {
  const {email} = useLocalSearchParams();
  const otpInput = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const handleCellTextChange = async (code: string) => {
    if (code.length === 6) {
      setLoading(true);
      Keyboard.dismiss();
      setTimeout(() => {
        setLoading(false);
      }, 3000);
      const response = await verifyAPI(email as string, code);
      setLoading(false);
      router.navigate("/(auth)/login")
      if (response.data) {
        alert("Verify successfully");
        
      } else {
        Toast.show(response.message, {
          position: Toast.positions.TOP,
        });
      }
    }
  };

  const handleResendCode  = async() => {
    setCode("");
    try {
      const response = await resendCodeAPI(email as string);
      if(response.data){
        alert("Resend code successfully");
      }else{
        Toast.show(response.message, {
          position: Toast.positions.TOP,
        });
      }
    } catch (error) {
      console.log(error);
    }
    
  }
  return (
    <>
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            Verification Code
          </Text>
        </View>
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            Enter the verification code sent to your email address
          </Text>
        </View>

        <View>
          <OtpInput
            numberOfDigits={6}
            focusColor="#f4511e"
            onTextChange={handleCellTextChange}
            ref={otpInput}
            theme={{
              pinCodeContainerStyle: styles.otpBox,
              pinCodeTextStyle: styles.otpText,
            }}
          />
        </View>

        <View style={{ marginVertical: 30 }}>
          <Text style={{ fontSize: 14 }}>Không nhận được mã xác nhận</Text>
          <Text onPress={handleResendCode}
           style={{ fontSize: 14, textDecorationLine: "underline" }}>
            Gửi lại mã xác nhận
          </Text>
        </View>
      </View>
      {loading && <LoadingOverlay />}
    </>
  );
};

export default VerifyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },

  otpBox: {
    width: 50,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
