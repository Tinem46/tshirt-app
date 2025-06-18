import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { IRestaurant } from "../types/model";
import { backEndURL, filterRestaurantAPI } from "../utils/apiall";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { APP_COLOR } from "../utils/constant";
import { useCurrentApp } from "@/context/app.context";

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const { restaurant } = useCurrentApp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await filterRestaurantAPI(
          `current=${currentPage}&pageSize=${pageSize}`
        );
        if (res.data) {
          setRestaurants([...restaurants, ...res.data.results]); // lấy đúng mảng results
        } else {
          setRestaurants([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (currentPage > 1) {
      fetchData();
    }
  }, [currentPage]); // Update when the page changes

  const handleEndReached = async () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
          padding: 10,
        }}
      >
        <MaterialIcons
          name="arrow-back"
          size={24}
          onPress={() => router.back()}
          color={APP_COLOR.ORANGE}
        />
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Restaurants</Text>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={restaurants}
          onEndReachedThreshold={0.5}
          onEndReached={handleEndReached}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: item._id },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 10,
              }}
            >
              <Image
                source={{
                  uri: `${backEndURL()}/images/restaurant/${item.image}`,
                }}
                style={{ width: 200, height: 200 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.name}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
};
export default RestaurantsPage;
