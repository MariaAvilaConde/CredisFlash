import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  get toasts(): Toast[] {
    return this.toastService.toasts();
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  icon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error':   return '❌';
      case 'warning': return '⚠️';
      default:        return 'ℹ️';
    }
  }

  trackById(_: number, toast: Toast): number {
    return toast.id;
  }
}
