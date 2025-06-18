import { ICartItem, ILogin, IProduct } from "@/app/types/model";
import React, { createContext, useContext, useState } from "react";

interface AppContextType {
  theme: string;
  setTheme: (v: string) => void;
  appState: ILogin | null;
  setAppState: (v: any) => void;
  cart: ICartItem[];
  setCart: (v: any) => void;
  likeUpdated: boolean;
  setLikeUpdated: (v: boolean) => void;
  product: IProduct | null;
  setProduct: (v: IProduct | null) => void;
  likedProductIds: string[];
  setLikedProductIds: (ids: string[]) => void;
  buyNowItem: ICartItem | null;
  setBuyNowItem: (item: ICartItem | null) => void;
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

  const [likeUpdated, setLikeUpdated] = useState<boolean>(false);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [likedProductIds, setLikedProductIdsState] = useState<string[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<ICartItem | null>(null);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        appState,
        setAppState,
        cart,
        setCart,
        likeUpdated,
        setLikeUpdated,
        product,
        setProduct,
        likedProductIds,
        setLikedProductIds: setLikedProductIdsState,
        buyNowItem,
        setBuyNowItem,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
