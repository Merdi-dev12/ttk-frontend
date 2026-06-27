import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AdminProduct, AdminService } from '../../../../core/models/api.models';
import { ClientApi } from '../../../../core/services/client-api';

@Component({
  selector: 'app-client-service-detail',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientServiceDetail {
  private readonly api = inject(ClientApi);
  private readonly route = inject(ActivatedRoute);
  readonly services = signal<AdminService[]>([]);
  readonly products = signal<AdminProduct[]>([]);
  readonly slug = signal(this.route.snapshot.paramMap.get('slug') ?? '');
  readonly service = computed(() => this.services().find((item) => item.slug === this.slug()) ?? null);
  readonly serviceProducts = computed(() => this.products().filter((product) => product.service_id === this.service()?.id));

  constructor() {
    this.api.catalog().subscribe(({ services, products }) => {
      this.services.set(services);
      this.products.set(products);
    });
  }

  price(product: AdminProduct): string {
    const modality = product.modalities[0];
    return modality ? this.api.formatPrice(modality.price) : 'Sur demande';
  }

  visual(product: AdminProduct): string {
    const value = product.images[0]?.url;
    if (!value) return 'linear-gradient(135deg, #22352f, #111614)';
    return value.startsWith('linear-gradient') ? value : `url("${value}")`;
  }
}
