import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { currencyFormatter, backEndURL } from "@/app/utils/apiall";
import { APP_COLOR } from "../utils/constant";
import AntDesign from "@expo/vector-icons/AntDesign";

const OrderDetailPage = () => {
  const { detail, restaurantName, status, totalPrice, totalQuantity } =
    useLocalSearchParams();

  const items = JSON.parse(detail as string); // convert from string

  return (
    <Animated.View
      entering={FadeIn}
      style={{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "#00000040",
      }}
    >
      <Pressable
        onPress={() => router.back()}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        entering={SlideInDown}
        style={{
          height: "70%",
          width: "100%",
          backgroundColor: "white",
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          overflow: "hidden",
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chi tiết đơn hàng</Text>
          <AntDesign
            name="close"
            size={22}
            color="gray"
            onPress={() => router.back()}
          />
        </View>

        <View style={{ paddingHorizontal: 15 }}>
          <Text style={styles.restaurant}>{restaurantName}</Text>
          <Text style={styles.status}>Trạng thái: {status}</Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Image
                source={{
                  uri: `${backEndURL()}/images/menu-item/${item.image}`,
                }}
                style={styles.itemImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.option && (
                  <Text style={styles.option}>Tuỳ chọn: {item.option}</Text>
                )}
                <Text style={styles.price}>
                  {currencyFormatter(item.price)} x {item.quantity}
                </Text>
              </View>
            </View>
          )}
        />

        <View style={styles.footer}>
          <Text style={styles.total}>
            Tổng cộng ({totalQuantity} món): {currencyFormatter(+totalPrice)}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  restaurant: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
  status: {
    color: "#666",
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    marginVertical: 8,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
  },
  itemTitle: {
    fontWeight: "bold",
  },
  option: {
    fontSize: 13,
    color: "#777",
  },
  price: {
    color: APP_COLOR.ORANGE,
    marginTop: 2,
  },
  footer: {
    padding: 15,
    borderTopColor: "#eee",
    borderTopWidth: 1,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: APP_COLOR.ORANGE,
  },
});

export default OrderDetailPage;
