import LoadingOverlay from "@/components/loading/overlay";
import ProductListSkeleton from "@/components/skeleton/productListSkeleton";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import Card from "../../components/card/card";
import FilterBar from "../../components/filterBar/filterBar";
import { IProductVariant } from "../types/model";
import {
  fetchCategoriesAPI,
  fetchProductsAPI,
  getProductVariantsAPI,
} from "../utils/apiall";

const itemsPerPage = 8;
const defaultFilters = {
  price: undefined,
  type: undefined, // CategoryId
  size: undefined,
  color: undefined,
  order: "",
  season: undefined,
};

const ProductLayout = ({ productType = "", searchKeyword = "" }) => {
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [productsWithVariant, setProductsWithVariant] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const didSetDefaultType = useRef(false);

  // Fetch categories & set default type (id) if productType
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategoriesAPI();
        const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
        setCategories(arr);

        // Set filter.type theo tên truyền vào (vd: T-Shirt)
        if (productType && !didSetDefaultType.current) {
          const found = arr.find(
            (c) =>
              c.name.trim().toLowerCase() === productType.trim().toLowerCase()
          );
          if (found) {
            setFilters((prev) => ({ ...prev, type: found.id }));
            didSetDefaultType.current = true;
          }
        }
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
    // Reset didSetDefaultType mỗi khi đổi productType
    return () => {
      didSetDefaultType.current = false;
    };
  }, [productType]);

  // Khi đổi filter/search, fetch lại trang 1
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(true);
    // eslint-disable-next-line
  }, [filters, searchKeyword]);

  // Build params cho API
  const buildParams = () => {
    let params: any = {
      PageNumber: page,
      PageSize: itemsPerPage,
      SortDirection: filters.order || "",
    };
    if (searchKeyword && searchKeyword.trim())
      params.Name = searchKeyword.trim();
    if (filters.type) params.CategoryId = filters.type;
    if (filters.size) params.Size = filters.size;
    if (filters.season) params.Season = filters.season;

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

  // Fetch products (lọc theo filters.type, chính là id category)
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
            return { ...p, variants };
          } catch (e) {
            return { ...p, variants: [] };
          }
        })
      );

      if (reset) {
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

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchProducts(false);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    setHasMore(true);
  };

  if (loading) return <ProductListSkeleton />;

  return (
    <View style={styles.wrapper}>
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
      />
      <Text style={styles.productCount}>{total} sản phẩm</Text>
      {productsWithVariant.length === 0 ? (
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
          contentContainerStyle={[
            styles.list,
            productsWithVariant.length < 4 && {
              flex: 1,
              alignItems: "center",
              marginBottom: 680,
            },
          ]}
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
  wrapper: { paddingTop: 90, backgroundColor: "#fff", flex: 1 },
  productCount: { fontSize: 15, color: "#444", margin: 14 },
  emptySearch: { flex: 1, alignItems: "center", marginBottom: 700 },
  emptyText: { fontSize: 18, color: "#888", marginTop: 10 },
  list: { paddingBottom: 20 },
});

export default ProductLayout;
