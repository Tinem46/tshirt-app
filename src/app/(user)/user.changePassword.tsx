import ShareButton from "@/components/button/share.button";
import ShareInput from "@/components/input/share.input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Formik, FormikProps } from "formik";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { updatePasswordAPI } from "../utils/apiall";
import { APP_COLOR } from "../utils/constant";
import { ChangePassSchema } from "../utils/validate.schema";

const ChangePassword = () => {
  const formikRef = useRef<FormikProps<any>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const handleChange = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    // Log payload gửi lên API
    console.log({ oldPassword, newPassword, confirmPassword });
    const res = await updatePasswordAPI(
      oldPassword,
      newPassword,
      confirmPassword
    );
    setLoading(false);
    if (res.data) {
      Toast.show("Cập nhật mật khẩu thành công. Đăng xuất...", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });
      formikRef.current?.resetForm();
      // Đăng xuất: xóa token và chuyển về login
      await AsyncStorage.removeItem("access_token");
      router.replace("/(auth)/login");
    } else {
      Toast.show("Cập nhật thất bại", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: "red",
        opacity: 1,
      });
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
          <Formik
            innerRef={formikRef}
            validationSchema={ChangePassSchema}
            initialValues={{
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            onSubmit={(values) =>
              handleChange(
                values?.currentPassword ?? "",
                values?.newPassword ?? "",
                values?.confirmPassword ?? ""
              )
            }
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
              <View style={styles.conntainer}>
                <ShareInput
                  secureTextEntry={true}
                  title="Mật khẩu hiện tại"
                  onChangeText={handleChange("currentPassword")}
                  onBlur={handleBlur("currentPassword")}
                  value={values.currentPassword}
                  error={errors.currentPassword}
                  touched={touched.currentPassword}
                />

                <ShareInput
                  title="Mật khẩu"
                  secureTextEntry={true}
                  onChangeText={handleChange("newPassword")}
                  onBlur={handleBlur("newPassword")}
                  value={values.newPassword}
                  error={errors.newPassword}
                  touched={touched.newPassword}
                />

                <ShareInput
                  title="Nhập lại mật khẩu"
                  secureTextEntry={true}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />
                <View style={{ marginTop: 15 }}></View>
                <ShareButton
                  useDynamicStyle={true}
                  loading={loading}
                  title="Lưu thay đổi"
                  onPress={handleSubmit as any}
                  disabled={
                    !(
                      isValid &&
                      dirty &&
                      values.currentPassword &&
                      values.newPassword &&
                      values.confirmPassword
                    )
                  }
                  isValid={isValid}
                  dirty={dirty}
                  buttonStyle={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 120,
                  }}
                  textStyle={{ paddingVertical: 6 }}
                  pressStyle={{ alignSelf: "center" }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 10,
                    marginVertical: 15,
                  }}
                ></View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conntainer: {
    flex: 1,
    marginHorizontal: 20,
    gap: 15,
    marginTop: 100,
  },
});
export default ChangePassword;
