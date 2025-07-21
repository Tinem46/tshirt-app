import { api } from "@/config/api"
import { IOrder } from "../types/model";

export const getMyOrdersAPI = () => {
    return api.get<IBackendRes<IOrder[]>>("Orders/my-orders");
};


export const confirmDeliveredAPI = (orderId: string) => {
    return api.put<IBackendRes<any>>("Orders/batch/confirm-delivered", [orderId], {
        headers: { "Content-Type": "application/json" },
    });
}

export const CancelOrderAPI = (orderId: string, reason: string) => {
    return api.patch<IBackendRes<any>>(`/Orders/${orderId}/cancel`, {
        reason: reason,
    });
};
