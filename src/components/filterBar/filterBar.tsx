import { Picker } from "@react-native-picker/picker";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

// Chú ý: Các option đầu là ""
const filterOptions = {
  price: [
    "",
    "Giá dưới 100.000đ",
    "100.000đ - 200.000đ",
    "200.000đ - 300.000đ",
    "300.000đ - 500.000đ",
    "Giá trên 500.000đ",
  ],
  type: ["", "Áo thun", "Áo sơ mi", "Áo khoác", "Áo hoodie"],
  size: ["", "S", "M", "L", "XL"],
  color: ["", "Đen", "Trắng", "Xanh", "Đỏ", "Vàng"],
  order: ["", "Giá tăng dần", "Giá giảm dần"],
};

// Label mặc định của mỗi filter pill
const getLabel = (type, value) => {
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
      default:
        return "";
    }
  }
  // Riêng order
  if (type === "order") {
    if (value === "asc") return "Giá tăng dần";
    if (value === "desc") return "Giá giảm dần";
  }
  return value;
};

// Giá trị thực tế của order
const getOrderValue = (label) => {
  if (label === "Giá tăng dần") return "asc";
  if (label === "Giá giảm dần") return "desc";
  return "";
};

const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <ScrollView
      style={styles.filterBar}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: "center" }}
    >
      {/* Mức giá */}
      <View style={styles.pill}>
        <Icon name="filter" style={styles.pillIconLeft} />
        <Text
          style={[
            styles.pillText,
            filters.price && filters.price !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("price", filters.price)}
        </Text>
        <Picker
          selectedValue={filters.price || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("price", value)}
        >
          {filterOptions.price.map((option, idx) => (
            <Picker.Item
              key={option || "all"}
              label={option === "" ? "Mức giá" : option}
              value={option}
            />
          ))}
        </Picker>
        <Icon name="chevron-down" style={styles.pillIconRight} />
      </View>

      {/* Kích cỡ */}
      <View style={styles.pill}>
        <Text
          style={[
            styles.pillText,
            filters.size && filters.size !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("size", filters.size)}
        </Text>
        <Picker
          selectedValue={filters.size || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("size", value)}
        >
          {filterOptions.size.map((option) => (
            <Picker.Item
              key={option || "all"}
              label={option === "" ? "Kích cỡ" : option}
              value={option}
            />
          ))}
        </Picker>
        <Icon name="chevron-down" style={styles.pillIconRight} />
      </View>

      {/* Màu sắc */}
      <View style={styles.pill}>
        <Text
          style={[
            styles.pillText,
            filters.color && filters.color !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("color", filters.color)}
        </Text>
        <Picker
          selectedValue={filters.color || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("color", value)}
        >
          {filterOptions.color.map((option) => (
            <Picker.Item
              key={option || "all"}
              label={option === "" ? "Màu sắc" : option}
              value={option}
            />
          ))}
        </Picker>
        <Icon name="chevron-down" style={styles.pillIconRight} />
      </View>

      {/* Loại áo */}
      <View style={styles.pill}>
        <Text
          style={[
            styles.pillText,
            filters.type && filters.type !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("type", filters.type)}
        </Text>
        <Picker
          selectedValue={filters.type || ""}
          style={styles.picker}
          onValueChange={(value) => onFilterChange("type", value)}
        >
          {filterOptions.type.map((option) => (
            <Picker.Item
              key={option || "all"}
              label={option === "" ? "Loại áo" : option}
              value={option}
            />
          ))}
        </Picker>
        <Icon name="chevron-down" style={styles.pillIconRight} />
      </View>

      {/* Sắp xếp */}
      <View style={styles.pill}>
        <Icon name="arrow-down" style={styles.pillIconLeft} />
        <Text
          style={[
            styles.pillText,
            filters.order && filters.order !== "" && styles.pillTextSelected,
          ]}
        >
          {getLabel("order", filters.order)}
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
        <Icon name="chevron-down" style={styles.pillIconRight} />
      </View>
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
  pillIconLeft: {
    fontSize: 16,
    color: "#222",
    marginRight: 5,
  },
  pillIconRight: {
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
});

export default FilterBar;
