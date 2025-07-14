import { ILogin } from "@/app/types/model";
import { api } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Đổi lại cho đồng bộ với backend mới:
export const registerApi = (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  gender: number // 0: Nam, 1: Nữ
) => {
  return api.post<IBackendRes<any>>("Auth/register", {
    email,
    password,
    firstName,
    lastName,
    gender,
  });
};
// Xác nhận email từ link, cần userId và token
export const confirmEmailAPI = (userId: string, token: string) => {
  return api.get<IBackendRes<any>>("Auth/confirm-email", {
    params: { userId, token },
  });
};

export const resendConfirmationAPI = (email: string) => {
  return api.post<IBackendRes<any>>("Auth/resend-confirmation", { email });
};



export const loginAPI = (Email: string, Password: string) => {
    return api.post<IBackendRes<ILogin>>("Auth/login", { Email, Password });
};
// Google
export const googleLoginAPI = (tokenId: string) => {
    return api.post<IBackendRes<any>>("Auth/google-login-token", { tokenId });
};

export const getUserInfoAPI = () => {
    return api.get<IBackendRes<any>>("Auth/current-user");}


export const fetchProductsAPI = (params: any) => {
  // "Product" là route backend trả về danh sách sản phẩm
  return api.get<IBackendRes<any>>("Product", { params });
};

export const updatePasswordAPI = (oldPassword: string, newPassword: string, confirmPassword:string) => {
  return api.post<IBackendRes<any>>("Auth/change-password", {
    oldPassword,
    newPassword,
    confirmPassword,
})};

export const getProductDetailAPI = (id: string) => api.get<IBackendRes<any>>(`Product/${id}`);
export const getProductVariantsAPI = (id: string) => api.get<IBackendRes<any>>(`ProductVariant/product/${id}`);
export const addToCartAPI = (
  data: { productVariantId: string | null; quantity: number }[]
) => api.post<IBackendRes<any>>("Cart", data);
export const updateCartItemAPI =  ({
  cartItemId,
  quantity,
}: {
  cartItemId: string;
  quantity: number;
}) => {
  return api.put<IBackendRes<any>>(`Cart/${cartItemId}`, { quantity });
};

// Xóa 1 item khỏi giỏ
export const removeCartItemAPI =  (cartItemId: string[]) => {
  return api.delete<IBackendRes<any>>("Cart", {
        data: cartItemId, // mảng các id đã chọn
        headers: { "Content-Type": "application/json" },
      });;
};
export const getCartAPI =  () => {
  return api.get<IBackendRes<any>>("Cart"); // URL tùy theo backend bạn
};
export const getProductVariantAPI = (variantId: string) =>
  api.get<IBackendRes<any>>(`ProductVariant/${variantId}`);
export const calculateCartTotalAPI = (cartItemIds: string[]) => {
  return api.post<IBackendRes<any>>("Cart/calculate-total", cartItemIds, {
    headers: { "Content-Type": "application/json" },
  });
};
export const getUserAddressesAPI = () => {
  return api.get<IBackendRes<any>>("UserAddress");
};
// Lấy danh sách phương thức giao hàng
export const getShippingMethodsAPI = () => {
  // Đường dẫn API giống web
  return api.get("/admin/shipping-methods");
};// Đặt hàng
export const placeOrderAPI = (payload: any) => {
  return api.post("Orders", payload);
};
export const getOrderDetailAPI = (orderId: string) => {
  return api.get(`Orders/${orderId}`);
};


 export const printAsyncStorage = () => {
    AsyncStorage.getAllKeys((err, keys) => {
        AsyncStorage.multiGet(keys!, (error, stores) => {
            let asyncStorage: any = {}
            stores?.map((result, i, store) => {
                asyncStorage[store[i][0]] = store[i][1]
            });
            console.log(JSON.stringify(asyncStorage, null, 2));
        });
    });
};

export const backEndURL =() =>{
    const URL_ANROID_BACKEND = process.env.EXPO_PUBLIC_ANDROID_API_URL;
    const URL_IOS_BACKEND = process.env.EXPO_PUBLIC_IOS_API_URL;
    const backend =
    Platform.OS === "android" ? URL_ANROID_BACKEND : URL_IOS_BACKEND;
    return backend;
}


export const currencyFormatter = (value: any) => {
    const options = {
        significantDigits: 2,
        thousandsSeparator: '.',
        decimalSeparator: ',',
        symbol: 'vnđ'
    }

    if (typeof value !== 'number') value = 0.0
    value = value.toFixed(options.significantDigits)

    const [currency, decimal] = value.split('.')
    return `${currency.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        options.thousandsSeparator
    )} ${options.symbol}`
}

// mockApi.ts
export const mockLikeProductAPI = async (productId: string, quantity: number) => {
  // Giả lập response delay và kết quả
  return new Promise((resolve) => {
    setTimeout(() => {
      // Giả lập thành công
      resolve({
        data: {
          productId,
          quantity,
          success: true,
        },
        message: "Success",
      });
    }, 500); // 500ms delay giả lập API
  });
};




