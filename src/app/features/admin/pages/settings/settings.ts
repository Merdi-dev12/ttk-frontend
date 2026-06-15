import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import {
  AdminSettings,
  ApiErrorResponse,
} from '../../../../core/models/api.models';
import { AdminSettingsApi } from '../../../../core/services/admin-settings';

type SettingsSection = keyof AdminSettings | 'appearance' | 'maintenance';

interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  detail: string;
  icon: string;
}

const DEFAULT_SETTINGS: AdminSettings = {
  general: {
    platformName: 'TTK Services',
    supportEmail: '',
    supportPhone: '',
    defaultCurrency: 'CDF',
    timezone: 'Africa/Lagos',
    maintenanceMode: false,
  },
  catalog: {
    autoPublishServices: false,
    autoPublishProducts: false,
    lowStockThreshold: 5,
    allowOutOfStockOrders: false,
  },
  orders: {
    referencePrefix: 'TTK',
    cancellationDelayMinutes: 30,
    autoCancelUnpaid: true,
    requireAdminConfirmation: true,
  },
  payments: {
    enabledCurrencies: ['CDF', 'USD'],
    paymentTimeoutMinutes: 15,
    manualVerification: true,
  },
  notifications: {
    adminEmail: '',
    notifyNewOrder: true,
    notifyNewSubmission: true,
    notifyPaymentFailure: true,
    dailyDigest: false,
  },
  security: {
    sessionIdleMinutes: 30,
    maxLoginAttempts: 5,
    requireTwoFactor: false,
    allowedAdminIps: [],
  },
  storage: {
    maxImageSizeMb: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageQuality: 85,
    generateWebp: true,
  },
};

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly api = inject(AdminSettingsApi);

  readonly darkMode = input(false);
  readonly themeChange = output<boolean>();
  readonly toast = output<{ message: string; error?: boolean }>();

  readonly activeSection = signal<SettingsSection>('general');
  readonly values = signal<AdminSettings>(structuredClone(DEFAULT_SETTINGS));
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly endpointMissing = signal(false);
  readonly error = signal('');
  readonly allowedIpsText = signal('');

  readonly navigation: SettingsNavItem[] = [
    { id: 'general', label: 'Général', detail: 'Identité et préférences', icon: 'settings-2' },
    { id: 'appearance', label: 'Apparence', detail: 'Thème et affichage', icon: 'palette' },
    { id: 'catalog', label: 'Catalogue', detail: 'Services et produits', icon: 'package-search' },
    { id: 'orders', label: 'Commandes', detail: 'Traitement et délais', icon: 'shopping-cart' },
    { id: 'payments', label: 'Paiements', detail: 'Devises et validation', icon: 'wallet-cards' },
    { id: 'notifications', label: 'Notifications', detail: 'Alertes administrateur', icon: 'bell-ring' },
    { id: 'security', label: 'Sécurité', detail: 'Sessions et restrictions', icon: 'shield-check' },
    { id: 'storage', label: 'Fichiers', detail: 'Images et optimisation', icon: 'hard-drive-upload' },
    { id: 'maintenance', label: 'Maintenance', detail: 'Cache et disponibilité', icon: 'wrench' },
  ];

  readonly currentNav = computed(
    () => this.navigation.find((item) => item.id === this.activeSection())!,
  );

  constructor() {
    this.load();
  }

  selectSection(section: SettingsSection): void {
    this.activeSection.set(section);
    this.error.set('');
  }

  updateSection<K extends keyof AdminSettings>(
    section: K,
    patch: Partial<AdminSettings[K]>,
  ): void {
    this.values.update((settings) => ({
      ...settings,
      [section]: { ...settings[section], ...patch },
    }));
  }

  toggleCurrency(currency: 'CDF' | 'USD', enabled: boolean): void {
    const current = this.values().payments.enabledCurrencies;
    const enabledCurrencies = enabled
      ? [...new Set([...current, currency])]
      : current.filter((item) => item !== currency);
    this.updateSection('payments', { enabledCurrencies });
  }

  save(): void {
    const section = this.activeSection();
    if (section === 'appearance') {
      this.toast.emit({ message: 'Préférences d’apparence enregistrées sur cet appareil.' });
      return;
    }
    if (section === 'maintenance') return;

    if (section === 'security') {
      this.updateSection('security', {
        allowedAdminIps: this.allowedIpsText()
          .split(/[\n,]/)
          .map((value) => value.trim())
          .filter(Boolean),
      });
    }

    this.saving.set(true);
    this.error.set('');
    this.api
      .update(section, this.values()[section])
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (settings) => {
          this.values.set(settings);
          this.toast.emit({ message: 'Paramètres enregistrés.' });
        },
        error: (error) => this.handleError(error),
      });
  }

  sendTestEmail(): void {
    const email = this.values().notifications.adminEmail.trim();
    if (!email) {
      this.error.set('Renseignez une adresse email administrateur.');
      return;
    }
    this.saving.set(true);
    this.api
      .sendTestEmail(email)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.toast.emit({ message: 'Email de test envoyé.' }),
        error: (error) => this.handleError(error),
      });
  }

  clearCache(): void {
    this.saving.set(true);
    this.api
      .clearCache()
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.toast.emit({ message: 'Cache applicatif vidé.' }),
        error: (error) => this.handleError(error),
      });
  }

  private load(): void {
    this.api
      .get()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (settings) => {
          this.values.set(settings);
          this.allowedIpsText.set(settings.security.allowedAdminIps.join('\n'));
        },
        error: (error: { status?: number }) => {
          if (error.status === 404) this.endpointMissing.set(true);
          else this.error.set('Impossible de charger les paramètres.');
        },
      });
  }

  private handleError(error: {
    status?: number;
    error?: Partial<ApiErrorResponse>;
    message?: string;
  }): void {
    if (error.status === 404) {
      this.endpointMissing.set(true);
      this.error.set('Endpoint de paramètres non disponible côté backend.');
      return;
    }
    this.error.set(error.error?.message ?? error.message ?? 'Enregistrement impossible.');
  }
}
