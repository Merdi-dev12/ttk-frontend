import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  imports: [LucideAngularModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly details = input<string>('');
  readonly confirmLabel = input<string>('Confirmer');
  readonly cancelLabel = input<string>('Annuler');
  readonly loading = input<boolean>(false);

  readonly cancel = output<void>();
  readonly confirm = output<void>();
}
