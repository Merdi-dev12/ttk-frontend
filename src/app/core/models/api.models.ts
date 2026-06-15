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

export interface StorageBucket {
  id: string;
  name: string;
  slug: string;
  is_public: boolean;
  objects_count?: number;
  created_at: string;
}

export interface StorageObject {
  id: string;
  bucket_id: string;
  name: string;
  object_key: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface DashboardSummary {
  services: { total: number; active: number; suspended: number };
  products: { total: number; active: number; suspended: number; deleted: number };
  users: { total: number; active: number; revoked: number; new: number };
  orders: { total: number; pending: number; completed: number } | null;
  payments: { total: number; revenue: number; failed: number } | null;
  submissions: { total: number; pending: number } | null;
  series: DashboardSeriesPoint[];
  currency: Currency;
  unavailableDomains: string[];
}

export interface DashboardSeriesPoint {
  date: string;
  users?: number;
  services?: number;
  products?: number;
  orders?: number;
  revenue?: number;
}

export interface OrderAnalytics {
  period: string;
  total: number;
  successful: number;
  rejected: number;
  points: Array<{
    label: string;
    successful: number;
    rejected: number;
  }>;
}

export interface AdminSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    defaultCurrency: Currency;
    timezone: string;
    maintenanceMode: boolean;
  };
  catalog: {
    autoPublishServices: boolean;
    autoPublishProducts: boolean;
    lowStockThreshold: number;
    allowOutOfStockOrders: boolean;
  };
  orders: {
    referencePrefix: string;
    cancellationDelayMinutes: number;
    autoCancelUnpaid: boolean;
    requireAdminConfirmation: boolean;
  };
  payments: {
    enabledCurrencies: Currency[];
    paymentTimeoutMinutes: number;
    manualVerification: boolean;
  };
  notifications: {
    adminEmail: string;
    notifyNewOrder: boolean;
    notifyNewSubmission: boolean;
    notifyPaymentFailure: boolean;
    dailyDigest: boolean;
  };
  security: {
    sessionIdleMinutes: number;
    maxLoginAttempts: number;
    requireTwoFactor: boolean;
    allowedAdminIps: string[];
  };
  storage: {
    maxImageSizeMb: number;
    allowedImageTypes: string[];
    imageQuality: number;
    generateWebp: boolean;
  };
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
