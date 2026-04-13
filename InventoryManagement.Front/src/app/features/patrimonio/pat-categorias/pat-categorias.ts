import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { PatrimonioStore } from '../patrimonio.store';
import { Loading } from '../../../core/loading';

@Component({
  selector: 'app-pat-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './pat-categorias.html',
  styleUrl: './pat-categorias.scss',
})
export class PatCategorias implements OnInit {
  private readonly store = inject(PatrimonioStore);
  public readonly loading = inject(Loading);

  public categorias: any[] = [];
  public filtro = '';

  ngOnInit(): void {
    this.store.categorias$.subscribe((list) => {
      this.categorias = list || [];
    });

    this.store.loadCategorias();
  }

  filteredItems(): any[] {
    const term = this.filtro.trim().toLowerCase();
    if (!term) return this.categorias;

    return this.categorias.filter((cat) => {
      const nombre = this.getNombre(cat).toLowerCase();
      return nombre.includes(term);
    });
  }

  getNombre(categoria: any): string {
    return categoria?.descripcion || categoria?.dsCategoria || categoria?.nombre || 'Sin nombre';
  }

  getId(categoria: any): number {
    return Number(categoria?.id || categoria?.cdCategoria || 0);
  }

}
