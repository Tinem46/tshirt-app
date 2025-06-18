import ShareButton from "@/components/button/share.button";
import ShareInput from "@/components/input/share.input";
import { useCurrentApp } from "@/context/app.context";
import { Formik } from "formik";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-root-toast";
import { updateUserAPI } from "../utils/apiall";
import { APP_COLOR } from "../utils/constant";
import { UpdateUserSchema } from "../utils/validate.schema";

const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL;
const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL;
const UserInfo = () => {
  const { appState, setAppState } = useCurrentApp();
  const [loading, setLoading] = useState<boolean>(false);

  const backend =
    Platform.OS === "android" ? URL_ANROID_BACKEND : URL_IOS_BACKEND;
  const baseImgage = `${backend}/images/avatar`;

  const handleUpdateUser = async (name: string, phone: string) => {
    if (appState?.user._id) {
      const res = await updateUserAPI(appState?.user._id, name, phone);
      console.log(res);
      if (res.data) {
        Toast.show("Cập nhật thành công", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
        // Update context
        setAppState({
          ...appState,
          user: { ...appState?.user, name: name, phone: phone },
        });
      } else {
        const m = Array.isArray(res.message) ? res.message[0] : res.message;
        Toast.show(m, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <View>
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Image
              source={{ uri: `${baseImgage}/${appState?.user.avatar}` }}
              style={{ width: 150, height: 150 }}
            />
            <Text>{appState?.user.name}</Text>
          </View>
          <Formik
            validationSchema={UpdateUserSchema}
            initialValues={{
              name: appState?.user.name,
              email: appState?.user.email,
              phone: appState?.user.phone,
            }}
            onSubmit={(values) =>
              handleUpdateUser(values?.name ?? "", values?.phone ?? "")
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
              <View
                style={{
                  marginTop: 20,
                  gap: 20,
                  marginHorizontal: 20,
                  padding: 10,
                }}
              >
                <ShareInput
                  title="Họ Và Tên: "
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                  error={errors.name}
                  touched={touched.name}
                />
                <ShareInput
                  title="Email: "
                  editable={false}
                  keyboardType="email-address"
                  value={appState?.user.email}
                />
                <ShareInput
                  title="Phone: "
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  value={values.phone}
                  error={errors.phone}
                  touched={touched.phone}
                />
                <View></View>
                <ShareButton
                  useDynamicStyle={true}
                  loading={loading}
                  title="Lưu thay đổi"
                  onPress={handleSubmit as any}
                  disabled={!(isValid && dirty)}
                  isValid={isValid}
                  dirty={dirty}
                  buttonStyle={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 95,
                    paddingVertical: 5,
                  }}
                  textStyle={{ paddingVertical: 6 }}
                  pressStyle={{ alignSelf: "center" }}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserInfo;
