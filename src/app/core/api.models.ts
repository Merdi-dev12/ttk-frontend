export type CatalogStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type ServiceType = 'PRODUCTS' | 'FORM';
export type UserStatus = 'ACTIVE' | 'REVOKED';
export type Currency = 'USD' | 'CDF';
export type Availability = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_REQUEST';
export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'FILE' | 'TEXTAREA' | 'PHONE';

export interface ApiUser {
  id: string;
  nom: string;
  postnom: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
  status: UserStatus;
  created_at: string;
}

export interface AdminService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  type: ServiceType;
  status: CatalogStatus;
  created_at: string;
  updated_at: string;
  fields?: FormField[];
}

export interface FormField {
  id: string;
  service_id: string;
  technical_name: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options: string[] | null;
  display_order: number;
}

export interface ProductImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
  is_primary?: boolean;
  displayOrder?: number;
  display_order?: number;
}

export interface ProductModality {
  id?: string;
  label: string;
  price: number;
  oldPrice?: number | null;
  old_price?: number | null;
  currency: Currency;
  availability: Availability;
  additionalAttributes?: Record<string, unknown> | null;
  additional_attributes?: Record<string, unknown> | null;
}

export interface AdminProduct {
  id: string;
  service_id: string;
  name: string;
  slug: string;
  description: string | null;
  admin_note: string | null;
  status: CatalogStatus;
  images: ProductImage[];
  modalities: ProductModality[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  status: 'success';
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
}

export interface LoginResponseData {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  imageUrl?: string;
  type: ServiceType;
}

export interface CreateFieldPayload {
  technicalName: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  options?: string[];
  displayOrder: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  adminNote?: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
    displayOrder: number;
  }>;
  modalities: Array<{
    label: string;
    price: number;
    currency: Currency;
    availability: Availability;
    additionalAttributes?: Record<string, unknown>;
  }>;
}
