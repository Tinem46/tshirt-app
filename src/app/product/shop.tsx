import LoadingOverlay from "@/components/loading/overlay";
import { useCurrentApp } from "@/context/app.context";
import React, { useEffect, useState } from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Card from "../../components/card/card";
import FilterBar from "../../components/filterBar/filterBar";
import { IProduct } from "../types/model";
import ProductListSkeleton from "@/components/skeleton/productListSkeleton";

type FilterType = {
  price: string | null;
  type: string | null;
  size: string | null;
  color: string | null;
  order: string;
};

const itemsPerPage = 8;
interface ProductLayoutProps {
  productType?: string;
  searchKeyword?: string;
}

const { width: sWidth, height: sHeight } = Dimensions.get("window");

const ProductLayout = (props: ProductLayoutProps) => {
  const { productType = "", searchKeyword = "" } = props;
  const { product, setProduct } = useCurrentApp();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterType>({
    price: null,
    type: null,
    size: null,
    color: null,
    order: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchTotal = async (): Promise<number> => {
    const res = await fetch(
      `https://682f2e5b746f8ca4a4803faf.mockapi.io/product`
    );
    let data: IProduct[] = await res.json();

    if (productType)
      data = data.filter((item) => item.category === productType);

    if (searchKeyword.trim())
      data = data.filter((item) =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );

    return data.length;
  };

  const fetchProducts = async (
    page: number,
    limit: number,
    filters: FilterType,
    searchKeyword: string
  ): Promise<IProduct[]> => {
    const res = await fetch(
      `https://682f2e5b746f8ca4a4803faf.mockapi.io/product?page=${page}&limit=${limit}`
    );
    let data: IProduct[] = await res.json();

    if (product) setProduct(data[0]);

    if (productType)
      data = data.filter((item) => item.category === productType);

    if (searchKeyword.trim())
      data = data.filter((item) =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );

    if (filters.price) {
      data = data.filter((item) => {
        const price = parseInt(item.price.toString().replace(/[^0-9]/g, ""));
        switch (filters.price) {
          case "Giá dưới 100.000đ":
            return price < 100000;
          case "100.000đ - 200.000đ":
            return price >= 100000 && price <= 200000;
          case "200.000đ - 300.000đ":
            return price >= 200000 && price <= 300000;
          case "300.000đ - 500.000đ":
            return price >= 300000 && price <= 500000;
          case "Giá trên 500.000đ":
            return price > 500000;
          default:
            return true;
        }
      });
    }

    if (filters.size)
      data = data.filter(
        (item) => item.sizes && item.sizes.includes(filters.size!)
      );
    if (filters.color)
      data = data.filter(
        (item) => item.colors && item.colors.includes(filters.color!)
      );

    if (filters.order === "asc")
      data = data.sort((a, b) => +a.price - +b.price);
    if (filters.order === "desc")
      data = data.sort((a, b) => +b.price - +a.price);

    return data;
  };

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    const load = async () => {
      const totalCount = await fetchTotal();
      setTotal(totalCount);
      const firstPage = await fetchProducts(
        1,
        itemsPerPage,
        filters,
        searchKeyword
      );
      setProducts(firstPage);
      setHasMore(firstPage.length === itemsPerPage);
      setPage(2);
      setLoading(false);
    };

    load();
  }, [filters, productType, searchKeyword]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const more = await fetchProducts(
      page,
      itemsPerPage,
      filters,
      searchKeyword
    );
    setProducts((prev) => [...prev, ...more]);
    setHasMore(more.length === itemsPerPage);
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

if (loading) {
  return <ProductListSkeleton />;
}

  return (
    <View style={styles.wrapper}>
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      <Text style={styles.productCount}>{total} sản phẩm</Text>
      {products.length === 0 ? (
        <View style={styles.emptySearch}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2748/2748558.png",
            }}
            style={{ width: 150, height: 150, marginTop: 100 }}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card shirt={item} />}
          contentContainerStyle={styles.list}
          numColumns={2}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={loadingMore ? <LoadingOverlay /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingTop: 90, backgroundColor: "#fff" },
  productCount: { fontSize: 15, color: "#444", margin: 14 },
  emptySearch: { flex: 1, alignItems: "center", marginBottom: 650 },
  emptyText: { fontSize: 18, color: "#888", marginTop: 10 },
  list: { paddingBottom: 20 },
});

export default ProductLayout;
