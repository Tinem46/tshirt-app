import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { confirmEmailAPI, resendConfirmationAPI } from "../utils/apiall";

const ConfirmEmailPage = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const userId = params.userId as string;
  const token = params.token as string;
  const [loading, setLoading] = useState<boolean>(!!token);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);

  useEffect(() => {
    if (userId && token) {
      const confirm = async () => {
        setLoading(true);
        try {
          await confirmEmailAPI(userId, token);
          Toast.show("Xác nhận email thành công!", {
            position: Toast.positions.TOP,
          });
          setConfirmed(true);
          setTimeout(() => router.replace("/(auth)/login"), 2000);
        } catch (err) {
          Toast.show("Xác nhận thất bại hoặc link hết hạn!", {
            position: Toast.positions.TOP,
          });
        } finally {
          setLoading(false);
        }
      };
      confirm();
    }
  }, [token, userId]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendConfirmationAPI(email);
      Toast.show("Đã gửi lại email xác nhận!", {
        position: Toast.positions.TOP,
      });
    } catch {
      Toast.show("Gửi lại email thất bại!", { position: Toast.positions.TOP });
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Icon */}
      {confirmed ? (
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/845/845646.png",
          }}
          style={styles.iconSuccess}
        />
      ) : (
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
          }}
          style={styles.iconEmail}
        />
      )}

      {/* Title & Text */}
      <Text style={styles.title}>
        {confirmed
          ? "Email Confirmed!"
          : loading
          ? "Đang xác nhận email..."
          : "Xác nhận Email"}
      </Text>

      <Text style={styles.text}>
        {confirmed
          ? "Bạn đã xác nhận email thành công. Đang chuyển sang trang đăng nhập..."
          : loading
          ? "Vui lòng chờ trong giây lát."
          : "Vui lòng kiểm tra email để xác nhận tài khoản. Nếu chưa nhận được, bạn có thể gửi lại email xác nhận."}
      </Text>

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#222"
          style={{ marginVertical: 16 }}
        />
      )}

      {/* Resend Button */}
      {!loading && !confirmed && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleResend}
          disabled={resending}
        >
          <Text style={styles.buttonText}>
            {resending ? "Đang gửi lại..." : "Gửi lại email xác nhận"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // tone trắng
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconEmail: {
    width: 64,
    height: 64,
    marginBottom: 16,
    tintColor: "#222", // tone đen
    opacity: 0.8,
  },
  iconSuccess: {
    width: 64,
    height: 64,
    marginBottom: 16,
    tintColor: "#2ecc40",
    opacity: 0.9,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  text: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#111",
    borderRadius: 25,
    minWidth: 220,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.1,
  },
});

export default ConfirmEmailPage;
