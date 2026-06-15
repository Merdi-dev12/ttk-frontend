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
import { catchError, finalize, forkJoin, of } from 'rxjs';
import {
  AdminProduct,
  AdminService,
  ApiUser,
  DashboardSummary,
  OrderAnalytics,
} from '../../../../core/models/api.models';
import { DashboardData } from '../../../../core/services/dashboard-data';

type Period = '7d' | '30d' | '90d' | 'year';

const ORDER_DEMO_DATA: Record<Period, OrderAnalytics> = {
  '7d': {
    period: '7d',
    total: 238,
    successful: 196,
    rejected: 42,
    points: [
      { label: 'Lun', successful: 21, rejected: 4 },
      { label: 'Mar', successful: 31, rejected: 7 },
      { label: 'Mer', successful: 25, rejected: 5 },
      { label: 'Jeu', successful: 36, rejected: 8 },
      { label: 'Ven', successful: 29, rejected: 6 },
      { label: 'Sam', successful: 34, rejected: 7 },
      { label: 'Dim', successful: 20, rejected: 5 },
    ],
  },
  '30d': {
    period: '30d',
    total: 1068,
    successful: 897,
    rejected: 171,
    points: [
      { label: '01', successful: 62, rejected: 14 },
      { label: '04', successful: 78, rejected: 11 },
      { label: '07', successful: 69, rejected: 18 },
      { label: '10', successful: 88, rejected: 16 },
      { label: '13', successful: 75, rejected: 12 },
      { label: '16', successful: 96, rejected: 19 },
      { label: '19', successful: 83, rejected: 14 },
      { label: '22', successful: 91, rejected: 17 },
      { label: '25', successful: 80, rejected: 13 },
      { label: '28', successful: 86, rejected: 15 },
      { label: '30', successful: 89, rejected: 22 },
    ],
  },
  '90d': {
    period: '90d',
    total: 3184,
    successful: 2679,
    rejected: 505,
    points: [
      { label: 'S1', successful: 188, rejected: 42 },
      { label: 'S2', successful: 215, rejected: 37 },
      { label: 'S3', successful: 204, rejected: 45 },
      { label: 'S4', successful: 236, rejected: 39 },
      { label: 'S5', successful: 219, rejected: 48 },
      { label: 'S6', successful: 251, rejected: 41 },
      { label: 'S7', successful: 228, rejected: 46 },
      { label: 'S8', successful: 244, rejected: 44 },
      { label: 'S9', successful: 217, rejected: 38 },
      { label: 'S10', successful: 252, rejected: 49 },
      { label: 'S11', successful: 221, rejected: 42 },
      { label: 'S12', successful: 204, rejected: 34 },
    ],
  },
  year: {
    period: 'year',
    total: 12640,
    successful: 10518,
    rejected: 2122,
    points: [
      { label: 'Jan', successful: 720, rejected: 164 },
      { label: 'Fév', successful: 810, rejected: 171 },
      { label: 'Mar', successful: 765, rejected: 158 },
      { label: 'Avr', successful: 902, rejected: 181 },
      { label: 'Mai', successful: 840, rejected: 169 },
      { label: 'Juin', successful: 945, rejected: 194 },
      { label: 'Juil', successful: 891, rejected: 176 },
      { label: 'Août', successful: 930, rejected: 188 },
      { label: 'Sep', successful: 846, rejected: 162 },
      { label: 'Oct', successful: 918, rejected: 184 },
      { label: 'Nov', successful: 882, rejected: 192 },
      { label: 'Déc', successful: 869, rejected: 183 },
    ],
  },
};

@Component({
  selector: 'app-overview',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {
  private readonly api = inject(DashboardData);

  readonly services = input.required<AdminService[]>();
  readonly products = input.required<AdminProduct[]>();
  readonly users = input.required<ApiUser[]>();
  readonly navigateTo = output<string>();
  readonly createService = output<void>();
  readonly createProduct = output<void>();

  readonly summary = signal<DashboardSummary | null>(null);
  readonly orders = signal<OrderAnalytics>(ORDER_DEMO_DATA['30d']);
  readonly period = signal<Period>('30d');
  readonly loading = signal(false);
  readonly usingDemoData = signal(true);
  readonly hoveredPoint = signal<number | null>(null);

  readonly stats = computed(() => {
    const summary = this.summary();
    return [
      { label: 'Services', value: summary?.services.total ?? this.services().length, detail: `${summary?.services.active ?? this.services().filter((item) => item.status === 'ACTIVE').length} actifs`, icon: 'briefcase-business', tone: 'mint' },
      { label: 'Produits', value: summary?.products.total ?? this.products().length, detail: `${summary?.products.active ?? this.products().filter((item) => item.status === 'ACTIVE').length} actifs`, icon: 'package', tone: 'blue' },
      { label: 'Commandes', value: this.orders().total, detail: `${this.successRate()}% de réussite`, icon: 'shopping-cart', tone: 'amber' },
      { label: 'Utilisateurs', value: summary?.users.total ?? this.users().length, detail: `${summary?.users.active ?? this.users().filter((item) => item.status === 'ACTIVE').length} actifs`, icon: 'users', tone: 'coral' },
    ];
  });

  readonly successRate = computed(() =>
    Math.round((this.orders().successful / Math.max(1, this.orders().total)) * 100),
  );
  readonly rejectionRate = computed(() => 100 - this.successRate());
  readonly chartMax = computed(() =>
    Math.max(1, ...this.orders().points.flatMap((point) => [point.successful, point.rejected])),
  );
  readonly successfulPath = computed(() => this.linePath('successful'));
  readonly rejectedPath = computed(() => this.linePath('rejected'));
  readonly successfulArea = computed(() => `${this.successfulPath()} L 760 210 L 35 210 Z`);
  readonly donutStyle = computed(() =>
    `conic-gradient(var(--primary) 0 ${this.successRate()}%, var(--coral-strong) ${this.successRate()}% 100%)`,
  );

  constructor() {
    this.load();
  }

  setPeriod(period: Period): void {
    this.period.set(period);
    this.load();
  }

  pointX(index: number): number {
    const count = Math.max(1, this.orders().points.length - 1);
    return 35 + (index / count) * 725;
  }

  pointY(value: number): number {
    return 200 - (value / this.chartMax()) * 165;
  }

  formatDate(date?: string): string {
    return date
      ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
      : 'À l’instant';
  }

  private load(): void {
    const period = this.period();
    const { dateFrom, dateTo } = this.periodRange(period);
    this.loading.set(true);
    forkJoin({
      summary: this.api.summary({ dateFrom, dateTo, currency: 'CDF' }).pipe(catchError(() => of(null))),
      orders: this.api.orders(period).pipe(
        catchError(() => {
          this.usingDemoData.set(true);
          return of(ORDER_DEMO_DATA[period]);
        }),
      ),
    }).pipe(finalize(() => this.loading.set(false))).subscribe(({ summary, orders }) => {
      this.summary.set(summary);
      this.orders.set(orders);
      if (orders !== ORDER_DEMO_DATA[period]) this.usingDemoData.set(false);
    });
  }

  private linePath(key: 'successful' | 'rejected'): string {
    return this.orders().points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${this.pointX(index)} ${this.pointY(point[key])}`)
      .join(' ');
  }

  private periodRange(period: Period): { dateFrom: string; dateTo: string } {
    const dateTo = new Date();
    const dateFrom = new Date(dateTo);
    if (period === 'year') dateFrom.setMonth(0, 1);
    else dateFrom.setDate(dateFrom.getDate() - Number.parseInt(period, 10));
    dateFrom.setHours(0, 0, 0, 0);
    return { dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString() };
  }
}
