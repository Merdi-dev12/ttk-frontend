import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import {
  ApiResponse,
  StorageBucket,
  StorageObject,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class StorageApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/storage/admin`;

  listBuckets(): Observable<StorageBucket[]> {
    return this.http
      .get<ApiResponse<{ buckets: StorageBucket[] }>>(`${this.baseUrl}/buckets`)
      .pipe(map((response) => response.data.buckets));
  }

  createBucket(name: string): Observable<StorageBucket> {
    return this.http
      .post<ApiResponse<{ bucket: StorageBucket }>>(`${this.baseUrl}/buckets`, {
        name,
        public: true,
      })
      .pipe(map((response) => response.data.bucket));
  }

  listObjects(bucketId: string): Observable<StorageObject[]> {
    return this.http
      .get<ApiResponse<{ items: StorageObject[] }>>(
        `${this.baseUrl}/buckets/${bucketId}/objects`,
      )
      .pipe(map((response) => response.data.items));
  }

  upload(bucketId: string, file: File): Observable<StorageObject> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiResponse<{ object: StorageObject }>>(
        `${this.baseUrl}/buckets/${bucketId}/objects`,
        formData,
      )
      .pipe(map((response) => response.data.object));
  }

  deleteObject(bucketId: string, objectId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/buckets/${bucketId}/objects/${objectId}`,
    );
  }
}
