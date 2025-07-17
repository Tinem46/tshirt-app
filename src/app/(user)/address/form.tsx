import { IAddress } from "@/app/types/model";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import Toast from "react-native-root-toast";
import * as Yup from "yup";
import { createAddress, getUserAddress, updateAddress } from "../../utils/addressService";
import { getDistrictsByProvince, getProvinces, getWardsByDistrict } from "../../utils/vnLocationService";


const phoneRegex = /^(0|\+84)(\d{9})$/;
const validationSchema = Yup.object({
    receiverName: Yup.string().required("Bắt buộc"),
    phone: Yup.string().required("Bắt buộc").matches(phoneRegex, "Số điện thoại không hợp lệ"),
    detailAddress: Yup.string().required("Bắt buộc").min(5, "Địa chỉ chi tiết quá ngắn"),
    province: Yup.string().required("Bắt buộc"),
    district: Yup.string().required("Bắt buộc"),
    ward: Yup.string().required("Bắt buộc"),
});





const handleSubmitForm = async (mode: string, id: string | string[] | undefined, values: IAddress) => {
    try {
        if (mode === "edit" && id) {
            await updateAddress(id as string, values);
            Toast.show("Cập nhật thành công", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                backgroundColor: "#4CAF50",
            });
        } else {
            await createAddress(values);
            Toast.show("Thêm địa chỉ thành công", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                backgroundColor: "#4CAF50",
            });
        }
        router.back();
    } catch {
        Toast.show("Lỗi khi lưu địa chỉ", {
            backgroundColor: "#f44336",
            position: Toast.positions.CENTER,
        });
    }
};

export default function AddressForm() {
    const { mode, id } = useLocalSearchParams();
    const [initialValues, setInitialValues] = useState<IAddress>({
        receiverName: "",
        phone: "",
        detailAddress: "",
        province: "",
        district: "",
        ward: "",
        isDefault: false,
    });

    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    const loadData = async () => {
  const provs = await getProvinces();
  setProvinces(provs);

  if (mode === "edit" && id) {
    console.log("[DEBUG] ✏️ Edit mode - fetching address with ID:", id);
    const res = await getUserAddress();
    const found = res.data.find((a: IAddress) => a.id === id);
    if (found) {
      console.log("[DEBUG] ✅ Found:", found);
      setInitialValues(found);

      // 👉 Load districts & wards tương ứng
      const selectedProvince = provs.find(p => p.name === found.province);
      if (selectedProvince) {
        const distRes = await getDistrictsByProvince(selectedProvince.code);
        setDistricts(distRes.districts);

        const selectedDistrict = distRes.districts.find(d => d.name === found.district);
        if (selectedDistrict) {
          const wardRes = await getWardsByDistrict(selectedDistrict.code);
          setWards(wardRes.wards);
        }
      }
    }
  }
};



    useEffect(() => {
        loadData();
    }, []);

    const onProvinceChange = async (provinceName: string, setFieldValue: any) => {
        const selected = provinces.find(p => p.name === provinceName);
        if (!selected) return;
        const res = await getDistrictsByProvince(selected.code);
        setDistricts(res.districts);
        setWards([]);
        setFieldValue("province", provinceName);
        setFieldValue("district", "");
        setFieldValue("ward", "");
    };

    const onDistrictChange = async (districtName: string, setFieldValue: any) => {
        const selected = districts.find(d => d.name === districtName);
        if (!selected) return;
        const res = await getWardsByDistrict(selected.code);
        setWards(res.wards);
        setFieldValue("district", districtName);
        setFieldValue("ward", "");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft} />
                        <Text style={styles.headerTitle}>
                            {mode === "edit" ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                        </Text>
                        <View style={styles.headerRight} />
                    </View>

                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => handleSubmitForm(mode as string, id, values)}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                            <View style={styles.formContainer}>
                                {/* Thông tin người nhận */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Thông tin người nhận</Text>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Tên người nhận</Text>
                                        <TextInput
                                            placeholder="Nhập tên người nhận"
                                            placeholderTextColor="#9e9e9e"
                                            value={values.receiverName}
                                            onChangeText={handleChange("receiverName")}
                                            onBlur={handleBlur("receiverName")}
                                            style={[
                                                styles.input,
                                                errors.receiverName && touched.receiverName && styles.inputError
                                            ]}
                                        />
                                        {errors.receiverName && touched.receiverName && (
                                            <Text style={styles.errorText}>{errors.receiverName}</Text>
                                        )}
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Số điện thoại</Text>
                                        <TextInput
                                            placeholder="Nhập số điện thoại"
                                            placeholderTextColor="#9e9e9e"
                                            value={values.phone}
                                            onChangeText={handleChange("phone")}
                                            onBlur={handleBlur("phone")}
                                            keyboardType="phone-pad"
                                            style={[
                                                styles.input,
                                                errors.phone && touched.phone && styles.inputError
                                            ]}
                                        />
                                        {errors.phone && touched.phone && (
                                            <Text style={styles.errorText}>{errors.phone}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Địa chỉ */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Địa chỉ</Text>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Tỉnh/Thành phố</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={values.province}
                                                onValueChange={(val) => onProvinceChange(val, setFieldValue)}
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="Chọn tỉnh/thành phố" value="" />
                                                {provinces.map((p) => (
                                                    <Picker.Item key={p.code} label={p.name} value={p.name} />
                                                ))}
                                            </Picker>
                                        </View>
                                        {errors.province && touched.province && (
                                            <Text style={styles.errorText}>{errors.province}</Text>
                                        )}
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Quận/Huyện</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={values.district}
                                                onValueChange={(val) => onDistrictChange(val, setFieldValue)}
                                                style={styles.picker}
                                                enabled={districts.length > 0}
                                            >
                                                <Picker.Item label="Chọn quận/huyện" value="" />
                                                {districts.map((d) => (
                                                    <Picker.Item key={d.code} label={d.name} value={d.name} />
                                                ))}
                                            </Picker>
                                        </View>
                                        {errors.district && touched.district && (
                                            <Text style={styles.errorText}>{errors.district}</Text>
                                        )}
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Xã</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={values.ward}
                                                onValueChange={(val) => setFieldValue("ward", val)}
                                                style={styles.picker}
                                                enabled={wards.length > 0}
                                            >
                                                <Picker.Item label="Chọn xã" value="" />
                                                {wards.map((w) => (
                                                    <Picker.Item key={w.code} label={w.name} value={w.name} />
                                                ))}
                                            </Picker>
                                        </View>
                                        {errors.ward && touched.ward && (
                                            <Text style={styles.errorText}>{errors.ward}</Text>
                                        )}
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Địa chỉ chi tiết</Text>
                                        <TextInput
                                            placeholder="Số nhà, tên đường..."
                                            placeholderTextColor="#9e9e9e"
                                            value={values.detailAddress}
                                            onChangeText={handleChange("detailAddress")}
                                            onBlur={handleBlur("detailAddress")}
                                            multiline
                                            style={[
                                                styles.input,
                                                styles.textArea,
                                                errors.detailAddress && touched.detailAddress && styles.inputError
                                            ]}
                                        />
                                        {errors.detailAddress && touched.detailAddress && (
                                            <Text style={styles.errorText}>{errors.detailAddress}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Thiết lập mặc định */}
                                <View style={styles.section}>
                                    <View style={styles.switchContainer}>
                                        <View style={styles.switchInfo}>
                                            <Text style={styles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
                                            <Text style={styles.switchDescription}>
                                                Địa chỉ này sẽ được sử dụng mặc định khi đặt hàng
                                            </Text>
                                        </View>
                                        <Switch
                                            value={values.isDefault}
                                            onValueChange={(val) => setFieldValue("isDefault", val)}
                                            trackColor={{ false: "#e0e0e0", true: "#424242" }}
                                            thumbColor={values.isDefault ? "#ffffff" : "#f4f3f4"}
                                            ios_backgroundColor="#e0e0e0"
                                        />
                                    </View>
                                </View>

                                <Pressable style={styles.submitButton} onPress={handleSubmit as any}>
                                    <Text style={styles.submitButtonText}>
                                        {mode === "edit" ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 100,
        paddingBottom: 20,
        backgroundColor: "#ffffff",
        borderBottomWidth: 2,
        borderBottomColor: "#f0f0f0",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2c2c2c",
        flex: 1,
        textAlign: "center",
    },
    headerRight: {
        width: 40,
    },
    headerLeft: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c2c2c",
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#424242",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#2c2c2c",
        backgroundColor: "#ffffff",
    },
    inputError: {
        borderColor: "#f44336",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        overflow: "hidden",
    },
    picker: {
        height: 50,
        color: "#2c2c2c",
    },
    errorText: {
        fontSize: 12,
        color: "#f44336",
        marginTop: 4,
    },
    switchContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    switchInfo: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#2c2c2c",
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: 12,
        color: "#757575",
    },
    submitButton: {
        backgroundColor: "#2c2c2c",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});