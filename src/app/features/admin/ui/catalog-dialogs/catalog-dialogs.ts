import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import {
  AdminProduct,
  AdminService,
  Availability,
  CreateFieldPayload,
  Currency,
  FieldType,
  ServiceType,
  StorageBucket,
  StorageObject,
} from '../../../../core/models/api.models';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { StorageApiService } from '../../../../core/services/storage-api.service';
import { Dropdown, DropdownOption } from '../../../../shared/ui/dropdown/dropdown';

export type CatalogDialogType = 'service' | 'product' | null;

interface FieldForm {
  technicalName: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  optionsText: string;
}

interface ImageForm { url: string; isPrimary: boolean }
interface ModalityForm {
  label: string;
  price: number | null;
  currency: Currency;
  availability: Availability;
  attributes: string;
}

@Component({
  selector: 'app-catalog-dialogs',
  imports: [CommonModule, FormsModule, LucideAngularModule, Dropdown],
  templateUrl: './catalog-dialogs.html',
  styleUrl: './catalog-dialogs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogDialogs {
  private readonly api = inject(AdminApiService);
  private readonly storage = inject(StorageApiService);

  readonly type = input.required<CatalogDialogType>();
  readonly services = input.required<AdminService[]>();
  readonly close = output<void>();
  readonly serviceCreated = output<AdminService>();
  readonly productCreated = output<AdminProduct>();
  readonly toast = output<{ message: string; error?: boolean }>();

  readonly submitting = signal(false);
  readonly error = signal('');
  readonly pickerOpen = signal(false);
  readonly pickerTarget = signal<{ type: 'service' } | { type: 'product'; index: number } | null>(null);
  readonly buckets = signal<StorageBucket[]>([]);
  readonly objects = signal<StorageObject[]>([]);
  readonly bucketId = signal('');
  readonly storageLoading = signal(false);

  serviceForm = this.newService();
  productForm = this.newProduct();

  readonly fieldTypes: Array<{ value: FieldType; label: string }> = [
    { value: 'TEXT', label: 'Texte court' },
    { value: 'NUMBER', label: 'Nombre' },
    { value: 'DATE', label: 'Date' },
    { value: 'SELECT', label: 'Liste de choix' },
    { value: 'FILE', label: 'Fichier' },
    { value: 'TEXTAREA', label: 'Zone de texte' },
    { value: 'PHONE', label: 'Téléphone' },
  ];
  readonly serviceTypes: DropdownOption[] = [
    { value: 'PRODUCTS', label: 'Produits' },
    { value: 'FORM', label: 'Formulaire dynamique' },
  ];
  readonly currencies: DropdownOption[] = [
    { value: 'CDF', label: 'CDF' },
    { value: 'USD', label: 'USD' },
  ];
  readonly availabilities: DropdownOption[] = [
    { value: 'AVAILABLE', label: 'Disponible' },
    { value: 'UNAVAILABLE', label: 'Indisponible' },
    { value: 'ON_REQUEST', label: 'Sur demande' },
  ];

  get productServiceOptions(): DropdownOption[] {
    return this.productServices.map((service) => ({ value: service.id, label: service.name }));
  }

  get bucketOptions(): DropdownOption[] {
    return this.buckets().map((bucket) => ({ value: bucket.id, label: bucket.name }));
  }

  get productServices(): AdminService[] {
    return this.services().filter((service) => service.type === 'PRODUCTS' && service.status !== 'DELETED');
  }

  dismiss(): void {
    if (this.submitting()) return;
    this.reset();
    this.close.emit();
  }

  addField(): void { this.serviceForm.fields.push(this.newField()); }
  removeField(index: number): void { this.serviceForm.fields.splice(index, 1); }
  addImage(): void { this.productForm.images.push({ url: '', isPrimary: false }); }
  removeImage(index: number): void {
    this.productForm.images.splice(index, 1);
    if (this.productForm.images.length && !this.productForm.images.some((image) => image.isPrimary)) {
      this.productForm.images[0].isPrimary = true;
    }
  }
  setPrimary(index: number): void {
    this.productForm.images.forEach((image, position) => image.isPrimary = position === index);
  }
  addModality(): void { this.productForm.modalities.push(this.newModality()); }
  removeModality(index: number): void { this.productForm.modalities.splice(index, 1); }

  submit(): void {
    if (this.type() === 'service') this.createService();
    if (this.type() === 'product') this.createProduct();
  }

  openPicker(type: 'service' | 'product', index = 0): void {
    this.pickerTarget.set(type === 'service' ? { type } : { type, index });
    this.pickerOpen.set(true);
    if (!this.buckets().length) this.loadBuckets();
  }

  closePicker(): void {
    this.pickerOpen.set(false);
    this.pickerTarget.set(null);
  }

  selectBucket(id: string): void {
    this.bucketId.set(id);
    this.storageLoading.set(true);
    this.storage.listObjects(id).pipe(finalize(() => this.storageLoading.set(false))).subscribe({
      next: (objects) => this.objects.set(objects),
      error: () => this.error.set('Impossible de charger les images Storage.'),
    });
  }

  choose(object: StorageObject): void {
    const target = this.pickerTarget();
    if (target?.type === 'service') this.serviceForm.imageUrl = object.url;
    if (target?.type === 'product') this.productForm.images[target.index].url = object.url;
    this.closePicker();
  }

  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.bucketId()) return;
    this.storageLoading.set(true);
    this.storage.upload(this.bucketId(), file).pipe(finalize(() => this.storageLoading.set(false))).subscribe({
      next: (object) => this.objects.update((items) => [object, ...items]),
      error: () => this.error.set('Téléversement impossible.'),
    });
  }

  private createService(): void {
    if (!this.serviceForm.name.trim()) {
      this.error.set('Le nom du service est obligatoire.');
      return;
    }
    const fields: CreateFieldPayload[] = this.serviceForm.type === 'FORM'
      ? this.serviceForm.fields.map((field, index) => ({
          technicalName: field.technicalName.trim(),
          label: field.label.trim(),
          fieldType: field.fieldType,
          required: field.required,
          displayOrder: index,
          ...(field.fieldType === 'SELECT'
            ? { options: field.optionsText.split(',').map((value) => value.trim()).filter(Boolean) }
            : {}),
        }))
      : [];
    if (fields.some((field) => !field.label || !/^[a-z][a-z0-9_]*$/.test(field.technicalName) || field.technicalName === 'email')) {
      this.error.set('Vérifiez les champs dynamiques et leurs noms techniques.');
      return;
    }
    this.submitting.set(true);
    this.api.createService({
      name: this.serviceForm.name.trim(),
      description: this.serviceForm.description.trim() || undefined,
      imageUrl: this.serviceForm.imageUrl || undefined,
      type: this.serviceForm.type,
    }, fields).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (service) => { this.serviceCreated.emit(service); this.dismiss(); },
      error: (error) => this.error.set(error.error?.message ?? 'Création impossible.'),
    });
  }

  private createProduct(): void {
    if (!this.productForm.serviceId || !this.productForm.name.trim()) {
      this.error.set('Sélectionnez un service et renseignez le nom du produit.');
      return;
    }
    try {
      const images = this.productForm.images.filter((image) => image.url).map((image, index) => ({
        url: image.url, isPrimary: image.isPrimary, displayOrder: index,
      }));
      const modalities = this.productForm.modalities.map((item) => ({
        label: item.label.trim(),
        price: Number(item.price),
        currency: item.currency,
        availability: item.availability,
        ...(item.attributes.trim() ? { additionalAttributes: JSON.parse(item.attributes) } : {}),
      }));
      this.submitting.set(true);
      this.api.createProduct(this.productForm.serviceId, {
        name: this.productForm.name.trim(),
        description: this.productForm.description.trim() || undefined,
        adminNote: this.productForm.adminNote.trim() || undefined,
        images,
        modalities,
      }).pipe(finalize(() => this.submitting.set(false))).subscribe({
        next: (product) => { this.productCreated.emit(product); this.dismiss(); },
        error: (error) => this.error.set(error.error?.message ?? 'Création impossible.'),
      });
    } catch {
      this.error.set('Les attributs supplémentaires doivent être un objet JSON valide.');
    }
  }

  private loadBuckets(): void {
    this.storageLoading.set(true);
    this.storage.listBuckets().pipe(finalize(() => this.storageLoading.set(false))).subscribe({
      next: (buckets) => {
        this.buckets.set(buckets);
        if (buckets.length) this.selectBucket(buckets[0].id);
      },
      error: () => this.error.set('Le module Storage attend encore son backend.'),
    });
  }

  private reset(): void {
    this.error.set('');
    this.serviceForm = this.newService();
    this.productForm = this.newProduct();
  }

  private newService() {
    return { name: '', description: '', imageUrl: '', type: 'PRODUCTS' as ServiceType, fields: [] as FieldForm[] };
  }
  private newField(): FieldForm {
    return { technicalName: '', label: '', fieldType: 'TEXT', required: true, optionsText: '' };
  }
  private newProduct() {
    return { serviceId: '', name: '', description: '', adminNote: '', images: [{ url: '', isPrimary: true }] as ImageForm[], modalities: [this.newModality()] };
  }
  private newModality(): ModalityForm {
    return { label: '', price: null, currency: 'CDF', availability: 'AVAILABLE', attributes: '' };
  }
}
