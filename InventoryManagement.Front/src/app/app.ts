import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Loading } from './core/loading';
import { LoginStore } from './features/login/login.store';
import { PatMenu } from './features/patrimonio/pat-menu/pat-menu';
import { AdmMenu } from './features/administrador/adm-menu/adm-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatProgressBarModule, MatIconModule, MatButtonModule, MatTooltipModule, PatMenu, AdmMenu],
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

  private getRutaBaseByPrefijo(prefijo: string): string | null {
    switch (prefijo.toUpperCase()) {
      case 'PAT':
        return '/patrimonio';
      case 'ADM':
        return '/administrador';
      default:
        return null;
    }
  }

  estaEnRuta(prefijo: string): boolean {
    const basePath = this.getRutaBaseByPrefijo(prefijo);
    if (!basePath) {
      return false;
    }

    return this.router.url === basePath || this.router.url.startsWith(`${basePath}/`);
  }

  mostrarShell(user: unknown): boolean {
    return !!user && !this.router.url.startsWith('/login') && (this.estaEnRuta('PAT') || this.estaEnRuta('ADM'));
  }
}
