
    export { };
declare global {
    interface IBackendRes<T>{
        error?: string | string[];
        message: string;
        statusCode : number|string;
        data?: T;
        results?: T[];
        totalCount?: number;
        messages?: string[];
        items?: any;
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
export interface  IProductVariant{
    id: string;
    productId: string;
    name: string;
    price: number;
    size: number;
    color: number;
    imageUrl: string;
    quantity: number;
    variantSku: string;
    priceAdjustment: number;
    isActive: boolean;
    productName: string;
}

export interface ICartItem {
  id?: string;                    // ID cart item (key để render, gọi API)
  productId?: string;             // Mã sản phẩm (bắt buộc khi gọi order)
  productVariantId?: string;      // Mã variant (size, color)
  name?: string;                  // Tên sản phẩm
  image?: string;                 // Ảnh sp
  unitPrice: number;              // Giá từng item
  quantity: number;               // Số lượng

  selectedColor?: string;         // Màu đã chọn
  selectedSize?: string;          // Size đã chọn
  size?: string;                  // Có thể có, nhưng selectedSize dùng chuẩn hơn
  color?: string;                 // Có thể có, nhưng selectedColor dùng chuẩn hơn

  detail?: any;                   // Dữ liệu phụ, có thể là ProductVariant
  product?: IProduct;             // Đối tượng sản phẩm nếu cần dùng lại (tùy bạn)
  [key: string]: any;             // Đảm bảo không lỗi key khác
}


export interface ICoupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: number; // 0 = phần trăm, 1 = số tiền, hoặc enum nếu có
  value: number;
  minOrderAmount?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
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
  imageUrl?: string; 
}

export interface IReviewCreate {
  productVariantId: string;
  orderId: string;
  rating: number;
  content: string;
  images: string[];
}

export interface IReviewUpdate {
  rating: number;
  content: string;
  images: string[];
}

