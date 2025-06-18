import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import ShareInput from "@/components/input/share.input";
import TextBetweenLine from "@/components/text/textline";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerApi } from "../utils/apiall";
import { RegisterSchema } from "../utils/validate.schema";

const SignUpPage = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignUp = async (
    email: string,
    name: string,
    password: string
  ) => {
    try {
      setLoading(true);
      const response = await registerApi(email, name, password);
      console.log(response.data);
      if (response.data) {
        alert("Sign up successfully");
        router.navigate({
          pathname: "/(auth)/verify",
          params: { email: email },
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
        validationSchema={RegisterSchema}
        initialValues={{ email: "", name: "", password: "" }}
        onSubmit={(values) =>
          handleSignUp(values.email, values.name, values.password)
        }
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
              title="Name"
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              value={values.name}
              error={errors.name}
              touched={touched.name}
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
            <View style={{ marginTop: 10 }}></View>
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
    marginVertical: 30,
  },
});
export default SignUpPage;
