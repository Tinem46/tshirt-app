import { api } from "@/config/api"
import { IOrder } from "../types/model";

export const getMyOrdersAPI = () => {
    return api.get<IBackendRes<IOrder[]>>("Orders/my-orders");
};

export const cancelOrderAPI = (orderId: string) => {
    return api.post<IBackendRes<any>>(`Orders/${orderId}/status`, {
        status: 6,
        reason: "Khách hàng hủy",
    });
}

export const confirmDeliveredAPI = (orderId: string) => {
    return api.post<IBackendRes<any>>("Orders/batch/confirm-delivered", [orderId], {
        headers: { "Content-Type": "application/json" },
    });
}