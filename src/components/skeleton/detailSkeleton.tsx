// SkeletonDetailProduct.tsx
import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import { Dimensions, ScrollView } from "react-native";

const { width: sWidth } = Dimensions.get("window");

const SkeletonDetailProduct = () => (
  <ScrollView style={{ flex: 1, backgroundColor: "#fff", marginTop: 50 }}>
    <ContentLoader
      speed={2}
      width={sWidth}
      height={1200}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Ảnh chính */}
      <Rect x="0" y="0" rx="8" ry="8" width={sWidth} height={sWidth} />

      {/* Thumbnails */}
      <Rect x="10" y={sWidth + 25} rx="5" ry="5" width="70" height="70" />
      <Rect x="90" y={sWidth + 25} rx="5" ry="5" width="70" height="70" />
      <Rect x="170" y={sWidth + 25} rx="5" ry="5" width="70" height="70" />

      {/* Tên sản phẩm */}
      <Rect
        x="16"
        y={sWidth + 110}
        rx="4"
        ry="4"
        width={sWidth * 0.8}
        height="28"
      />
      {/* Giá */}
      <Rect x="16" y={sWidth + 148} rx="4" ry="4" width={140} height="20" />

      {/* Số lượng */}
      <Rect x="16" y={sWidth + 180} rx="4" ry="4" width={120} height="20" />
      <Rect x="16" y={sWidth + 210} rx="16" ry="16" width={36} height="36" />
      <Rect x="62" y={sWidth + 210} rx="6" ry="6" width={40} height="36" />
      <Rect x="110" y={sWidth + 210} rx="16" ry="16" width={36} height="36" />

      {/* Size */}
      <Rect x="16" y={sWidth + 265} rx="4" ry="4" width={100} height="20" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Rect
          key={i}
          x={16 + i * 62}
          y={sWidth + 295}
          rx="8"
          ry="8"
          width={54}
          height={36}
        />
      ))}

      {/* 2 nút hành động */}
      <Rect
        x="16"
        y={sWidth + 345}
        rx="8"
        ry="8"
        width={(sWidth - 42) / 2}
        height="46"
      />
      <Rect
        x={26 + (sWidth - 42) / 2}
        y={sWidth + 345}
        rx="8"
        ry="8"
        width={(sWidth - 42) / 2}
        height="46"
      />

      {/* Box giao hàng */}
      <Rect
        x="16"
        y={sWidth + 410}
        rx="10"
        ry="10"
        width={sWidth - 32}
        height="95"
      />

      {/* Chi tiết */}
      <Rect
        x="16"
        y={sWidth + 515}
        rx="8"
        ry="8"
        width={sWidth - 32}
        height="100"
      />
    </ContentLoader>
  </ScrollView>
);

export default SkeletonDetailProduct;
