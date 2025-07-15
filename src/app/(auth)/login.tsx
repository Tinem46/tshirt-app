import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import TextBetweenLine from "@/components/text/textline";
import { useCurrentApp } from "@/context/app.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginAPI } from "../utils/apiall";
import { LoginSchema } from "../utils/validate.schema";

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setAppState } = useCurrentApp();

  const handleLogin = async (Email: string, Password: string) => {
    setLoading(true);
    try {
      const response = await loginAPI(Email, Password);
      // Lưu ý: response ở đây là object { isSuccess, data, message }
      const apiData = response;
      const isSuccess = apiData?.isSuccess;
      const token = apiData?.data?.accessToken;
      const role = apiData?.data?.roles?.[0] || "USER";
      const userId = apiData?.data?.id;
      const refreshToken = apiData?.data?.refreshToken;

      if (isSuccess && token) {
        // Lưu vào AsyncStorage
        await AsyncStorage.setItem("access_token", token);
        await AsyncStorage.setItem("role", role);
        await AsyncStorage.setItem("userId", String(userId));
        if (refreshToken)
          await AsyncStorage.setItem("refreshToken", refreshToken);

        // Cập nhật context nếu cần
        setAppState?.({
          token,
          role,
          userId,
          refreshToken,
        });
        console.log("Login successful:", { token, role, userId });

        // Điều hướng theo role (tuỳ chỉnh nếu app có trang riêng)

        router.replace("/(tabs)");
        Toast.show("Login successful!", { position: Toast.positions.TOP });
      } else {
        Toast.show(apiData?.message || "Login failed!", {
          position: Toast.positions.TOP,
        });
        console.error("Login failed:", apiData?.message || "Unknown error");
      }
    } catch (error: any) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your Email and Password.";
      Toast.show(msg, { position: Toast.positions.TOP });
      console.error("Login error:", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={LoginSchema}
        initialValues={{ Email: "", Password: "" }}
        onSubmit={(values) => handleLogin(values.Email, values.Password)}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.conntainer}>
            <View>
              <Text style={styles.textTitle}>Sign in</Text>
            </View>
            <ShareInput
              title="Email"
              keyboardType="email-address"
              onChangeText={handleChange("Email")}
              onBlur={handleBlur("Email")}
              value={values.Email}
              error={errors.Email}
              touched={touched.Email}
            />
            <ShareInput
              title="Password"
              secureTextEntry={true}
              onChangeText={handleChange("Password")}
              onBlur={handleBlur("Password")}
              value={values.Password}
              error={errors.Password}
              touched={touched.Password}
            />
            <View style={{ marginTop: 5 }} />
            <ShareButton
              loading={loading}
              title="Sign in"
              onPress={handleSubmit}
              buttonStyle={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 30,
                paddingHorizontal: 120,
                // backgroundColor: "#f57c00",
              }}
              textStyle={{ color: "white", paddingVertical: 6 }}
              pressStyle={{ alignSelf: "center" }}
            />
            <View style={{ marginVertical: 1 }}>
              <Text
                onPress={() => router.navigate("/(auth)/request.password")}
                style={{
                  textAlign: "center",
                  color: "black",
                  textDecorationLine: "underline",
                }}
              >
                Quên mật khẩu?
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                marginVertical: 15,
              }}
            >
              <Text style={{ color: "black" }}>Don&apos;t have an account?</Text>
              <Link href={"/(auth)/signup"}>
                <Text
                  style={{ color: "black", textDecorationLine: "underline" }}
                >
                  Sign up
                </Text>
              </Link>
            </View>
            <TextBetweenLine color="black" />
            <SocialButton />
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conntainer: {
    flex: 1,
    marginHorizontal: 20,
    gap: 15,
    marginTop: 20,
  },
  textTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 30,
  },
});

export default Login;
