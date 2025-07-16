
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

export interface IAddress {
  id?: string;
  receiverName: string;
  phone: string;
  detailAddress: string;
  province: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  subtotalAmount: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  refundAmount: number;
  finalTotal: number;

  status: number;
  paymentStatus: number;

  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  customerNotes?: string;

  estimatedDeliveryDate?: string;
  trackingNumber?: string;
  cancellationReason?: string;

  assignedStaffId?: string;
  couponId?: string;
  shippingMethodId?: string;

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;

  userName?: string;
  assignedStaffName?: string;
  couponCode?: string;
  shippingMethodName?: string;

  orderItems: IOrderItem[];
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  customDesignId?: string;
  productVariantId: string;
  itemName: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  customDesignName?: string;
  variantName?: string;
}

export interface IReviewCreate {
  productId: string;
  orderId: string;
  rating: number;
  content: string;
  images: string[];
}

