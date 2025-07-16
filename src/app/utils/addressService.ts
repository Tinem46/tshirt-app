import { IAddress } from "@/app/types/model";
import { api } from "@/config/api";

// Không import IBackendRes

export const getUserAddress = () => {
  return api.get< IBackendRes<IAddress[]> >("UserAddress");
};

export const createAddress = (data: IAddress) => {
  return api.post< IBackendRes<any> >("UserAddress", data);
};

export const updateAddress = (id: string, data: IAddress) => {
  return api.put< IBackendRes<any> >(`UserAddress/${id}`, data);
};

export const deleteAddress = (id: string) => {
  return api.delete< IBackendRes<any> >(`UserAddress/${id}`);
};

export const setDefaultAddress = (id: string) => {
  return api.post< IBackendRes<any> >(`UserAddress/SetDefault/${id}`);
};
