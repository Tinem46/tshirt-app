import { ILogin, IModelPaginate, IRestaurant, ITopRestaurant } from "@/app/types/model";
import { api } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const registerApi = (email: string, password: string, firstName: string, lastName:string, gender :boolean) => {
    return api.post<IBackendRes<any>>("Account/register", { email, password , firstName, lastName, gender});
}

export const verifyAPI = (email: string, code: string) => {
    return api.post<IBackendRes<any>>("auth/verify-code", { email, code });
}
export const resendCodeAPI = (email: string) => {
    return api.post<IBackendRes<any>>("auth/verify-email", { email});
}

export const loginAPI = (Email: string, Password: string) => {
    return api.post<IBackendRes<ILogin>>("Account/login", { Email, Password });
};
export const getAccountApi = () => {
    return api.get<IBackendRes<ILogin>>("Account/account");
};
export const updateUserAPI = (id: any, name: string, phone: string) => {
    return api.patch<IBackendRes<ILogin>>(`users`, {
      _id: id, 
      name,
      phone,
    });
  };
export const updatePasswordAPI = (currentPassword:string, newPassword:string) => {
    return api.post<IBackendRes<ILogin>>(`users/password`, {
        currentPassword,
        newPassword,
    });
  };
export const RequestPasswordAPI = (email:string) => {
    return api.post<IBackendRes<ILogin>>(`auth/retry-password`, {
        email,
    });
  };
export const ForgotPasswordAPI = (code:string,email:string,password:string) => {
    return api.post<IBackendRes<ILogin>>(`auth/forgot-password`, {
        email,
        code,
        password,
    });
  };
export const likeRestaurantAPI = (restaurant:string, quantity:number) => {
    return api.post<IBackendRes<ILogin>>(`likes`, {
        restaurant,
        quantity,
    });
  };
export const getFavoriteRestaurantAPI = () => {
    return api.get<IBackendRes<ILogin>>(`likes?current=1&pageSize=10`);
  };
  
  
export const getTopRestaurant = (ref:string) => {
    return api.post<IBackendRes<ITopRestaurant[]>>(`restaurants/${ref}`);    
};
export const getRestaurantById = (id:string) => {
    return api.get<IBackendRes<IRestaurant>>(`restaurants/${id}`,{headers:{delay:3000}});    
};
export const placeOrderAPI = (data: any) => {
    return api.post<IBackendRes<IRestaurant>>(`orders`, {...data})  
};
export const getOrderHistoryAPI = () => {
    return api.get<IBackendRes<IRestaurant>>(`orders`)  
};
export const getRestaurantByName = (name: string) => {
    return api.get<IBackendRes<IModelPaginate<IRestaurant>>>(`restaurants?current=1&pageSize=10&name=/${name}/i`);  
};
export const filterRestaurantAPI = (query: string) => {
    return api.get<IBackendRes<IModelPaginate<IRestaurant>>>(`restaurants?${query}`);  
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

export const processDataRestaurantMenu = (restaurant: IRestaurant | null) => {
    if (!restaurant) return [];
    return restaurant?.menu?.map((menu, index) => {
        return {
            index,
            key: menu._id,
            title: menu.title,
            data: menu.menuItem
        }
    })
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




