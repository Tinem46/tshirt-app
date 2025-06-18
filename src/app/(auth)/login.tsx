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
  const [username, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { setAppState } = useCurrentApp();

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await loginAPI(email, password);

      if (response.data) {
        const a = response.data;
        alert("Login successfully");
        await AsyncStorage.setItem("access_token", a.access_token);
        setAppState(a);
        router.navigate({
          pathname: "/(tabs)",
        });
      } else {
        const m = Array.isArray(response.message)
          ? response.message[0]
          : response.message;
        Toast.show(m, {
          position: Toast.positions.TOP,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={LoginSchema}
        initialValues={{ email: "", password: "" }}
        onSubmit={(values) => handleLogin(values.email, values.password)}
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
          //     onChangeText={handleChange("email")}
          //     onBlur={handleBlur("email")}
          //     value={values.email}
          //   />
          //   {errors.email && <Text style={{ color: "red" }}>{errors.email}</Text>}
          //   <View style={{ marginVertical: 10 }}></View>
          //   <Text>Password</Text>
          //   <TextInput
          //     style={{ borderWidth: 1, borderColor: "#ccc" }}
          //     onChangeText={handleChange("password")}
          //     onBlur={handleBlur("password")}
          //     value={values.password}
          //   />
          //   {errors.password && <Text style={{ color: "red" }}>{errors.password}</Text>}
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
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              error={errors.email}
              touched={touched.email}
            />

            <ShareInput
              title="Password"
              secureTextEntry={true}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
              error={errors.password}
              touched={touched.password}
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
