import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { AdministradorStore } from '../administrador.store';
import { Loading } from '../../../core/loading';

@Component({
  selector: 'app-adm-sistemas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './adm-sistemas.html',
  styleUrl: './adm-sistemas.scss',
})
export class AdmSistemas implements OnInit {
  private readonly store = inject(AdministradorStore);
  public readonly loading = inject(Loading);

  public sistemas: any[] = [];
  public filtro = '';

  ngOnInit(): void {
    this.store.sistemas$.subscribe((list) => {
      this.sistemas = list || [];
    });

    this.store.loadSistemas();
  }

  filteredItems(): any[] {
    const term = this.filtro.trim().toLowerCase();
    if (!term) return this.sistemas;

    return this.sistemas.filter((sistema) => {
      const nombre = this.getNombre(sistema).toLowerCase();
      const prefijo = this.getPrefijo(sistema).toLowerCase();
      return nombre.includes(term) || prefijo.includes(term);
    });
  }

  getNombre(sistema: any): string {
    return sistema?.descripcion || sistema?.dsSistema || 'Sin nombre';
  }

  getId(sistema: any): number {
    return Number(sistema?.id || sistema?.cdSistema || 0);
  }

  getPrefijo(sistema: any): string {
    return String(sistema?.prefijo || sistema?.dsPrefijo || '').trim().toUpperCase();
  }
}

