
export { };
declare global {
    interface IBackendRes<T>{
        error?: string | string[];
        message: string;
        statusCode : number|string;
        data?: T;
    }
}

interface IRegister {
    _id: string;
}


 export interface ILogin {
    user:{
        email: string;
            id: string;
            firstName: string;
            lastName: string;
            gender: string;
            address:string;
            city:string;
            district:string;
            ward:string;
            phoneNumber:string;
           

    }
    access_token:string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  sku?: string;
  images: string[];
  quantity: number;
  categoryId: string;
  categoryName?: string;
  material?: number;
  season?: number;
  // ... các trường khác nếu có
}

export interface IProductVariant {
  id: string;
  productId: string;
  color: number;      // enum ProductColor
  size: number;       // enum ProductSize
  price?: number;
  salePrice?: number;
  variantSku?: string;
  quantity: number;
  imageUrl?: string;
  productName?: string; // Tên sản phẩm nếu cần

}

export interface ICartItem {
    id: string;
  product: IProduct;
  quantity: number;
  size: string; // Added size property
  unitPrice: number; // Added unit price property
  image: string; // Added image property
  name ?: string; // Added name property
  detail ?: {
    imageUrl: string;
    productName: string;
}
}




export interface ICart {
    [key: string]: {
        sum: number;
        quantity: number;
        items: {
            [key: string]: {
                quantity: number;
                data: IMenuItem;
                extra?: {[key: string]: number}
            }
        }
    }
}

export interface IOrderHistory {
    _id: string;
    restaurant: IRestaurant;
    user: string;
    status: string;
    totalPrice: number;
    totalQuantity: number;
    orderTime: Date;
    detail: {
        image: string;
        title: string;
        option: string;
        price: number;
        quantity: number;
    }[]
    createdAt: Date;
    updatedAt: Date;
}

export interface IModelPaginate<T> {
    meta:{
        current: number;
        pageSize: number;
        total: number;
        pages: number;
    }
    results: T[];
}
