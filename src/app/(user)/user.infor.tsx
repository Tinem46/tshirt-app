import { useCurrentApp } from "@/context/app.context";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { getUserInfoAPI, updateUserAPI } from "../utils/apiall";
import { APP_COLOR } from "../utils/constant";
import { UpdateUserSchema } from "../utils/validate.schema";
// Giới tính
const GENDERS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const ProfilePage = () => {
  const { appState, setAppState } = useCurrentApp();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // fetch user info
  const [user, setUser] = useState<any>(null);

  // Fetch current user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      setFetching(true);
      try {
        const res = await getUserInfoAPI();
        // res.data: { ...user }
        setUser(res.data);
        setAppState((prev: any) => ({
          ...prev,
          user: res.data,
        }));
      } catch {
        Toast.show("Không thể tải thông tin người dùng!", {
          duration: Toast.durations.LONG,
          backgroundColor: "#e53935",
        });
      }
      setFetching(false);
    };
    fetchUser();
  }, []);

  if (fetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={{ marginTop: 16, color: "#333" }}>
          Đang tải thông tin hồ sơ...
        </Text>
      </View>
    );
  }

  // Chuẩn hoá giá trị cho form
  const initialValues = {
    firstName: user?.firstName || "", // an toàn
    lastName: user?.lastName || "",
    gender:
      typeof user?.gender === "number"
        ? ["male", "female", "other"][user.gender] || "other"
        : (user?.gender || "").toLowerCase(),
  };

  // Update user
  const handleUpdateUser = async (values: any) => {
    setLoading(true);
    try {
      // Nếu backend yêu cầu gender là số (0/1/2)
      const { phoneNumber, ...rest } = values;
      const payload = {
        ...rest,
        gender:
          values.gender === "male" ? 0 : values.gender === "female" ? 1 : 2,
      };
      await updateUserAPI(user?.id, payload);
      Toast.show("Cập nhật thành công!", {
        duration: Toast.durations.LONG,
        backgroundColor: APP_COLOR.ORANGE,
        textColor: "#fff",
      });
      setUser((u: any) => ({ ...u, ...values, gender: payload.gender }));
      setAppState((prev: any) => ({
        ...prev,
        user: { ...prev.user, ...values, gender: payload.gender },
      }));
    } catch (e: any) {
      Toast.show("Lỗi khi cập nhật. Vui lòng thử lại!", {
        duration: Toast.durations.LONG,
        backgroundColor: "#e53935",
        textColor: "#fff",
      });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.title}>Hồ Sơ Của Tôi</Text>
          <Text style={styles.desc}>
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </Text>
        </View>

        <Formik
          validationSchema={UpdateUserSchema}
          initialValues={initialValues}
          enableReinitialize
          onSubmit={handleUpdateUser}
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
            setFieldValue,
          }) => {
            console.log('Formik values:', values);
            return (
              <View style={styles.form}>
                {/* First Name */}
                <Text style={styles.label}>Tên</Text>
                <TextInputField
                  value={values.firstName}
                  onChangeText={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  error={touched.firstName && errors.firstName}
                  placeholder="Nhập tên..."
                />

                {/* Last Name */}
                <Text style={styles.label}>Họ</Text>
                <TextInputField
                  value={values.lastName}
                  onChangeText={handleChange("lastName")}
                  onBlur={handleBlur("lastName")}
                  error={touched.lastName && errors.lastName}
                  placeholder="Nhập họ..."
                />

                {/* Gender */}
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g.value}
                      style={[
                        styles.genderBtn,
                        values.gender === g.value && styles.genderBtnActive,
                      ]}
                      onPress={() => setFieldValue("gender", g.value)}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          values.gender === g.value && styles.genderTextActive,
                        ]}
                      >
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.gender && errors.gender && (
                  <Text style={styles.error}>{errors.gender}</Text>
                )}

                {/* Email (read only) */}
                <Text style={styles.label}>Email</Text>
                <TextInputField value={user?.email || ""} editable={false} />

                {/* Save Button */}
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    !(isValid && dirty) && { opacity: 0.6 },
                  ]}
                  onPress={handleSubmit as any}
                  disabled={loading || !(isValid && dirty)}
                >
                  <Text style={styles.saveBtnText}>
                    {loading ? "Đang lưu..." : "Lưu"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ---- Helper Field ----

function TextInputField(props: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        style={[
          styles.input,
          props.editable === false && { backgroundColor: "#eee" },
        ]}
        {...props}
      />
      {props.error && <Text style={styles.error}>{props.error}</Text>}
    </View>
  );
}

// ---- STYLE ----
const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: 100, marginBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
    backgroundColor: "#ddd",
  },
  title: { fontSize: 23, fontWeight: "bold", marginBottom: 6 },
  desc: { color: "#555", marginBottom: 14, fontSize: 14 },
  form: { paddingHorizontal: 28, marginBottom: 30 },
  label: { fontWeight: "500", color: "#333", marginBottom: 4, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#e4e5f2",
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#111",
  },
  error: { color: "#e02828", marginTop: 3, fontSize: 13 },
  genderRow: { flexDirection: "row", gap: 11, marginVertical: 7 },
  genderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 19,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  genderBtnActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  genderText: { color: "#111" },
  genderTextActive: { color: "#fff", fontWeight: "bold" },
  saveBtn: {
    marginTop: 30,
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 32,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.2,
  },
});

export default ProfilePage;
