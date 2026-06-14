import { Component, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  template: `
    <div class="min-h-screen bg-white dark:bg-gray-900">
      <!-- Header -->
      <header class="bg-blue-600 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">Welcome to TTK Services</h1>
          <p class="text-xl text-blue-100">Built with Angular 21, Tailwind CSS, DaisyUI, and Lottie</p>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 py-16">
        <!-- Info Card -->
        <div class="bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-600 p-6 rounded mb-12">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">ℹ️ Getting Started</h2>
          <p class="text-gray-700 dark:text-gray-300">
            Your project is ready! You have Tailwind CSS, DaisyUI, Angular Icons, and Lottie Files installed.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <!-- Tailwind Card -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">🎨</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Tailwind CSS</h3>
            <p class="text-gray-600 dark:text-gray-400">Utility-first CSS framework for rapid UI development</p>
          </div>

          <!-- DaisyUI Card -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">✨</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">DaisyUI</h3>
            <p class="text-gray-600 dark:text-gray-400">Pre-built components built on top of Tailwind</p>
          </div>

          <!-- Angular Icons Card -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">🎯</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Angular Icons</h3>
            <p class="text-gray-600 dark:text-gray-400">500+ beautiful, simple icons for Angular</p>
          </div>

          <!-- Lottie Card -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">🎬</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Lottie Files</h3>
            <p class="text-gray-600 dark:text-gray-400">Lightweight animations for web and mobile</p>
          </div>

          <!-- Angular Card -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">⚡</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Angular 21</h3>
            <p class="text-gray-600 dark:text-gray-400">Latest Angular with Standalone Components</p>
          </div>

          <!-- Dark Mode Card -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">🌓</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Dark Mode Ready</h3>
            <p class="text-gray-600 dark:text-gray-400">Full support for light and dark themes</p>
          </div>
        </div>

        <!-- Animation Example -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center mb-12">
          <h2 class="text-2xl font-bold mb-4">Animation Example</h2>
          <div class="bg-white bg-opacity-20 rounded-lg p-8 backdrop-blur-sm">
            <lottie-player
              src="https://lottie.host/2ecff372-8ed4-4cd6-a48b-5d91c10eb2c5/lxqStfPkjP.json"
              background="transparent"
              speed="1"
              [attr.loop]="true"
              [attr.autoplay]="true"
              style="width: 300px; height: 300px; margin: 0 auto;"
            ></lottie-player>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Navigation</h2>
          <div class="flex flex-wrap justify-center gap-4">
            <button class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              📚 Documentation
            </button>
            <button class="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
              🔧 Configuration
            </button>
            <button class="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border-2 border-gray-400 dark:border-gray-600">
              ❓ Learn More
            </button>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-100 dark:bg-gray-800 mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 TTK Services. All rights reserved.</p>
          <p class="text-sm mt-2">Built with ❤️ using Angular 21</p>
        </div>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent {}
