import { Component, inject, signal, Type } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Loading } from './core/loading';
import { getMenuComponent, getRutaActual, getRutaSistema } from './core/system-routes';
import { LoginStore } from './features/login/login.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatProgressBarModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Inventory Management');
  public loadingService = inject(Loading);
  public store = inject(LoginStore);
  private router = inject(Router);

  get sistemaPrefijo(): string {
    return (localStorage.getItem('sistema_prefijo') || 'SIS').toUpperCase();
  }

  get sistemaNombre(): string {
    return localStorage.getItem('sistema_descripcion') || 'Sistema';
  }

  esSistema(prefijo: string): boolean {
    return this.sistemaPrefijo === prefijo.toUpperCase();
  }

  // Obtiene la ruta principal del sistema según el prefijo configurado en app.routes.ts
  private getRutaBaseByPrefijo(prefijo: string): string | null {
    return getRutaSistema(this.router.config, prefijo);
  }

  // Verifica si la ruta actual corresponde al sistema indicado por el prefijo
  estaEnRuta(prefijo: string): boolean {
    const basePath = this.getRutaBaseByPrefijo(prefijo);
    if (!basePath) {
      return false;
    }

    return this.router.url === basePath || this.router.url.startsWith(`${basePath}/`);
  }

  private getRutaActual() {
    return getRutaActual(this.router.config, this.router.url);
  }

  get menuActual(): Type<unknown> | null {
    return getMenuComponent(this.getRutaActual());
  }

  private esRutaProtegida(): boolean {
    return !!this.getRutaActual();
  }

  mostrarShell(user: unknown): boolean {
    return !!user && this.esRutaProtegida();
  }
}
