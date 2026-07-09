import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appPermiso]',
  standalone: true
})
export class PermisoDirective implements OnInit, OnDestroy {
  private config: { pantalla: string, accion: string } | null = null;
  private hasView = false;
  private sub: Subscription | null = null;

  @Input() set appPermiso(val: { pantalla: string, accion: string }) {
    this.config = val;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.sub = this.permissionService.permisos$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private updateView() {
    if (!this.config) return;

    const tienePermiso = this.permissionService.tienePermiso(this.config.pantalla, this.config.accion);

    if (tienePermiso && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!tienePermiso && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
