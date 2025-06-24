import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import TextBetweenLine from "@/components/text/textline";
import { useCurrentApp } from "@/context/app.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginAPI } from "../utils/apiall";
import { LoginSchema } from "../utils/validate.schema";

const Login = () => {
  const [username, setUserName] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { setAppState } = useCurrentApp();

  const handleLogin = async (Email: string, Password: string) => {
    try {
      setLoading(true);
      const response = await loginAPI(Email, Password);
      console.log("Login response:", response);

      // Phần response trả ra sẽ có data.token giống web (nếu login thành công)
      if (response && response.token) {
        const { token } = response;

        // Decode token để lấy role, userId
        const decodedToken = jwtDecode<{ [key: string]: any }>(token);
        const role =
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] ||
          decodedToken.role ||
          "USER";
        const userId =
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ] ||
          decodedToken["sub"] ||
          decodedToken["id"] ||
          null;

        // Lưu vào AsyncStorage
        await AsyncStorage.setItem("access_token", token);
        await AsyncStorage.setItem("role", role);
        if (userId) await AsyncStorage.setItem("userId", String(userId));

        // Cập nhật context app state nếu cần
        setAppState({
          token,
          role,
          userId,
          // ...thêm user info khác nếu cần
        });

        // Điều hướng theo role

        router.replace("/(tabs)");
        Toast.show("Login successful!", { position: Toast.positions.TOP });
      } else {
        // Nếu backend trả lỗi
        const msg =
          (response && response.message) ||
          "Login failed. Please check your Email and Password.";
        Toast.show(msg, { position: Toast.positions.TOP });
      }
    } catch (error) {
      Toast.show("Login failed. Please check your Email and Password.", {
        position: Toast.positions.TOP,
      });
      console.log(error);
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
          // <View style={{ margin: 10 }}>
          //   <Text>Email</Text>
          //   <TextInput
          //     style={{ borderWidth: 1, borderColor: "#ccc" }}
          //     onChangeText={handleChange("Email")}
          //     onBlur={handleBlur("Email")}
          //     value={values.Email}
          //   />
          //   {errors.Email && <Text style={{ color: "red" }}>{errors.Email}</Text>}
          //   <View style={{ marginVertical: 10 }}></View>
          //   <Text>Password</Text>
          //   <TextInput
          //     style={{ borderWidth: 1, borderColor: "#ccc" }}
          //     onChangeText={handleChange("Password")}
          //     onBlur={handleBlur("Password")}
          //     value={values.Password}
          //   />
          //   {errors.Password && <Text style={{ color: "red" }}>{errors.Password}</Text>}
          //   <View style={{ marginVertical: 10 }}></View>

          //   <Button onPress={handleSubmit as any} title="Submit" />
          // </View>
          <View style={styles.conntainer}>
            <View>
              <Text style={styles.textTitle}>Sign in </Text>
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
            <View style={{ marginTop: 5 }}></View>

            <ShareButton
              loading={loading}
              title="Sign in"
              onPress={handleSubmit}
              buttonStyle={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 30,
                paddingHorizontal: 120,
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
              <Text style={{ color: "black" }}>Don't have an account?</Text>
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
  inputGroup: {
    padding: 5,
    gap: 10,
  },
  text: {
    fontSize: 18,
  },
  input: {
    borderColor: "#d0d0d0",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 10,
    borderRadius: 5,
  },
  textTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 30,
  },
});

export default Login;
