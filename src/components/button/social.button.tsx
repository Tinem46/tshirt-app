import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import ShareButton from "./share.button";
import fb from "@/assets/auth/facebook.png";
import gg from "@/assets/auth/google.png";
import TextBetweenLine from "../text/textline";

interface IProps {
  textStyle?: any;
}
const SocialButton = (props:IProps) => {
  const { textStyle } = props;
  return (
    <View>
      <View style={styles.btnContainer}>
        <ShareButton
          title="FACEBOOK"
          pressStyle={{ backgroundColor: "transparent" }}
          onPress={() => {
            alert("me");
          }}
          buttonStyle={{
            justifyContent: "center",
            borderRadius: 30,
            backgroundColor: "transparent",
          }}
          icon={<Image source={fb} style={{ width: 24, height: 24 }} />}
          textStyle={{
            color: "black",
            ...textStyle,
          }}
        />
        <ShareButton
          pressStyle={{ backgroundColor: "transparent" }}
          title="GOOGLE"
          onPress={() => {
            alert("me");
          }}
          buttonStyle={{
            justifyContent: "center",
            borderRadius: 30,
            backgroundColor: "transparent",
          }}
          icon={<Image source={gg} style={{ width: 24, height: 24 }} />}
          textStyle={{
            color: "black",
            ...textStyle,
          }}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    gap: 25,
    justifyContent: "center",
  },
});
export default SocialButton;
