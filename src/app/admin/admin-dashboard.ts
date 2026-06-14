import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Braces,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  CirclePause,
  CirclePlay,
  Clock3,
  CreditCard,
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  Filter,
  Image,
  Inbox,
  Landmark,
  LayoutDashboard,
  ListPlus,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  LucideAngularModule,
  Mail,
  Megaphone,
  Menu,
  Moon,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sun,
  Trash2,
  TrendingUp,
  UserRoundCheck,
  Users,
  WalletCards,
  WifiOff,
  X
} from 'lucide-angular';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { AdminApiService } from '../core/admin-api.service';
import {
  AdminProduct,
  AdminService,
  ApiErrorResponse,
  ApiUser,
  Availability,
  CreateFieldPayload,
  Currency,
  FieldType,
  ServiceType
} from '../core/api.models';
import { AuthService } from '../core/auth.service';

export const ADMIN_ICONS = {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Braces,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  CirclePause,
  CirclePlay,
  Clock3,
  CreditCard,
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  Filter,
  Image,
  Inbox,
  Landmark,
  LayoutDashboard,
  ListPlus,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Moon,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sun,
  Trash2,
  TrendingUp,
  UserRoundCheck,
  Users,
  WalletCards,
  WifiOff,
  X
};

type SectionId =
  | 'dashboard'
  | 'services'
  | 'products'
  | 'orders'
  | 'payments'
  | 'invoices'
  | 'submissions'
  | 'users'
  | 'advertising'
  | 'settings';

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';
type ModalType = 'service' | 'product' | 'advertising';

interface NavigationItem {
  id: SectionId;
  label: string;
  icon: string;
  apiReady: boolean;
}

interface ServiceFieldForm {
  technicalName: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  optionsText: string;
}

interface ProductImageForm {
  url: string;
  isPrimary: boolean;
}

interface ProductModalityForm {
  label: string;
  price: number | null;
  currency: Currency;
  availability: Availability;
  additionalAttributesText: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  activeSection: SectionId = 'dashboard';
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  notificationsOpen = false;
  profileOpen = false;
  darkMode = localStorage.getItem('ttk_admin_theme') === 'dark';
  searchQuery = '';
  statusFilter = 'Tous';
  modalType: ModalType | null = null;
  toastMessage = '';
  errorMessage = '';
  loading = true;
  submitting = false;
  loggingOut = false;
  selectedService: AdminService | null = null;

  services: AdminService[] = [];
  products: AdminProduct[] = [];
  users: ApiUser[] = [];

  serviceForm = this.newServiceForm();
  productForm = this.newProductForm();

  readonly fieldTypes: Array<{ value: FieldType; label: string }> = [
    { value: 'TEXT', label: 'Texte court' },
    { value: 'NUMBER', label: 'Nombre' },
    { value: 'DATE', label: 'Date' },
    { value: 'SELECT', label: 'Liste de choix' },
    { value: 'FILE', label: 'Fichier' },
    { value: 'TEXTAREA', label: 'Zone de texte' },
    { value: 'PHONE', label: 'Téléphone' }
  ];

  readonly primaryNavigation: NavigationItem[] = [
    { id: 'dashboard', label: 'Vue d’ensemble', icon: 'layout-dashboard', apiReady: true },
    { id: 'services', label: 'Services', icon: 'briefcase-business', apiReady: true },
    { id: 'products', label: 'Produits', icon: 'package', apiReady: true },
    { id: 'orders', label: 'Commandes', icon: 'shopping-cart', apiReady: false },
    { id: 'payments', label: 'Paiements', icon: 'credit-card', apiReady: false },
    { id: 'invoices', label: 'Factures', icon: 'receipt-text', apiReady: false }
  ];

  readonly secondaryNavigation: NavigationItem[] = [
    { id: 'submissions', label: 'Demandes', icon: 'inbox', apiReady: false },
    { id: 'users', label: 'Utilisateurs', icon: 'users', apiReady: true },
    { id: 'advertising', label: 'Publicités', icon: 'megaphone', apiReady: false },
    { id: 'settings', label: 'Paramètres', icon: 'settings', apiReady: false }
  ];

  readonly chartBars = [38, 52, 48, 66, 58, 78, 72, 88, 74, 92, 84, 96];
  readonly sectionMeta: Record<SectionId, { title: string; eyebrow: string; description: string }> = {
    dashboard: { title: 'Vue d’ensemble', eyebrow: 'Administration', description: 'Suivez les ressources actuellement disponibles dans l’API TTK.' },
    services: { title: 'Services', eyebrow: 'Catalogue', description: 'Configurez vos services produits et vos formulaires dynamiques.' },
    products: { title: 'Produits', eyebrow: 'Catalogue', description: 'Gérez les offres, images, modalités, prix et disponibilités.' },
    orders: { title: 'Commandes', eyebrow: 'Transactions', description: 'Suivez les achats, leur traitement et leur historique.' },
    payments: { title: 'Paiements', eyebrow: 'Transactions', description: 'Contrôlez les paiements et les références prestataires.' },
    invoices: { title: 'Factures', eyebrow: 'Transactions', description: 'Retrouvez les factures générées après chaque paiement.' },
    submissions: { title: 'Demandes', eyebrow: 'Formulaires', description: 'Traitez les soumissions envoyées depuis les services formulaire.' },
    users: { title: 'Utilisateurs', eyebrow: 'Communauté', description: 'Consultez les comptes et gérez leur accès à la plateforme.' },
    advertising: { title: 'Publicités', eyebrow: 'Contenu', description: 'Planifiez les campagnes visibles sur l’accueil client.' },
    settings: { title: 'Paramètres', eyebrow: 'Configuration', description: 'Adaptez les préférences globales de la plateforme.' }
  };

  ngOnInit(): void {
    this.loadAdminData();
  }

  @HostListener('document:click')
  closePopovers(): void {
    this.notificationsOpen = false;
    this.profileOpen = false;
  }

  get currentMeta() {
    return this.sectionMeta[this.activeSection];
  }

  get adminUser(): ApiUser | null {
    return this.auth.user;
  }

  get adminName(): string {
    const user = this.adminUser;
    return user ? [user.nom, user.postnom].filter(Boolean).join(' ') : 'Administrateur';
  }

  get adminInitials(): string {
    return this.adminName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  get productServices(): AdminService[] {
    return this.services.filter((service) => service.type === 'PRODUCTS' && service.status !== 'DELETED');
  }

  get filteredServices(): AdminService[] {
    return this.services.filter((service) =>
      this.matchesSearch(service.name, service.description ?? '') &&
      (this.statusFilter === 'Tous' || this.serviceStatusLabel(service.status) === this.statusFilter)
    );
  }

  get filteredProducts(): AdminProduct[] {
    return this.products.filter((product) =>
      this.matchesSearch(product.name, this.serviceName(product.service_id)) &&
      (this.statusFilter === 'Tous' || this.catalogStatusLabel(product.status) === this.statusFilter)
    );
  }

  get filteredUsers(): ApiUser[] {
    return this.users.filter((user) =>
      this.matchesSearch(this.userName(user), user.email) &&
      (this.statusFilter === 'Tous' || this.userStatusLabel(user.status) === this.statusFilter)
    );
  }

  get stats() {
    return [
      { label: 'Services', value: String(this.services.length), detail: `${this.services.filter((item) => item.status === 'ACTIVE').length} actifs`, icon: 'briefcase-business', tone: 'mint' },
      { label: 'Produits', value: String(this.products.length), detail: `${this.products.filter((item) => item.status === 'ACTIVE').length} actifs`, icon: 'package', tone: 'blue' },
      { label: 'Formulaires', value: String(this.services.filter((item) => item.type === 'FORM').length), detail: 'services dynamiques', icon: 'file-text', tone: 'amber' },
      { label: 'Utilisateurs', value: String(this.users.length), detail: `${this.users.filter((item) => item.status === 'ACTIVE').length} actifs`, icon: 'users', tone: 'coral' }
    ];
  }

  navigate(section: SectionId): void {
    this.activeSection = section;
    this.mobileMenuOpen = false;
    this.searchQuery = '';
    this.statusFilter = 'Tous';
    this.closePopovers();
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
    this.profileOpen = false;
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen = !this.profileOpen;
    this.notificationsOpen = false;
  }

  keepPopoverOpen(event: MouseEvent): void {
    event.stopPropagation();
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('ttk_admin_theme', this.darkMode ? 'dark' : 'light');
  }

  logout(): void {
    if (this.loggingOut) return;
    this.loggingOut = true;
    this.closePopovers();
    this.auth.logout().pipe(finalize(() => {
      this.loggingOut = false;
      this.cdr.markForCheck();
    })).subscribe();
  }

  openCreateModal(type: ModalType): void {
    this.errorMessage = '';
    this.modalType = type;
    if (type === 'service') this.serviceForm = this.newServiceForm();
    if (type === 'product') this.productForm = this.newProductForm();
  }

  closeModal(): void {
    if (this.submitting) return;
    this.modalType = null;
    this.errorMessage = '';
  }

  addServiceField(): void {
    this.serviceForm.fields.push(this.newServiceField());
  }

  removeServiceField(index: number): void {
    this.serviceForm.fields.splice(index, 1);
  }

  addProductImage(): void {
    this.productForm.images.push({ url: '', isPrimary: false });
  }

  removeProductImage(index: number): void {
    this.productForm.images.splice(index, 1);
    if (this.productForm.images.length > 0 && !this.productForm.images.some((image) => image.isPrimary)) {
      this.productForm.images[0].isPrimary = true;
    }
  }

  setPrimaryImage(index: number): void {
    this.productForm.images.forEach((image, imageIndex) => {
      image.isPrimary = imageIndex === index;
    });
  }

  addProductModality(): void {
    this.productForm.modalities.push(this.newProductModality());
  }

  removeProductModality(index: number): void {
    this.productForm.modalities.splice(index, 1);
  }

  createItem(): void {
    if (this.modalType === 'service') this.createService();
    if (this.modalType === 'product') this.createProduct();
    if (this.modalType === 'advertising') this.showToast('Le backend des publicités n’est pas encore disponible.');
  }

  toggleServiceStatus(service: AdminService): void {
    const status = service.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.api.updateServiceStatus(service.id, status).subscribe({
      next: (updated) => {
        this.replaceService(updated);
        this.showToast(`${updated.name} est maintenant ${this.serviceStatusLabel(updated.status).toLowerCase()}.`);
      },
      error: (error) => this.handleError(error)
    });
  }

  toggleUserStatus(user: ApiUser): void {
    const status = user.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    this.api.updateUserStatus(user.id, status).subscribe({
      next: (updated) => {
        this.users = this.users.map((item) => item.id === updated.id ? updated : item);
        this.showToast(`${this.userName(updated)} est maintenant ${this.userStatusLabel(updated.status).toLowerCase()}.`);
        this.cdr.markForCheck();
      },
      error: (error) => this.handleError(error)
    });
  }

  changeProductStatus(product: AdminProduct, status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'): void {
    this.api.updateProductStatus(product.id, status).subscribe({
      next: (updated) => {
        this.products = this.products.map((item) => item.id === updated.id ? { ...item, ...updated } : item);
        this.showToast(`${updated.name} est maintenant ${this.catalogStatusLabel(updated.status).toLowerCase()}.`);
        this.cdr.markForCheck();
      },
      error: (error) => this.handleError(error)
    });
  }

  inspectService(service: AdminService): void {
    this.selectedService = service;
  }

  closeServicePanel(): void {
    this.selectedService = null;
  }

  serviceProducts(serviceId: string): AdminProduct[] {
    return this.products.filter((product) => product.service_id === serviceId);
  }

  serviceName(serviceId: string): string {
    return this.services.find((service) => service.id === serviceId)?.name ?? 'Service inconnu';
  }

  userName(user: ApiUser): string {
    return [user.nom, user.postnom].filter(Boolean).join(' ');
  }

  userInitials(user: ApiUser): string {
    return this.userName(user).split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
  }

  productPrice(product: AdminProduct): string {
    const modality = product.modalities?.[0];
    if (!modality) return 'Aucun prix';
    return `Dès ${new Intl.NumberFormat('fr-FR').format(modality.price)} ${modality.currency}`;
  }

  serviceTypeLabel(type: ServiceType): string {
    return type === 'PRODUCTS' ? 'Produits' : 'Formulaire';
  }

  serviceStatusLabel(status: AdminService['status']): string {
    return this.catalogStatusLabel(status);
  }

  catalogStatusLabel(status: AdminProduct['status']): string {
    return { ACTIVE: 'Actif', SUSPENDED: 'Suspendu', DELETED: 'Supprimé' }[status];
  }

  userStatusLabel(status: ApiUser['status']): string {
    return status === 'ACTIVE' ? 'Actif' : 'Révoqué';
  }

  availabilityLabel(value: Availability): string {
    return { AVAILABLE: 'Disponible', UNAVAILABLE: 'Indisponible', ON_REQUEST: 'Sur demande' }[value];
  }

  statusTone(status: string): StatusTone {
    if (['Actif', 'Payée', 'Acceptée', 'Réussi'].includes(status)) return 'success';
    if (['En attente', 'Suspendu', 'En cours'].includes(status)) return 'warning';
    if (['Échouée', 'Révoqué', 'Refusée'].includes(status)) return 'danger';
    if (status === 'Supprimé') return 'neutral';
    return 'info';
  }

  apiReady(section: SectionId): boolean {
    return [...this.primaryNavigation, ...this.secondaryNavigation].find((item) => item.id === section)?.apiReady ?? false;
  }

  private loadAdminData(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      services: this.api.listServices(),
      users: this.api.listUsers()
    }).pipe(
      switchMap(({ services, users }) => {
        this.services = services.items;
        this.users = users.items;
        return this.api.listAllProducts(services.items);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (products) => {
        this.products = products;
        this.cdr.markForCheck();
      },
      error: (error) => this.handleError(error, 'Impossible de charger les données administrateur.')
    });
  }

  private createService(): void {
    if (!this.serviceForm.name.trim()) {
      this.errorMessage = 'Le nom du service est obligatoire.';
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
            ? { options: field.optionsText.split(',').map((option) => option.trim()).filter(Boolean) }
            : {})
        }))
      : [];

    const invalidField = fields.some((field) =>
      !field.technicalName ||
      !field.label ||
      field.technicalName === 'email' ||
      !/^[a-z][a-z0-9_]*$/.test(field.technicalName) ||
      (field.fieldType === 'SELECT' && (!field.options || field.options.length === 0))
    );
    if (invalidField) {
      this.errorMessage = 'Vérifiez les champs dynamiques. Le nom technique doit être valide, différent de « email », et les listes doivent avoir des options.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.api.createService({
      name: this.serviceForm.name.trim(),
      description: this.serviceForm.description.trim() || undefined,
      imageUrl: this.serviceForm.imageUrl.trim() || undefined,
      type: this.serviceForm.type
    }, fields).pipe(finalize(() => {
      this.submitting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (service) => {
        this.services = [service, ...this.services];
        this.closeModalAfterSubmit();
        this.showToast(`Le service « ${service.name} » a été créé.`);
      },
      error: (error) => this.handleError(error)
    });
  }

  private createProduct(): void {
    if (!this.productForm.serviceId || !this.productForm.name.trim()) {
      this.errorMessage = 'Sélectionnez un service et renseignez le nom du produit.';
      return;
    }

    const images = this.productForm.images
      .filter((image) => image.url.trim())
      .map((image, index) => ({
        url: image.url.trim(),
        isPrimary: image.isPrimary,
        displayOrder: index
      }));
    if (images.filter((image) => image.isPrimary).length > 1) {
      this.errorMessage = 'Une seule image peut être définie comme principale.';
      return;
    }

    try {
      const modalities = this.productForm.modalities.map((modality) => ({
        label: modality.label.trim(),
        price: Number(modality.price),
        currency: modality.currency,
        availability: modality.availability,
        ...(modality.additionalAttributesText.trim()
          ? { additionalAttributes: JSON.parse(modality.additionalAttributesText) as Record<string, unknown> }
          : {})
      }));

      if (modalities.some((modality) => !modality.label || !Number.isFinite(modality.price) || modality.price < 0)) {
        this.errorMessage = 'Chaque modalité doit avoir un libellé et un prix positif ou nul.';
        return;
      }

      this.submitting = true;
      this.errorMessage = '';
      this.api.createProduct(this.productForm.serviceId, {
        name: this.productForm.name.trim(),
        description: this.productForm.description.trim() || undefined,
        adminNote: this.productForm.adminNote.trim() || undefined,
        images,
        modalities
      }).pipe(finalize(() => {
        this.submitting = false;
        this.cdr.markForCheck();
      })).subscribe({
        next: (product) => {
          this.products = [product, ...this.products];
          this.closeModalAfterSubmit();
          this.showToast(`Le produit « ${product.name} » a été créé.`);
        },
        error: (error) => this.handleError(error)
      });
    } catch {
      this.errorMessage = 'Les attributs supplémentaires doivent être un objet JSON valide, par exemple {"qualite":"HD"}.';
    }
  }

  private replaceService(service: AdminService): void {
    this.services = this.services.map((item) => item.id === service.id ? { ...item, ...service } : item);
    if (this.selectedService?.id === service.id) this.selectedService = { ...this.selectedService, ...service };
    this.cdr.markForCheck();
  }

  private newServiceForm() {
    return {
      name: '',
      description: '',
      imageUrl: '',
      type: 'PRODUCTS' as ServiceType,
      fields: [] as ServiceFieldForm[]
    };
  }

  private newServiceField(): ServiceFieldForm {
    return { technicalName: '', label: '', fieldType: 'TEXT', required: true, optionsText: '' };
  }

  private newProductForm() {
    return {
      serviceId: '',
      name: '',
      description: '',
      adminNote: '',
      images: [{ url: '', isPrimary: true }] as ProductImageForm[],
      modalities: [this.newProductModality()] as ProductModalityForm[]
    };
  }

  private newProductModality(): ProductModalityForm {
    return {
      label: '',
      price: null,
      currency: 'CDF',
      availability: 'AVAILABLE',
      additionalAttributesText: ''
    };
  }

  private matchesSearch(...values: string[]): boolean {
    const query = this.searchQuery.trim().toLocaleLowerCase('fr');
    return !query || values.some((value) => value.toLocaleLowerCase('fr').includes(query));
  }

  private closeModalAfterSubmit(): void {
    this.modalType = null;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  private handleError(error: { error?: Partial<ApiErrorResponse>; message?: string }, fallback = 'Une erreur est survenue.'): void {
    this.errorMessage = error.error?.message ?? error.message ?? fallback;
    this.showToast(this.errorMessage, true);
    this.cdr.markForCheck();
  }

  private showToast(message: string, isError = false): void {
    this.toastMessage = message;
    document.documentElement.dataset['toastTone'] = isError ? 'error' : 'success';
    window.setTimeout(() => {
      this.toastMessage = '';
      this.cdr.markForCheck();
    }, 3200);
  }
}
