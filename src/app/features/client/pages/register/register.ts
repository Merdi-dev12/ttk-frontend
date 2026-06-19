import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { ClientApi } from '../../../../core/services/client-api';

@Component({
  selector: 'app-client-register',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientRegister {
  private readonly api = inject(ClientApi);
  private readonly router = inject(Router);
  readonly nom = signal('');
  readonly postnom = signal('');
  readonly email = signal('');
  readonly telephone = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly message = signal('');

  submit(): void {
    if (!this.nom().trim() || !this.email().trim() || !this.password()) return;
    this.loading.set(true);
    this.message.set('');
    this.api.register({
      nom: this.nom().trim(),
      postnom: this.postnom().trim(),
      email: this.email().trim(),
      telephone: this.telephone().trim(),
      password: this.password(),
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => void this.router.navigate(['/otp'], { queryParams: { email: this.email().trim() } }),
      error: () => this.message.set("Inscription impossible pour le moment."),
    });
  }
}
