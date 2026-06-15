import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminSettings, ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AdminSettingsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/settings`;

  get(): Observable<AdminSettings> {
    return this.http
      .get<ApiResponse<{ settings: AdminSettings }>>(this.baseUrl)
      .pipe(map((response) => response.data.settings));
  }

  update(section: keyof AdminSettings, value: AdminSettings[keyof AdminSettings]): Observable<AdminSettings> {
    return this.http
      .patch<ApiResponse<{ settings: AdminSettings }>>(
        `${this.baseUrl}/${section}`,
        value,
      )
      .pipe(map((response) => response.data.settings));
  }

  sendTestEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/notifications/test-email`, { email });
  }

  clearCache(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/maintenance/clear-cache`, {});
  }
}
