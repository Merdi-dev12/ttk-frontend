import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../environments/environment';
import {
  AdminProduct,
  AdminService,
  ApiResponse,
  ApiUser,
  CatalogStatus,
  CreateFieldPayload,
  CreateProductPayload,
  CreateServicePayload,
  Pagination,
  ServiceType,
  UserStatus
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listServices(filters: { page?: number; limit?: number; status?: CatalogStatus; type?: ServiceType } = {}): Observable<{ items: AdminService[]; pagination: Pagination }> {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('limit', filters.limit ?? 100);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type) params = params.set('type', filters.type);

    return this.http.get<ApiResponse<{ items: AdminService[]; pagination: Pagination }>>(
      `${this.baseUrl}/catalog/admin/services`,
      { params }
    ).pipe(map((response) => response.data));
  }

  createService(payload: CreateServicePayload, fields: CreateFieldPayload[] = []): Observable<AdminService> {
    return this.http.post<ApiResponse<{ service: AdminService }>>(
      `${this.baseUrl}/catalog/admin/services`,
      payload
    ).pipe(
      map((response) => response.data.service),
      switchMap((service) => {
        if (service.type !== 'FORM' || fields.length === 0) return of(service);
        return forkJoin(fields.map((field) => this.createField(service.id, field))).pipe(map(() => service));
      })
    );
  }

  updateServiceStatus(serviceId: string, status: CatalogStatus): Observable<AdminService> {
    return this.http.patch<ApiResponse<{ service: AdminService }>>(
      `${this.baseUrl}/catalog/admin/services/${serviceId}/status`,
      { status }
    ).pipe(map((response) => response.data.service));
  }

  createField(serviceId: string, payload: CreateFieldPayload): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/catalog/admin/services/${serviceId}/fields`,
      payload
    );
  }

  listProducts(serviceId: string): Observable<AdminProduct[]> {
    const params = new HttpParams().set('page', 1).set('limit', 100);
    return this.http.get<ApiResponse<{ items: AdminProduct[]; pagination: Pagination }>>(
      `${this.baseUrl}/catalog/admin/services/${serviceId}/products`,
      { params }
    ).pipe(map((response) => response.data.items));
  }

  listAllProducts(services: AdminService[]): Observable<AdminProduct[]> {
    const productServices = services.filter((service) => service.type === 'PRODUCTS');
    if (productServices.length === 0) return of([]);
    return forkJoin(productServices.map((service) => this.listProducts(service.id))).pipe(
      map((groups) => groups.flat())
    );
  }

  createProduct(serviceId: string, payload: CreateProductPayload): Observable<AdminProduct> {
    return this.http.post<ApiResponse<{ product: AdminProduct }>>(
      `${this.baseUrl}/catalog/admin/services/${serviceId}/products`,
      payload
    ).pipe(map((response) => response.data.product));
  }

  updateProductStatus(productId: string, status: CatalogStatus): Observable<AdminProduct> {
    return this.http.patch<ApiResponse<{ product: AdminProduct }>>(
      `${this.baseUrl}/catalog/admin/products/${productId}/status`,
      { status }
    ).pipe(map((response) => response.data.product));
  }

  listUsers(filters: { page?: number; limit?: number; status?: UserStatus; search?: string } = {}): Observable<{ items: ApiUser[]; pagination: Pagination }> {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('limit', filters.limit ?? 100);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);

    return this.http.get<ApiResponse<{ items: ApiUser[]; pagination: Pagination }>>(
      `${this.baseUrl}/users/admin`,
      { params }
    ).pipe(map((response) => response.data));
  }

  updateUserStatus(userId: string, status: UserStatus): Observable<ApiUser> {
    return this.http.patch<ApiResponse<{ user: ApiUser }>>(
      `${this.baseUrl}/users/admin/${userId}/status`,
      { status }
    ).pipe(map((response) => response.data.user));
  }
}
