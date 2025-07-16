import { api } from "@/config/api";
import { IReviewCreate } from "../types/model";

// 1. Tạo đánh giá mới
export const createReviewAPI = (review: IReviewCreate) => {
  return api.post<IBackendRes<any>>("reviews", review);
};

// // 2. Lấy tất cả đánh giá của một sản phẩm
// export const getProductReviewsAPI = (productId: string) => {
//   return api.get<IBackendRes<IReview[]>>(`reviews/product/${productId}`);
// };

// // 3. Lấy thống kê review của sản phẩm (trung bình sao, số lượng,...)
// export const getReviewSummaryAPI = (productId: string) => {
//   return api.get<IBackendRes<IReviewSummary>>(`reviews/product/${productId}/summary`);
// };

// // 4. Kiểm tra user đã mua hàng và có thể review hay không
// export const canReviewAPI = (userId: string, productId: string) => {
//   return api.get<IBackendRes<boolean>>(`reviews/can-review/${userId}/${productId}`);
// };

// // 5. Đánh dấu hữu ích / không hữu ích
// export const markReviewHelpfulAPI = (reviewId: string, isHelpful: boolean) => {
//   return api.post<IBackendRes<any>>(`reviews/${reviewId}/helpful`, isHelpful, {
//     headers: { "Content-Type": "application/json" }
//   });
// };

// // 6. Lấy các đánh giá của người dùng hiện tại
// export const getMyReviewsAPI = (userId: string) => {
//   return api.get<IBackendRes<IReview[]>>(`reviews/user/${userId}`);
// };
