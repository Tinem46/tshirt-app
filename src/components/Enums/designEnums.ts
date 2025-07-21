// Enum CustomDesignStatus khớp backend
export enum CustomDesignStatus {
  Draft = 0,
  Liked = 1,
  Accepted = 2,
  Request = 3,
  Order = 4,
  Shipping = 5,
  Delivered = 6,
  Done = 7,
  Rejected = 8,
}

// Label mapping + color (tuỳ mục đích hiển thị)
export const CustomDesignStatusLabel: Record<CustomDesignStatus, string> = {
  [CustomDesignStatus.Draft]: "Bản nháp",
  [CustomDesignStatus.Liked]: "Yêu thích",
  [CustomDesignStatus.Accepted]: "Đã duyệt",
  [CustomDesignStatus.Request]: "Chờ duyệt",
  [CustomDesignStatus.Order]: "Đã đặt hàng",
  [CustomDesignStatus.Shipping]: "Đang giao hàng",
  [CustomDesignStatus.Delivered]: "Đã giao",
  [CustomDesignStatus.Done]: "Hoàn thành",
  [CustomDesignStatus.Rejected]: "Từ chối",
};

export const CustomDesignStatusColor: Record<CustomDesignStatus, string> = {
  [CustomDesignStatus.Draft]: "#888",
  [CustomDesignStatus.Liked]: "#e63946",
  [CustomDesignStatus.Accepted]: "#2ecc71",
  [CustomDesignStatus.Request]: "#f7b731",
  [CustomDesignStatus.Order]: "#3498db",
  [CustomDesignStatus.Shipping]: "#f39c12",
  [CustomDesignStatus.Delivered]: "#27ae60",
  [CustomDesignStatus.Done]: "#333",
  [CustomDesignStatus.Rejected]: "#d7263d",
};
