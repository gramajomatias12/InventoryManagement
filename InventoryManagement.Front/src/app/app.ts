import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Loading } from './core/loading';
import { UserStore } from './features/users/user.store';
import { PatMenu } from './features/patrimonio/pat-menu/pat-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatProgressBarModule, MatIconModule, MatButtonModule, MatTooltipModule, PatMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Inventory Management');
  public loadingService = inject(Loading);
  public store = inject(UserStore);

  get sistemaPrefijo(): string {
    return (localStorage.getItem('sistema_prefijo') || 'SIS').toUpperCase();
  }

  get sistemaNombre(): string {
    return localStorage.getItem('sistema_descripcion') || 'Sistema';
  }

  esSistema(prefijo: string): boolean {
    return this.sistemaPrefijo === prefijo.toUpperCase();
  }
}
