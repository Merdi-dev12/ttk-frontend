import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { ClientApi } from '../../../../core/services/client-api';

@Component({
  selector: 'app-client-login',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLogin {
  private readonly api = inject(ClientApi);
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly message = signal('');

  submit(): void {
    if (!this.email().trim() || !this.password()) return;
    this.loading.set(true);
    this.message.set('');
    this.api.login(this.email().trim(), this.password()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => this.message.set('Connexion réussie. Le tableau client sera branché ensuite.'),
      error: () => this.message.set('Connexion impossible pour le moment.'),
    });
  }
}
