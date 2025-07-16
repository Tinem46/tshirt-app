const BASE = "https://provinces.open-api.vn/api";

export const getProvinces = async () => {
  const res = await fetch(`${BASE}/p`);
  return res.json(); // Trả về JSON object
};

export const getDistrictsByProvince = async (code: string) => {
  const res = await fetch(`${BASE}/p/${code}?depth=2`);
  return res.json();
};

export const getWardsByDistrict = async (code: string) => {
  const res = await fetch(`${BASE}/d/${code}?depth=2`);
  return res.json();
};
