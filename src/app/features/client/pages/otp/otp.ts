import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { ClientApi } from '../../../../core/services/client-api';

@Component({
  selector: 'app-client-otp',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientOtp {
  private readonly api = inject(ClientApi);
  private readonly route = inject(ActivatedRoute);
  readonly email = signal(this.route.snapshot.queryParamMap.get('email') ?? '');
  readonly code = signal('');
  readonly loading = signal(false);
  readonly message = signal('');

  submit(): void {
    if (!this.email().trim() || this.code().trim().length < 4) return;
    this.loading.set(true);
    this.message.set('');
    this.api.verifyOtp(this.email().trim(), this.code().trim()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => this.message.set('Compte vérifié. Vous pouvez maintenant vous connecter.'),
      error: () => this.message.set('Code invalide ou endpoint OTP indisponible.'),
    });
  }
}
