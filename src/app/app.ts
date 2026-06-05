import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root Application Component
 * Serves as the entry point for the Angular application
 * Uses OnPush change detection for optimal performance
 */
@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet]
})
export class App {}
