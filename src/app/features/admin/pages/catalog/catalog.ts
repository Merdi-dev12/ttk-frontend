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
export type CatalogBulkStatusChange =
  | { mode: 'services'; items: AdminService[]; status: CatalogStatus }
  | { mode: 'products'; items: AdminProduct[]; status: CatalogStatus };

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
  readonly serviceDelete = output<AdminService>();
  readonly serviceBulkDelete = output<AdminService[]>();
  readonly productStatusChange = output<{ product: AdminProduct; status: CatalogStatus }>();
  readonly productDelete = output<AdminProduct>();
  readonly productBulkDelete = output<AdminProduct[]>();
  readonly bulkCatalogStatusChange = output<CatalogBulkStatusChange>();
  readonly userStatusChange = output<ApiUser>();
  readonly userBulkStatusChange = output<{ users: ApiUser[]; status: ApiUser['status'] }>();

  readonly search = signal('');
  readonly status = signal('Tous');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly selectionMode = signal(false);
  readonly selectedIds = signal<Set<string>>(new Set());
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
  readonly selectedItems = computed(() => {
    const ids = this.selectedIds();
    return this.filteredItems().filter((item) => ids.has(this.itemId(item)));
  });
  readonly allPageItemsSelected = computed(() =>
    this.pageItems().length > 0 &&
    this.pageItems().every((item) => this.selectedIds().has(this.itemId(item))),
  );

  setFilter(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.clearSelection();
  }

  setStatus(value: string): void {
    this.status.set(value);
    this.page.set(1);
    this.clearSelection();
  }

  setPageSize(value: number): void {
    this.pageSize.set(Number(value));
    this.page.set(1);
    this.clearSelection();
  }

  changePage(direction: -1 | 1): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, this.page() + direction)));
  }

  enableSelection(): void {
    this.selectionMode.set(true);
  }

  closeSelection(): void {
    this.selectionMode.set(false);
    this.clearSelection();
  }

  toggleItem(item: AdminService | AdminProduct | ApiUser, checked: boolean): void {
    const ids = new Set(this.selectedIds());
    const id = this.itemId(item);
    checked ? ids.add(id) : ids.delete(id);
    this.selectedIds.set(ids);
  }

  togglePageSelection(checked: boolean): void {
    const ids = new Set(this.selectedIds());
    this.pageItems().forEach((item) => {
      const id = this.itemId(item);
      checked ? ids.add(id) : ids.delete(id);
    });
    this.selectedIds.set(ids);
  }

  selectAllFiltered(): void {
    this.selectedIds.set(new Set(this.filteredItems().map((item) => this.itemId(item))));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  deleteSelected(): void {
    const items = this.selectedItems();
    if (this.mode() === 'services') {
      this.serviceBulkDelete.emit(items as AdminService[]);
    } else if (this.mode() === 'products') {
      this.productBulkDelete.emit(items as AdminProduct[]);
    }
    this.clearSelection();
  }

  changeSelectedStatus(status: CatalogStatus): void {
    const items = this.selectedItems();
    if (this.mode() === 'services') {
      this.bulkCatalogStatusChange.emit({ mode: 'services', items: items as AdminService[], status });
    } else if (this.mode() === 'products') {
      this.bulkCatalogStatusChange.emit({ mode: 'products', items: items as AdminProduct[], status });
    }
    this.clearSelection();
  }

  changeSelectedUserStatus(status: ApiUser['status']): void {
    this.userBulkStatusChange.emit({ users: this.selectedItems() as ApiUser[], status });
    this.clearSelection();
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

  private itemId(item: AdminService | AdminProduct | ApiUser): string {
    return item.id;
  }
}
