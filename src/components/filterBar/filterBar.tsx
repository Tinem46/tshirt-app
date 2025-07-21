import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Import TouchableOpacity

// Các option cố định cho các filter khác ngoài loại áo
const filterOptions = {
  price: [
    "",
    "Giá dưới 100.000đ",
    "100.000đ - 200.000đ",
    "200.000đ - 300.000đ",
    "300.000đ - 500.000đ",
    "Giá trên 500.000đ",
  ],
  size: ["", "S", "M", "L", "XL"],
  season: [
    { label: "", value: "" },
    { label: "Xuân", value: "Spring" },
    { label: "Hè", value: "Summer" },
    { label: "Thu", value: "Autumn" },
    { label: "Đông", value: "Winter" },
    { label: "Tất cả mùa", value: "AllSeason" },
  ],
  // 'order' options are handled directly in the Picker for clarity
};

const getLabel = (
  type: string,
  value: string,
  categories?: { id: string; name: string }[]
) => {
  if (!value || value === "") {
    switch (type) {
      case "price":
        return "Mức giá";
      case "size":
        return "Kích cỡ";
      case "color":
        return "Màu sắc";
      case "type":
        return "Loại áo";
      case "order":
        return "Sắp xếp theo";
      case "season": // Added season label
        return "Mùa";
      default:
        return "";
    }
  }
  if (type === "type" && categories) {
    const found = categories.find((c) => c.id === value);
    return found ? found.name : "Loại áo";
  }
  if (type === "order") {
    if (value === "asc") return "Giá tăng dần";
    if (value === "desc") return "Giá giảm dần";
  }
  // For season, find the label from filterOptions.season
  if (type === "season") {
    const found = filterOptions.season.find((s) => s.value === value);
    return found ? found.label : "Mùa";
  }
  return value;
};

type FilterBarProps = {
  filters: {
    price?: string;
    size?: string;
    color?: string;
    type?: string;
    order?: string;
    season?: string; // Added season to filters type
    [key: string]: any;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void; // New prop for clearing filters
  categories?: { id: string; name: string }[];
};

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters, // Destructure new prop
  categories = [],
}) => {
  // Check if any filter is active to show/hide the clear button
  const isAnyFilterActive = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <ScrollView
      style={styles.filterBar}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: "center" }}
    >
      {/* Giá */}
      <View style={styles.pill}>
        <Feather name="filter" style={styles.pillFeatherLeft} />
        <Text
          style={[
            styles.pillText,
            filters.price && filters.price !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("price", filters.price || "")}
        </Text>
        <Picker
          selectedValue={filters.price || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("price", value)}
        >
          {filterOptions.price.map((option, idx) => (
            <Picker.Item
              key={option || `price-all-${idx}`}
              label={option === "" ? "Mức giá" : option}
              value={option}
            />
          ))}
        </Picker>
        <Feather name="chevron-down" style={styles.pillFeatherRight} />
      </View>

      {/* Mùa */}
      <View style={styles.pill}>
        <Text
          style={[
            styles.pillText,
            filters.season && filters.season !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("season", filters.season || "")}
        </Text>
        <Picker
          selectedValue={filters.season || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("season", value)}
        >
          {filterOptions.season.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label === "" ? "Mùa" : option.label}
              value={option.value}
            />
          ))}
        </Picker>
        <Feather name="chevron-down" style={styles.pillFeatherRight} />
      </View>

      {/* Loại áo (dynamic từ API) */}
      <View style={styles.pill}>
        <Text
          style={[
            styles.pillText,
            filters.type && filters.type !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("type", filters.type || "", categories)}
        </Text>
        <Picker
          selectedValue={filters.type || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("type", value)}
        >
          <Picker.Item label="Loại áo" value="" />
          {(Array.isArray(categories) ? categories : []).map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
        <Feather name="chevron-down" style={styles.pillFeatherRight} />
      </View>

      {/* Sắp xếp */}
      <View style={styles.pill}>
        <Feather name="arrow-down" style={styles.pillFeatherLeft} />
        <Text
          style={[
            styles.pillText,
            filters.order && filters.order !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("order", filters.order || "")}
        </Text>
        <Picker
          selectedValue={filters.order || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("order", value)}
        >
          <Picker.Item label="Sắp xếp theo" value="" />
          <Picker.Item label="Giá tăng dần" value="asc" />
          <Picker.Item label="Giá giảm dần" value="desc" />
        </Picker>
        <Feather name="chevron-down" style={styles.pillFeatherRight} />
      </View>

      {/* Nút Xóa bộ lọc */}
      {isAnyFilterActive && ( // Only show if any filter is active
        <TouchableOpacity onPress={onClearFilters} style={styles.clearButton}>
          <Feather name="x-circle" style={styles.clearButtonIcon} />
          <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderColor: "#efefef",
    paddingLeft: 8,
    marginBottom: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 90,
    height: 38,
    elevation: 2,
    shadowColor: "#222",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    position: "relative",
  },
  pillText: {
    fontSize: 15,
    color: "#aaa",
    fontWeight: "400",
    flex: 1,
    textAlign: "left",
    marginRight: 7,
  },
  pillTextSelected: {
    color: "#222",
    fontWeight: "bold",
  },
  pillFeatherLeft: {
    fontSize: 16,
    color: "#222",
    marginRight: 5,
  },
  pillFeatherRight: {
    fontSize: 18,
    color: "#222",
    marginLeft: 2,
  },
  picker: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    left: 0,
    top: 0,
    zIndex: 10,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0", // Light gray background
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginRight: 8,
    height: 38,
    elevation: 2,
    shadowColor: "#222",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  clearButtonIcon: {
    fontSize: 16,
    color: "#888",
    marginRight: 5,
  },
  clearButtonText: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
});

export default FilterBar;
