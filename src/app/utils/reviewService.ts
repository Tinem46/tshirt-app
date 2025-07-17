import { api } from "@/config/api";
import { IReviewCreate } from "../types/model";

// 1. Tạo đánh giá mới
export const createReviewAPI = (review: IReviewCreate) => {
  return api.post<IBackendRes<any>>("reviews", review);
};

export const getReviewByUserId = (userId: string) => {
  return api.get<IBackendRes<any>>("reviews", { params: { UserId: userId } });
};
export const getReviewsByVariantId = (variantId: string) => {
  return api.get<IBackendRes<any>>(`reviews/product-by-variant/${variantId}`);
};