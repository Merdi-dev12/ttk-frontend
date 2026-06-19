import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AdminService } from '../../../../core/models/api.models';
import { ClientApi } from '../../../../core/services/client-api';

@Component({
  selector: 'app-client-services',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './services.html',
  styleUrl: './services.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientServices {
  private readonly api = inject(ClientApi);
  readonly services = signal<AdminService[]>([]);
  readonly filter = signal<'all' | 'PRODUCTS' | 'FORM'>('all');
  readonly query = signal('');
  readonly visibleServices = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('fr');
    return this.services().filter((service) =>
      (this.filter() === 'all' || service.type === this.filter()) &&
      (!query || `${service.name} ${service.description ?? ''}`.toLocaleLowerCase('fr').includes(query)),
    );
  });

  constructor() {
    this.api.listServices().subscribe((services) => this.services.set(services));
  }

  visual(service: AdminService, index: number): string {
    if (service.image_url) return service.image_url.startsWith('linear-gradient') ? service.image_url : `url("${service.image_url}")`;
    const tones = ['#6f4d2f,#19120d', '#275549,#101715', '#4c314d,#171019', '#324961,#101318'];
    return `linear-gradient(135deg, ${tones[index % tones.length]})`;
  }
}
