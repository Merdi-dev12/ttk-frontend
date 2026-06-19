import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import {
  ApiErrorResponse,
  StorageBucket,
  StorageObject,
} from '../../../../core/models/api.models';
import { StorageApiService } from '../../../../core/services/storage-api.service';

@Component({
  selector: 'app-storage',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './storage.html',
  styleUrl: './storage.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Storage {
  private readonly api = inject(StorageApiService);

  readonly toast = output<{ message: string; error?: boolean }>();
  readonly buckets = signal<StorageBucket[]>([]);
  readonly objects = signal<StorageObject[]>([]);
  readonly selectedBucketId = signal('');
  readonly search = signal('');
  readonly newBucketName = signal('');
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly error = signal('');

  readonly selectedBucket = computed(
    () => this.buckets().find((bucket) => bucket.id === this.selectedBucketId()) ?? null,
  );
  readonly filteredObjects = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('fr');
    return this.objects().filter((object) =>
      !query || `${object.name} ${object.object_key}`.toLocaleLowerCase('fr').includes(query),
    );
  });

  constructor() {
    this.loadBuckets();
  }

  selectBucket(bucketId: string): void {
    this.selectedBucketId.set(bucketId);
    this.objects.set([]);
    this.loading.set(true);
    this.error.set('');
    this.api
      .listObjects(bucketId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (objects) => {
          this.objects.set(objects);
          this.updateBucketCount(bucketId, objects.length);
        },
        error: (error) => this.handleError(error),
      });
  }

  createBucket(): void {
    const name = this.newBucketName().trim();
    if (!name || this.loading()) return;
    this.loading.set(true);
    this.api
      .createBucket(name)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (bucket) => {
          this.buckets.update((items) => [...items, bucket]);
          this.newBucketName.set('');
          this.selectBucket(bucket.id);
          this.toast.emit({ message: `Le bucket « ${bucket.name} » a été créé.` });
        },
        error: (error) => this.handleError(error),
      });
  }

  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.selectedBucketId()) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('Sélectionnez un fichier image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.error.set('L’image ne doit pas dépasser 10 Mo.');
      return;
    }

    this.uploading.set(true);
    this.error.set('');
    this.api
      .upload(this.selectedBucketId(), file)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (object) => {
          this.objects.update((items) => [object, ...items]);
          this.updateBucketCount(this.selectedBucketId(), this.objects().length);
          this.toast.emit({ message: 'Image téléversée dans Storage.' });
        },
        error: (error) => this.handleError(error),
      });
  }

  copyUrl(object: StorageObject): void {
    void navigator.clipboard.writeText(object.url).then(
      () => this.toast.emit({ message: 'URL copiée.' }),
      () => this.toast.emit({ message: 'Impossible de copier l’URL.', error: true }),
    );
  }

  remove(object: StorageObject): void {
    if (!window.confirm(`Supprimer définitivement « ${object.name} » ?`)) return;
    this.api.deleteObject(object.bucket_id, object.id).subscribe({
      next: () => {
        this.objects.update((items) => items.filter((item) => item.id !== object.id));
        this.updateBucketCount(object.bucket_id, this.objects().length);
        this.toast.emit({ message: 'Image supprimée de Storage.' });
      },
      error: (error) => this.handleError(error),
    });
  }

  private loadBuckets(): void {
    this.api
      .listBuckets()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (buckets) => {
          this.buckets.set(buckets);
          if (buckets.length) this.selectBucket(buckets[0].id);
        },
        error: (error) => this.handleError(error),
      });
  }

  private updateBucketCount(bucketId: string, count: number): void {
    this.buckets.update((buckets) =>
      buckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, objects_count: count } : bucket,
      ),
    );
  }

  private handleError(error: {
    status?: number;
    error?: Partial<ApiErrorResponse>;
    message?: string;
  }): void {
    this.error.set(
      error.status === 404
        ? 'Le module Storage attend encore ses endpoints backend.'
        : error.error?.message ?? error.message ?? 'Storage est indisponible.',
    );
  }
}
