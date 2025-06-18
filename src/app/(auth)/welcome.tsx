import { ImageBackground, StyleSheet, Text, View } from "react-native";

import ShareButton from "@/components/button/share.button";
import SocialButton from "@/components/button/social.button";
import TextBetweenLine from "@/components/text/textline";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { APP_COLOR } from "../utils/constant";
const WelcomePage = () => {
  // if(true){
  //   return(
  //     <Redirect href={"/(tabs)"} />
  //   )
  // }
  const hanldelLogin = () => {
    router.push("/(auth)/login");
  };
  return (
    <ImageBackground
      source={{
        uri: "https://bizweb.dktcdn.net/100/287/440/files/cac-local-brand-da-nang-dep.jpg?v=1619602174052",
      }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <LinearGradient
        style={{ flex: 1 }}
        colors={["transparent", "#191B2F"]}
        locations={[0.2, 0.8]}
      >
        <View style={styles.container}>
          <View style={styles.welcomeText}>
            <Text style={styles.heading}>Welcome to</Text>
            <Text style={styles.body}>Tshirt-Shop</Text>
            <View>
              <Text style={styles.footer}>Brand quần áo số một</Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <Text style={[styles.footer]}>Việt Nam</Text>
              </View>
            </View>
          </View>
          <View style={styles.welcomeButton}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <ShareButton
                pressStyle={{
                  backgroundColor: "transparent",
                }}
                title="Log in with email"
                onPress={hanldelLogin}
                buttonStyle={{
                  justifyContent: "center",
                  borderRadius: 30,
                  paddingHorizontal: 100,
                  backgroundColor: "#2c2c2c",
                  borderColor: "#505050",
                  borderWidth: 1,
                  height: 60,
                }}
                textStyle={{ color: "white", paddingVertical: 6 }}
              />
            </View>
            <TextBetweenLine />
            <SocialButton textStyle={{ color: "white" }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ color: "white" }}>Chưa có tài khoản?</Text>
              <Link href={"/(auth)/signup"}>
                <Text
                  style={{ color: "white", textDecorationLine: "underline" }}
                >
                  Đăng ký
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  welcomeText: {
    flex: 0.6,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
  },
  welcomeButton: {
    flex: 0.4,
    gap: 30,
  },
  heading: {
    fontSize: 40,
    fontWeight: 600,
    
  },
  body: {
    fontSize: 30,
    color: APP_COLOR.ORANGE,
    marginVertical: 10,
  },
  footer: {
    fontSize: 20,
  },

  btnContainer: {
    flexDirection: "row",
    gap: 25,
    justifyContent: "center",
  },
  btnContent: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
});
export default WelcomePage;
