import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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

    this.auth.login(this.email.trim(), this.password).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => void this.router.navigate(['/gestion-interne-ttk-v2/dashboard']),
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.errorMessage = error.error?.message ?? error.message ?? 'Connexion impossible. Vérifiez vos identifiants.';
      }
    });
  }
}
