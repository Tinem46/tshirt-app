
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
    id: string,
    name: string,
   price: number,
    description: string,
    sizes: string[],
    colors: string[],
    image: string,
    likedBy: string[],
    inStock: boolean,
    category: string,
    quantity: number,
    size:string

    liked: boolean,
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
  size: string; // Added size property
  unitPrice: number; // Added unit price property
}


export interface IMenu {
    _id: string;
    restaurant: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    menuItem: IMenuItem[]
}

export interface IMenuItem {
    _id: string;
    menu: string;
    title: string;
    description: string;
    basePrice: number,
    image: string;
    options: {
        title: string;
        description: string;
        additionalPrice: number;
    }[],
    createdAt: Date;
    updatedAt: Date;
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
