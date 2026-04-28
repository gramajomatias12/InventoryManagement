import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { PatrimonioStore } from '../patrimonio.store';
import { Loading } from '../../../core/loading';

@Component({
  selector: 'app-pat-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './pat-proveedores.html',
  styleUrl: './pat-proveedores.scss',
})
export class PatProveedores implements OnInit {
  private readonly store = inject(PatrimonioStore);
  public readonly loading = inject(Loading);

  public proveedores: any[] = [];
  public filtro = '';

  ngOnInit(): void {
    this.store.proveedores$.subscribe((list) => {
      this.proveedores = list || [];
    });

    this.store.loadProveedores();
  }

  filteredItems(): any[] {
    const term = this.filtro.trim().toLowerCase();
    if (!term) return this.proveedores;

    return this.proveedores.filter((item) => {
      const nombre = this.getNombre(item).toLowerCase();
      const email = (item?.dsEmail || '').toLowerCase();
      return nombre.includes(term) || email.includes(term);
    });
  }

  getNombre(item: any): string {
    return item?.dsProveedor || '';
  }

  getId(item: any): number {
    return Number(item?.id || item?.cdProveedor || 0);
  }
}
