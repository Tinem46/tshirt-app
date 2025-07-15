import LoadingOverlay from "@/components/loading/overlay";
import ProductListSkeleton from "@/components/skeleton/productListSkeleton";
import { useCurrentApp } from "@/context/app.context";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import Card from "../../components/card/card";
import FilterBar from "../../components/filterBar/filterBar";
import { IProduct, IProductVariant } from "../types/model";
import { fetchProductsAPI, getProductVariantsAPI } from "../utils/apiall";

const itemsPerPage = 8;
const defaultFilters = {
  price: null,
  type: null,
  size: null,
  color: null,
  order: "",
};

const ProductLayout = ({ productType = "", searchKeyword = "" }) => {
  // const { product, setProduct } = useCurrentApp();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [productsWithVariant, setProductsWithVariant] = useState<any[]>([]);

  // Xây dựng params gửi lên API dựa trên filter và search (giống web)
  const buildParams = () => {
    let params: any = {
      PageNumber: page,
      PageSize: itemsPerPage,
      SortDirection: filters.order || "",
    };
    if (searchKeyword && searchKeyword.trim())
      params.Name = searchKeyword.trim();
    if (productType) params.CategoryId = productType;
    if (filters.type) params.CategoryId = filters.type;
    if (filters.size) params.Size = filters.size;
    if (filters.color) params.Color = filters.color;

    // Lọc giá
    if (filters.price) {
      switch (filters.price) {
        case "Giá dưới 100.000đ":
          params.MaxPrice = 100000;
          break;
        case "100.000đ - 200.000đ":
          params.MinPrice = 100000;
          params.MaxPrice = 200000;
          break;
        case "200.000đ - 300.000đ":
          params.MinPrice = 200000;
          params.MaxPrice = 300000;
          break;
        case "300.000đ - 500.000đ":
          params.MinPrice = 300000;
          params.MaxPrice = 500000;
          break;
        case "Giá trên 500.000đ":
          params.MinPrice = 500000;
          break;
        default:
          break;
      }
    }
    return params;
  };

  const fetchProducts = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const params = buildParams();
      const response = await fetchProductsAPI(params);

      const data = response?.data?.data || [];
      const totalCount = response?.data?.totalCount || 0;

      const withVariant = await Promise.all(
        data.map(async (p: IProductVariant) => {
          try {
            const res = await getProductVariantsAPI(p.id);
            const variants = res.data || [];
            return { ...p, variants }; // truyền mảng
          } catch (e) {
            return { ...p, variants: [] };
          }
        })
      );

      if (reset) {
        setProducts(withVariant);
        setProductsWithVariant(withVariant);
        setPage(2);
      } else {
        setProductsWithVariant((prev) => [...prev, ...withVariant]);
        setPage((prev) => prev + 1);
      }
      setTotal(totalCount);
      setHasMore(data.length === itemsPerPage);
    } catch (error) {
      setProductsWithVariant([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Khi filter/search/productType đổi, fetch lại trang 1
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(true);
  }, [filters, productType, searchKeyword]);

  // Load thêm
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(false);
    }
  };

  // Khi đổi filter bar
  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    setHasMore(true);
  };

  if (loading) return <ProductListSkeleton />;

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
          data={productsWithVariant}
          keyExtractor={(item, idx) =>
            item.id ? `${item.id}_${idx}` : `${idx}`
          }
          renderItem={({ item }) => (
            <Card shirt={item} variants={item.variants} />
          )}
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
