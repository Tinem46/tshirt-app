import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import TextBetweenLine from "@/components/text/textline";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerApi } from "../utils/apiall";
import { RegisterSchema } from "../utils/validate.schema";

const SignUpPage = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    gender: number // 0=Nam, 1=Nữ
  ) => {
    try {
      setLoading(true);
      const response = await registerApi(
        email,
        password,
        firstName,
        lastName,
        gender
      );
      // response.data.userId trả về từ backend (nếu có)
      const isSuccess = response; // Giả sử backend trả về success: true/false
      if (isSuccess) {
        Toast.show("Đăng ký thành công. Vui lòng xác nhận email!", {
          position: Toast.positions.TOP,
        });
        // Chuyển sang màn xác nhận email, truyền userId & email
        router.push({
          pathname: "/(auth)/confirmEmailPage",
          params: {
            email,
            userId: response.data?.data?.id,
          },
        });
      } else {
        Toast.show("Đăng ký thất bại!", { position: Toast.positions.TOP });
        console.error("Sign up failed:", response);
      }
    } catch (error) {
      // Xử lý lỗi
      Toast.show("Có lỗi xảy ra khi đăng ký!", {
        position: Toast.positions.TOP,
      });
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Formik
        validationSchema={RegisterSchema}
        initialValues={{
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          gender: true,
        }}
        onSubmit={(values) => {
          handleSignUp(
            values.email,
            values.password,
            values.firstName,
            values.lastName,
            values.gender ? 0 : 1 // 0=Nam, 1=Nữ
          );
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <View style={styles.conntainer}>
            <View>
              <Text style={styles.textTitle}>Sign Up </Text>
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
            <ShareInput
              title="First Name"
              onChangeText={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
              value={values.firstName}
              error={errors.firstName}
              touched={touched.firstName}
            />
            <ShareInput
              title="Last Name"
              onChangeText={handleChange("lastName")}
              onBlur={handleBlur("lastName")}
              value={values.lastName}
              error={errors.lastName}
              touched={touched.lastName}
            />
            <View style={styles.genderGroup}>
              <Text style={styles.genderTitle}>Giới tính</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={styles.genderOption}
                  onPress={() => setFieldValue("gender", true)}
                >
                  <View style={styles.genderCircle}>
                    {values.gender === true && (
                      <View style={styles.genderCircleSelected} />
                    )}
                  </View>
                  <Text>Nam</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.genderOption}
                  onPress={() => setFieldValue("gender", false)}
                >
                  <View style={styles.genderCircle}>
                    {values.gender === false && (
                      <View style={styles.genderCircleSelected} />
                    )}
                  </View>
                  <Text>Nữ</Text>
                </TouchableOpacity>
              </View>

              {touched.gender && errors.gender && (
                <Text style={styles.genderErrorText}>{errors.gender}</Text>
              )}
            </View>

            <ShareButton
              loading={loading}
              title="Sign Up"
              onPress={handleSubmit as any}
              buttonStyle={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 30,
                paddingHorizontal: 120,
              }}
              textStyle={{ color: "white", paddingVertical: 6 }}
              pressStyle={{ alignSelf: "center" }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                marginVertical: 15,
              }}
            >
              <Text style={{ color: "black" }}>Have you account?</Text>
              <Link href={"/"}>
                <Text
                  style={{ color: "black", textDecorationLine: "underline" }}
                >
                  Sign in
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
    marginVertical: 20,
  },

  container: {
    flex: 1,
    marginHorizontal: 20,
    gap: 15,
    marginTop: 20,
  },

  genderGroup: {
    marginTop: 10,
  },
  genderTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  genderOptions: {
    flexDirection: "row",
    gap: 20,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  genderCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  genderCircleSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  genderErrorText: {
    color: "red",
    marginTop: 5,
  },
});
export default SignUpPage;
