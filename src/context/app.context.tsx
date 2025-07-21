import { ICartItem, ILogin, IProduct } from "@/app/types/model";
import React, { createContext, useContext, useState } from "react";

interface AppContextType {
  theme: string;
  setTheme: (v: string) => void;
  appState: ILogin | null;
  setAppState: (v: any) => void;
  cart: ICartItem[];
  setCart: (v: any) => void;
  product: IProduct | null;
  setProduct: (v: IProduct | null) => void;
  buyNowItem: ICartItem | null;
  setBuyNowItem: (item: ICartItem | null) => void;
  savedCoupons: any[];
  setSavedCoupons: (v: any[]) => void;
  checkoutData: {
    userDetails: any;
    cartSummary: any;
    cartId: string | null;
    cart: any[];
  };
  setCheckoutData: (v: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export default AppContext;

interface Iprops {
  children: React.ReactNode;
}

export const useCurrentApp = () => {
  const currentUserContext = useContext(AppContext);
  if (!currentUserContext) {
    throw new Error(
      "useCurrentApp has to be used within <AppProvider.Provider>"
    );
  }
  return currentUserContext;
};

export const AppProvider = (props: Iprops) => {
  const [theme, setTheme] = useState<string>("");
  const [appState, setAppState] = useState<ILogin | null>(null);
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [buyNowItem, setBuyNowItem] = useState<ICartItem | null>(null);
  const [checkoutData, setCheckoutData] = useState({
    userDetails: null,
    cartSummary: null,
    cartId: null,
    cart: [],
  });
  const [savedCoupons, setSavedCoupons] = useState<any[]>([]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        appState,
        setAppState,
        cart,
        setCart,
        product,
        setProduct,
        buyNowItem,
        setBuyNowItem,
        checkoutData,
        setCheckoutData,
        savedCoupons,
        setSavedCoupons,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
