import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AdminProduct, AdminService } from '../../../../core/models/api.models';
import { ClientApi } from '../../../../core/services/client-api';

@Component({
  selector: 'app-client-home',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHome {
  private readonly api = inject(ClientApi);
  readonly services = signal<AdminService[]>([]);
  readonly products = signal<AdminProduct[]>([]);
  readonly query = signal('');
  readonly featuredServices = computed(() => this.services().slice(0, 4));
  readonly featuredProducts = computed(() => this.products().slice(0, 6));

  constructor() {
    this.api.catalog().subscribe(({ services, products }) => {
      this.services.set(services);
      this.products.set(products);
    });
  }

  lowestPrice(product: AdminProduct): string {
    const modality = product.modalities.find((item) => item.availability !== 'UNAVAILABLE') ?? product.modalities[0];
    return modality ? this.api.formatPrice(modality.price, modality.currency) : 'Sur demande';
  }

  visual(item: AdminService | AdminProduct): string {
    const value = 'image_url' in item ? item.image_url : item.images.find((image) => image.is_primary || image.isPrimary)?.url;
    if (!value) return 'linear-gradient(135deg, #273b34, #111614)';
    return value.startsWith('linear-gradient') ? value : `url("${value}")`;
  }
}
