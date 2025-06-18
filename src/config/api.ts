import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL;
const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL;

const backend = Platform.OS === "android" ? URL_ANROID_BACKEND : URL_IOS_BACKEND;
//instance of axios
export const api = axios.create({
    baseURL: `${backend}/api/v1/`,
    timeout: 5*1000 //5 seconds
});


// Add a request interceptor
api.interceptors.request.use(async function (config) {
    // Do something before request is sent

    // config.headers["delay"]= 5000;
    config.headers["Authorization"] = `Bearer ${await AsyncStorage.getItem("access_token")}`;
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
api.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if(response.data) return response.data;
    return response;
  }, function (error) {
    if(error?.response?.data) return error?.response?.data;
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });
