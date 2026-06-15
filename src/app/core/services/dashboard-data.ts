import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import {
  ApiResponse,
  Currency,
  DashboardSummary,
  OrderAnalytics,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardData {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/dashboard`;

  summary(filters: {
    dateFrom?: string;
    dateTo?: string;
    currency: Currency;
  }): Observable<DashboardSummary> {
    let params = new HttpParams().set('currency', filters.currency);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http
      .get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/summary`, { params })
      .pipe(map((response) => response.data));
  }

  orders(period: string): Observable<OrderAnalytics> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<ApiResponse<OrderAnalytics>>(`${this.baseUrl}/orders`, { params })
      .pipe(map((response) => response.data));
  }
}
