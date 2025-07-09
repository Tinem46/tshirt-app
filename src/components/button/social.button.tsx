import fb from "@/assets/auth/facebook.png";
import gg from "@/assets/auth/google.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import ShareButton from "./share.button";
// import { useDispatch } from "react-redux"; // Nếu dùng redux
// import { login } from "@/redux/features/userSlice"; // Nếu dùng redux
import { googleLoginAPI } from "@/app/utils/apiall";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

interface IProps {
  textStyle?: any;
}

const GOOGLE_CLIENT_ID =
  "1009591136005-4uidjil5c2bqc9mbtm8bip6q9017c2a1.apps.googleusercontent.com"; // Web Client ID (dùng cho Expo Go)
const GOOGLE_ANDROID_ID =
  "1009591136005-ig2qr4010oovtdqinec9fn4q7rpqpnl7.apps.googleusercontent.com";

const SocialButton = (props: IProps) => {
  const { textStyle } = props;
  // const dispatch = useDispatch(); // Nếu dùng redux

  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (
      response?.type === "success" &&
      response?.authentication?.accessToken &&
      response?.params?.id_token
    ) {
      const { authentication } = response;
      handleGoogleToken(authentication.accessToken, response.params.id_token);
    } else if (response?.type === "success") {
      alert("Google authentication failed: missing token.");
    }
  }, [response]);

  const handleGoogleToken = async (tokenId: string, idToken: string) => {
    try {
      setLoading(true);
      // Dùng idToken mới đúng chuẩn backend của bạn
      const res = await googleLoginAPI(tokenId);
      const { role } = res.data;
      const token = res.data?.data?.accessToken;
      const userId = res.data?.data?.id;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role);
      await AsyncStorage.setItem("userId", userId);

      router.push("/(tabs)"); // Chuyển hướng đến trang chính sau khi đăng nhập thành công

      alert("Login Google thành công!");
    } catch (err) {
      alert("Login Google thành công!");
      ("Có lỗi khi đăng nhập Google!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.btnContainer}>
        <ShareButton
          title="FACEBOOK"
          pressStyle={{ backgroundColor: "transparent" }}
          onPress={() => {
            alert("Facebook login chưa triển khai");
          }}
          buttonStyle={{
            justifyContent: "center",
            borderRadius: 30,
            backgroundColor: "transparent",
          }}
          icon={<Image source={fb} style={{ width: 24, height: 24 }} />}
          textStyle={{
            color: "black",
            ...textStyle,
          }}
        />
        <ShareButton
          pressStyle={{ backgroundColor: "transparent" }}
          title={loading ? "Loading..." : "GOOGLE"}
          onPress={() => promptAsync()}
          buttonStyle={{
            justifyContent: "center",
            borderRadius: 30,
            backgroundColor: "transparent",
            opacity: loading ? 0.7 : 1,
          }}
          icon={
            loading ? (
              <ActivityIndicator size={24} color="#4285F4" />
            ) : (
              <Image source={gg} style={{ width: 24, height: 24 }} />
            )
          }
          textStyle={{
            color: "black",
            ...textStyle,
          }}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    gap: 25,
    justifyContent: "center",
  },
});

export default SocialButton;
