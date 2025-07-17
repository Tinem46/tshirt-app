import ShareButton from "@/components/button/share.button";
import ShareInput from "@/components/input/share.input";
import { router } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RequestPasswordAPI } from "../utils/apiall";
import { RequestPasswordSchema } from "../utils/validate.schema";

const RequestPassword = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleRequest = async (email: string) => {
    setLoading(true);
    const res = await RequestPasswordAPI(email);
    if (res.data) {
      setLoading(false);
      alert("Yêu cầu đã được gửi, vui lòng kiểm tra email của bạn");
      router.navigate({
        pathname: "/(auth)/forgot.password",
        params: { email: email },
      });
    } else {
      setLoading(false);
      alert(res.message);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                Quên mật khẩu
              </Text>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 10, color: "#999999" }}>
                Vui lòng điền vào email tài khoản đăng nhập của bạn để thực hiện yêu
                cầu thay đổi mật khẩu
              </Text>
            </View>

            <Formik
              validationSchema={RequestPasswordSchema}
              initialValues={{ email: "" }}
              onSubmit={(values) => handleRequest(values.email)}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
                dirty,
              }) => (
                <View style={{ paddingHorizontal: 20 }}>
                  <ShareInput
                    title="Email"
                    keyboardType="email-address"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    error={errors.email}
                    touched={touched.email}
                  />
                  <View style={{ marginTop: 35 }}>
                    <ShareButton
                      useDynamicStyle={true}
                      disabled={!(isValid && dirty)}
                      isValid={isValid}
                      dirty={dirty}
                      title="Xác nhận"
                      onPress={handleSubmit}
                      loading={loading}
                      buttonStyle={{
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 30,
                        paddingHorizontal: 90,
                      }}
                      textStyle={{ color: "white", paddingVertical: 6 }}
                      pressStyle={{ alignSelf: "center" }}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RequestPassword;
