import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../environments/environment';
import {
  AdminProduct,
  AdminService,
  ApiResponse,
  Currency,
} from '../models/api.models';

interface ClientRegisterPayload {
  nom: string;
  postnom?: string;
  email: string;
  telephone?: string;
  password: string;
}

const fallbackServices: AdminService[] = [
  { id: 'svc-abonnements', slug: 'abonnements', name: 'Abonnements', description: 'Streaming, outils premium, logiciels et comptes numériques livrés rapidement.', image_url: null, type: 'PRODUCTS', status: 'ACTIVE', created_at: '', updated_at: '' },
  { id: 'svc-immobilier', slug: 'immobilier', name: 'Immobilier', description: 'Biens à louer ou acheter avec des modalités simples à comparer.', image_url: null, type: 'PRODUCTS', status: 'ACTIVE', created_at: '', updated_at: '' },
  { id: 'svc-pret', slug: 'pret-argent', name: "Prêt d'argent", description: 'Formulaire guidé pour soumettre une demande et recevoir un suivi.', image_url: null, type: 'FORM', status: 'ACTIVE', created_at: '', updated_at: '' },
  { id: 'svc-assistance', slug: 'assistance', name: 'Assistance', description: 'Support personnalisé pour les démarches et services numériques.', image_url: null, type: 'FORM', status: 'ACTIVE', created_at: '', updated_at: '' },
];

const fallbackProducts: AdminProduct[] = [
  {
    id: 'prd-netflix', service_id: 'svc-abonnements', slug: 'netflix-premium', name: 'Netflix Premium',
    description: 'Forfaits flexibles pour regarder vos contenus favoris sans friction.',
    admin_note: null, status: 'ACTIVE',
    images: [],
    modalities: [
      { label: '1 mois', price: 8, currency: 'USD', availability: 'AVAILABLE' },
      { label: '3 mois', price: 22, currency: 'USD', availability: 'AVAILABLE' },
    ],
  },
  {
    id: 'prd-canva', service_id: 'svc-abonnements', slug: 'canva-pro', name: 'Canva Pro',
    description: 'Un compte prêt pour créer des visuels, documents et contenus pro.',
    admin_note: null, status: 'ACTIVE',
    images: [],
    modalities: [{ label: '30 jours', price: 5, currency: 'USD', availability: 'AVAILABLE' }],
  },
  {
    id: 'prd-appart', service_id: 'svc-immobilier', slug: 'studio-centre-ville', name: 'Studio centre-ville',
    description: 'Studio meublé, propre et accessible pour court ou moyen séjour.',
    admin_note: null, status: 'ACTIVE',
    images: [],
    modalities: [
      { label: 'Location mensuelle', price: 250, currency: 'USD', availability: 'ON_REQUEST' },
      { label: 'Visite', price: 0, currency: 'USD', availability: 'AVAILABLE' },
    ],
  },
  {
    id: 'prd-design', service_id: 'svc-abonnements', slug: 'pack-design', name: 'Pack design',
    description: 'Ressources visuelles et accès créatifs pour lancer un projet vite.',
    admin_note: null, status: 'ACTIVE',
    images: [],
    modalities: [{ label: 'Pack standard', price: 12, currency: 'USD', availability: 'AVAILABLE' }],
  },
];

@Injectable({ providedIn: 'root' })
export class ClientApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listServices(): Observable<AdminService[]> {
    return this.http.get<ApiResponse<{ items: AdminService[] }>>(`${this.baseUrl}/catalog/services`).pipe(
      map((response) => response.data.items.filter((service) => service.status === 'ACTIVE')),
      catchError(() => of(fallbackServices)),
    );
  }

  listProducts(serviceId?: string): Observable<AdminProduct[]> {
    const url = serviceId
      ? `${this.baseUrl}/catalog/services/${serviceId}/products`
      : `${this.baseUrl}/catalog/products`;
    return this.http.get<ApiResponse<{ items: AdminProduct[] }>>(url).pipe(
      map((response) => response.data.items.filter((product) => product.status === 'ACTIVE')),
      catchError(() => of(fallbackProducts.filter((product) => !serviceId || product.service_id === serviceId))),
    );
  }

  catalog(): Observable<{ services: AdminService[]; products: AdminProduct[] }> {
    return forkJoin({ services: this.listServices(), products: this.listProducts() });
  }

  login(email: string, password: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  register(payload: ClientRegisterPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  verifyOtp(email: string, code: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/verify-otp`, { email, code });
  }

  formatPrice(value: number, currency: Currency): string {
    if (value === 0) return 'Sur demande';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
  }
}
