import { router } from "expo-router";

import { useCurrentApp } from "@/context/app.context";
import { useEffect, useState } from "react";
import { getAccountApi } from "./utils/apiall";

import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_FONT } from "./utils/constant";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
const RootPage = () => {
  const { setAppState } = useCurrentApp();
  const [state, setState] = useState<any>();

  const [loaded, error] = Font.useFonts({
    [APP_FONT]: require("@/assets/font/OpenSans-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        const access_token = await AsyncStorage.getItem("access_token");
        if (!access_token) {
          // Không có token -> chưa đăng nhập
          router.replace("/(auth)/welcome");
          await SplashScreen.hideAsync();
          return;
        }
        // Có token -> gọi getAccountApi để xác thực token
        const res = await getAccountApi();
        if (res && res.email) {
          setAppState({
            user: res,
            access_token,
          });
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/welcome");
        }
      } catch (e) {
        console.warn(e);
        setState(() => {
          throw new Error("Không thể kết nối tới backend");
        });
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // if(true){
  //   return(
  //     <Redirect href={"/(tabs)"} />
  //   )
  // }
};

export default RootPage;
