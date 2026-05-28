import {
  Injectable,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  ComponentRef,
  inject,
} from '@angular/core';
import { WalletModalComponent } from '../components/wallet-modal/wallet-modal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private modalRef: ComponentRef<WalletModalComponent> | null = null;

  open(): void {
    if (this.modalRef) return; // ya abierto

    // Crear el componente dinámicamente
    this.modalRef = createComponent(WalletModalComponent, {
      environmentInjector: this.injector,
    });

    // Escuchar el output "close"
    this.modalRef.instance.close.subscribe(() => this.close());

    // Adjuntar al árbol de detección de cambios de Angular
    this.appRef.attachView(this.modalRef.hostView);

    // Insertar el nodo DOM directamente en <body> — fuera de cualquier
    // contexto de apilamiento que pueda interferir con position:fixed
    const domElem = (this.modalRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Bloquear scroll del body mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    if (!this.modalRef) return;
    this.appRef.detachView(this.modalRef.hostView);
    this.modalRef.destroy();
    this.modalRef = null;
    // Restaurar scroll
    document.body.style.overflow = '';
  }

  isOpen(): boolean {
    return this.modalRef !== null;
  }
}
