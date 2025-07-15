import ShareButton from "@/components/button/share.button";
import { useCurrentApp } from "@/context/app.context";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { backEndURL } from "../utils/apiall";
import { APP_COLOR } from "../utils/constant";

const AccountPage = () => {
  const { appState } = useCurrentApp();
  const baseImgage = `${backEndURL()}/images/avatar`;

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn chắc chắn đăng xuất người dùng ?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xác nhận",
        onPress: async () => {
          await AsyncStorage.removeItem("access_token");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* Header */}
      <View style={styles.header}>
        {/* <Image
          source={{ uri: `${baseImgage}/${appState?.user.avatar}` }}
          style={styles.avatar}
        /> */}
        {/* <Text style={styles.username}>
          {appState?.user.firstName || "User"}
        </Text> */}
      </View>

      {/* Options */}
      <View style={styles.section}>
        <Pressable
          onPress={() => router.push("/(user)/user.infor")}
          style={styles.itemContainer}
        >
          <View style={styles.item}>
            <Feather name="user-check" size={20} />
            <Text style={styles.itemText}>Thông tin tài khoản</Text>
          </View>
          <MaterialIcons name="navigate-next" size={24} color="#999" />
        </Pressable>

        <Pressable
          onPress={() => router.push("/(user)/user.changePassword")}
          style={styles.itemContainer}
        >
          <View style={styles.item}>
            <Feather name="key" size={20} />
            <Text style={styles.itemText}>Thay đổi mật khẩu</Text>
          </View>
          <MaterialIcons name="navigate-next" size={24} color="#999" />
        </Pressable>

        <Pressable style={styles.itemContainer}>
          <View style={styles.item}>
            <Feather name="headphones" size={20} />
            <Text style={styles.itemText}>Địa chỉ</Text>
          </View>
          <MaterialIcons name="navigate-next" size={24} color="#999" />
        </Pressable>

        <Pressable style={styles.itemContainer}>
          <View style={styles.item}>
            <Feather name="info" size={20} />
            <Text style={styles.itemText}>Về ứng dụng</Text>
          </View>
          <MaterialIcons name="navigate-next" size={24} color="#999" />
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ShareButton
          title="Đăng xuất"
          textStyle={{
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
          }}
          buttonStyle={{
            width: "100%",
            justifyContent: "center",
            paddingVertical: 14,
            borderRadius: 8,
          }}
          icon={<Feather name="log-out" size={20} color="white" />}
          onPress={handleLogout}
        />
        <Text style={styles.version}>Version 1.0 - @HoTamKhang</Text>
      </View>
    </View>
  );
};

export default AccountPage;

const styles = StyleSheet.create({
  header: {
    backgroundColor: APP_COLOR.GREY,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginBottom: 20,
    marginTop: 100,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 100,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  itemContainer: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  footer: {
    marginTop: 50,
    padding: 20,
  },
  version: {
    textAlign: "center",
    color: "#888",
    marginTop: 12,
    fontSize: 13,
  },
});
