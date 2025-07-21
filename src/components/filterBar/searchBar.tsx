import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) => (
  <View style={styles.container}>
    <Feather name="search" size={18} color="#888" style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder="Tìm kiếm sản phẩm..."
      value={value}
      onChangeText={onChange}
      returnKeyType="search"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 38,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
});

export default SearchBar;
