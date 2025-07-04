import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL;
const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL;
const backend = Platform.OS === "android" ? URL_ANROID_BACKEND : URL_IOS_BACKEND;

export const api = axios.create({
  baseURL: `${backend}/api/`,
  timeout: 5 * 1000,
});

api.interceptors.request.use(async function (config) {
  const token = await AsyncStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

api.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  if (error?.response?.data) return error?.response?.data;
  return Promise.reject(error);
});
