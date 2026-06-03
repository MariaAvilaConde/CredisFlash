import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly visible = signal(false);
  readonly options = signal<ConfirmOptions>({
    title: '',
    message: '',
  });

  private resolveFn: ((value: boolean) => void) | null = null;

  open(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    this.visible.set(true);
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  confirm(): void {
    this.visible.set(false);
    this.resolveFn?.(true);
    this.resolveFn = null;
  }

  cancel(): void {
    this.visible.set(false);
    this.resolveFn?.(false);
    this.resolveFn = null;
  }
}
