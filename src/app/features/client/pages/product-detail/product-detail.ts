import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AdminProduct, ProductModality } from '../../../../core/models/api.models';
import { ClientApi } from '../../../../core/services/client-api';

@Component({
  selector: 'app-client-product-detail',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientProductDetail {
  private readonly api = inject(ClientApi);
  private readonly route = inject(ActivatedRoute);
  readonly products = signal<AdminProduct[]>([]);
  readonly selectedModality = signal<ProductModality | null>(null);
  readonly slug = signal(this.route.snapshot.paramMap.get('slug') ?? '');
  readonly product = computed(() => this.products().find((item) => item.slug === this.slug()) ?? null);

  constructor() {
    this.api.listProducts().subscribe((products) => {
      this.products.set(products);
      this.selectedModality.set(products.find((item) => item.slug === this.slug())?.modalities[0] ?? null);
    });
  }

  price(item: ProductModality): string {
    return this.api.formatPrice(item.price);
  }

  visual(product: AdminProduct): string {
    const value = product.images[0]?.url;
    if (!value) return 'linear-gradient(135deg, #22352f, #111614)';
    return value.startsWith('linear-gradient') ? value : `url("${value}")`;
  }
}
