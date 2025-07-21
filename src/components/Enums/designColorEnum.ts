export type BaseColor =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const BaseColorText: Record<BaseColor, string> = {
  0: "black",
  1: "white",
  2: "gray",
  3: "red",
  4: "blue",
  5: "navy",
  6: "green",
  7: "yellow",
  8: "orange",
  9: "purple",
  10: "pink",
  11: "brown",
  12: "beige",
};

export const BaseColorHex: Record<BaseColor, string> = {
  0: "#000000",
  1: "#FFFFFF",
  2: "#808080",
  3: "#FF0000",
  4: "#0000FF",
  5: "#000080",
  6: "#008000",
  7: "#FFFF00",
  8: "#FFA500",
  9: "#800080",
  10: "#FFC0CB",
  11: "#8B4513",
  12: "#F5F5DC",
};

// Hàm lấy tên (nếu không đúng key thì trả về "white")
export function getBaseColorText(value: number): string {
  return BaseColorText[value as BaseColor] || "white";
}

export function getBaseColorHex(value: number): string {
  return BaseColorHex[value as BaseColor] || "#FFFFFF";
}
