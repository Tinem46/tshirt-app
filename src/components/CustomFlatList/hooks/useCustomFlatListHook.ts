import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";

type ICustomFlatListStyles = {
  header: StyleProp<ViewStyle>;
  stickyElement: StyleProp<ViewStyle>;
  topElement: StyleProp<ViewStyle>;
};

type TUseCustomFlatListHook = [
  Animated.Value,
  ICustomFlatListStyles,
  (event: LayoutChangeEvent) => void,
  (event: LayoutChangeEvent) => void,
  (event: LayoutChangeEvent) => void
];

const window = Dimensions.get("window");

export const useCustomFlatListHook = (): TUseCustomFlatListHook => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [heights, setHeights] = useState({
    header: 0,
    sticky: 0,
    topList: 0,
  });

  const styles: ICustomFlatListStyles = {
    header: {
      marginBottom: heights.sticky + heights.topList,
    },
    stickyElement: {
      left: 0,
      marginTop: heights.header,
      position: "absolute",
      right: 0,
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [-window.height, heights.header],
            outputRange: [window.height, -heights.header],
            extrapolate: "clamp",
          }),
        },
      ],
      zIndex: 2,
    },
    topElement: {
      left: 0,
      marginTop: heights.header + heights.sticky,
      position: "absolute",
      right: 0,
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [
              -window.height,
              heights.header + heights.sticky + heights.topList,
            ],
            outputRange: [
              window.height,
              -(heights.header + heights.sticky + heights.topList),
            ],
            extrapolate: "clamp",
          }),
        },
      ],
      zIndex: 1,
    },
  };

  const onLayoutHeaderElement = (event: LayoutChangeEvent): void => {
    const { height } = event.nativeEvent.layout;
    setHeights((prev) => ({ ...prev, header: height }));
  };

  const onLayoutTopListElement = (event: LayoutChangeEvent): void => {
    const { height } = event.nativeEvent.layout;
    setHeights((prev) => ({ ...prev, topList: height }));
  };

  const onLayoutTopStickyElement = (event: LayoutChangeEvent): void => {
    const { height } = event.nativeEvent.layout;
    setHeights((prev) => ({ ...prev, sticky: height }));
  };

  return [
    scrollY,
    styles,
    onLayoutHeaderElement,
    onLayoutTopListElement,
    onLayoutTopStickyElement,
  ];
};
