import ShareButton from "@/components/button/share.button";
import ShareInput from "@/components/input/share.input";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ForgotPasswordAPI } from "../utils/apiall";
import {
  ForgotPasswordSchema
} from "../utils/validate.schema";

const ForgotPassword = () => {
  const { email } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const ForgotPassword = async (code: string, password: string) => {
    setLoading(true);
    const res = await ForgotPasswordAPI(code, email as string, password);
    console.log("API response:", res);
    if (res.data) {
      setLoading(false);
      alert("Thay đổi mật khẩu thành công");
      router.navigate({
        pathname: "/(auth)/login",
      });
    } else {
      setLoading(false);
      alert(res.message);
    }
    console.log("Email:", email);
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
                Thay đổi mật khẩu
              </Text>
            </View>
            <Formik
              validationSchema={ForgotPasswordSchema}
              initialValues={{ code: "", newPassword: "", confirmPassword: "" }}
              onSubmit={(values) => ForgotPassword(values.code, values.newPassword)}
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
                    title="Mã xác nhận"
                    onChangeText={handleChange("code")}
                    onBlur={handleBlur("code")}
                    value={values.code}
                    error={errors.code}
                    touched={touched.code}
                  />
                  <View style={{ marginTop: 20 }}></View>
                  <ShareInput
                    title="Mật khẩu mới"
                    secureTextEntry={true}
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    value={values.newPassword}
                    error={errors.newPassword}
                    touched={touched.newPassword}
                  />
                  <View style={{ marginTop: 20 }}></View>
                  <ShareInput
                    title="Nhập lại mật khẩu"
                    secureTextEntry={true}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
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
export default ForgotPassword;
