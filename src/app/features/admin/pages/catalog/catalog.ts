import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  AdminProduct,
  AdminService,
  ApiUser,
  CatalogStatus,
} from '../../../../core/models/api.models';
import { Dropdown, DropdownOption } from '../../../../shared/ui/dropdown/dropdown';

export type CatalogMode = 'services' | 'products' | 'users';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, LucideAngularModule, Dropdown],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog {
  readonly mode = input.required<CatalogMode>();
  readonly services = input.required<AdminService[]>();
  readonly products = input.required<AdminProduct[]>();
  readonly users = input.required<ApiUser[]>();

  readonly inspectService = output<AdminService>();
  readonly serviceStatusChange = output<AdminService>();
  readonly productStatusChange = output<{ product: AdminProduct; status: CatalogStatus }>();
  readonly userStatusChange = output<ApiUser>();

  readonly search = signal('');
  readonly status = signal('Tous');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions: DropdownOption[] = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
  ];

  readonly statusOptions = computed<DropdownOption[]>(() => [
    { value: 'Tous', label: 'Tous' },
    { value: 'Actif', label: 'Actif' },
    ...(this.mode() === 'users'
      ? [{ value: 'Révoqué', label: 'Révoqué' }]
      : [
          { value: 'Suspendu', label: 'Suspendu' },
          { value: 'Supprimé', label: 'Supprimé' },
        ]),
  ]);

  readonly filteredItems = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('fr');
    const status = this.status();
    if (this.mode() === 'services') {
      return this.services().filter((service) =>
        this.matches(query, service.name, service.description ?? '') &&
        (status === 'Tous' || this.catalogStatus(service.status) === status),
      );
    }
    if (this.mode() === 'products') {
      return this.products().filter((product) =>
        this.matches(query, product.name, this.serviceName(product.service_id)) &&
        (status === 'Tous' || this.catalogStatus(product.status) === status),
      );
    }
    return this.users().filter((user) =>
      this.matches(query, this.userName(user), user.email) &&
      (status === 'Tous' || this.userStatus(user.status) === status),
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize())),
  );
  readonly pageItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  setFilter(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  setStatus(value: string): void {
    this.status.set(value);
    this.page.set(1);
  }

  setPageSize(value: number): void {
    this.pageSize.set(Number(value));
    this.page.set(1);
  }

  changePage(direction: -1 | 1): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, this.page() + direction)));
  }

  serviceProducts(serviceId: string): AdminProduct[] {
    return this.products().filter((product) => product.service_id === serviceId);
  }

  serviceName(serviceId: string): string {
    return this.services().find((service) => service.id === serviceId)?.name ?? 'Service inconnu';
  }

  productPrice(product: AdminProduct): string {
    const modality = product.modalities?.[0];
    return modality
      ? `Dès ${new Intl.NumberFormat('fr-FR').format(modality.price)} ${modality.currency}`
      : 'Aucun prix';
  }

  userName(user: ApiUser): string {
    return [user.nom, user.postnom].filter(Boolean).join(' ');
  }

  userInitials(user: ApiUser): string {
    return this.userName(user).split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  formatDate(date?: string): string {
    return date
      ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
      : 'À l’instant';
  }

  catalogStatus(status: CatalogStatus): string {
    return { ACTIVE: 'Actif', SUSPENDED: 'Suspendu', DELETED: 'Supprimé' }[status];
  }

  userStatus(status: ApiUser['status']): string {
    return status === 'ACTIVE' ? 'Actif' : 'Révoqué';
  }

  statusTone(status: string): string {
    if (status === 'Actif') return 'success';
    if (status === 'Suspendu') return 'warning';
    if (status === 'Révoqué') return 'danger';
    return 'neutral';
  }

  private matches(query: string, ...values: string[]): boolean {
    return !query || values.some((value) => value.toLocaleLowerCase('fr').includes(query));
  }
}
