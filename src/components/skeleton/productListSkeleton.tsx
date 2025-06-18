import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import { Dimensions, ScrollView } from "react-native";

const { width: sWidth, height: sHeight } = Dimensions.get("window");

const ProductListSkeleton = () => (
  <ScrollView style={{ flex: 1, backgroundColor: "#fff", paddingTop: 90 }}>
    <ContentLoader
      speed={2}
      width={sWidth}
      height={sHeight}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Thanh filter */}
      <Rect x="10" y="10" rx="5" ry="5" width={sWidth - 20} height="40" />
      {/* Tổng sản phẩm */}
      <Rect x="10" y="60" rx="4" ry="4" width={120} height="20" />
      {/* Lưới sản phẩm */}
      {Array.from({ length: 6 }).map((_, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const itemWidth = (sWidth - 30) / 2;
        const itemHeight = 220;

        return (
          <React.Fragment key={index}>
            <Rect
              x={10 + column * (itemWidth + 10)}
              y={100 + row * (itemHeight + 20)}
              rx="5"
              ry="5"
              width={itemWidth}
              height="140"
            />
            <Rect
              x={10 + column * (itemWidth + 10)}
              y={250 + row * (itemHeight + 20)}
              rx="4"
              ry="4"
              width={itemWidth * 0.8}
              height="20"
            />
            <Rect
              x={10 + column * (itemWidth + 10)}
              y={275 + row * (itemHeight + 20)}
              rx="4"
              ry="4"
              width={itemWidth * 0.5}
              height="20"
            />
          </React.Fragment>
        );
      })}
    </ContentLoader>
  </ScrollView>
);

export default ProductListSkeleton;
