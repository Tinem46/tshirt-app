export type ShirtSize = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const ShirtSizeText: Record<ShirtSize, string> = {
  0: "XS",
  1: "S",
  2: "M",
  3: "L",
  4: "XL",
  5: "XXL",
  6: "XXXL",
};

export function getSizeText(value: number): string {
  return ShirtSizeText[value as ShirtSize] || "M";
}
