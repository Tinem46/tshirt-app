import ShareButton from "@/components/button/share.button";
import ShareInput from "@/components/input/share.input";
import { Formik, FormikProps } from "formik";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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
    const res = await updatePasswordAPI(
      oldPassword,
      newPassword,
      confirmPassword
    );
    if (res.data) {
      setLoading(false);
      Toast.show("Cập nhật mật khẩu thành công", {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: APP_COLOR.ORANGE,
        opacity: 1,
      });
      formikRef.current?.resetForm();
    } else {
      setLoading(false);
      Toast.show(res.message, {
        duration: Toast.durations.LONG,
        textColor: "white",
        backgroundColor: "red",
        opacity: 1,
      });
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
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
            values?.oldPassword ?? "",
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
