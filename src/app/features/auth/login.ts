import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { ADMIN_ROUTES } from '../../core/constants/admin-routes';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  passwordVisible = false;
  loading = false;
  errorMessage = '';

  submit(): void {
    if (!this.email.trim() || !this.password) return;

    this.loading = true;
    this.errorMessage = '';

    this.auth
      .login(this.email.trim(), this.password)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(ADMIN_ROUTES.dashboard),
        error: (error: { error?: { message?: string }; message?: string }) => {
          this.errorMessage =
            error.error?.message ??
            (error.message?.includes('Http failure response')
              ? 'Le serveur est indisponible. Vérifiez que le backend est démarré.'
              : error.message) ??
            'Connexion impossible. Vérifiez vos identifiants.';
        },
      });
  }
}
