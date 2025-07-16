export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "customer" | "admin";
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  addresses?: Address[];
}

export interface Address {
  street: string;
  city: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: "customer" | "admin";
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}
