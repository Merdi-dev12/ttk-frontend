import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  imports: [LucideAngularModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly options = input.required<DropdownOption[]>();
  readonly value = input<string | number>('');
  readonly placeholder = input('Sélectionner');
  readonly ariaLabel = input('Sélectionner une option');
  readonly disabled = input(false);
  readonly valueChange = output<string | number>();
  readonly open = signal(false);

  readonly selectedLabel = computed(
    () => this.options().find((option) => option.value === this.value())?.label,
  );

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  toggle(): void {
    if (!this.disabled()) this.open.update((value) => !value);
  }

  choose(option: DropdownOption): void {
    if (option.disabled) return;
    this.valueChange.emit(option.value);
    this.open.set(false);
  }
}
