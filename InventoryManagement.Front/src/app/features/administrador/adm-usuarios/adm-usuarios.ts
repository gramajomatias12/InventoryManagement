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
  selector: 'app-adm-usuarios',
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
  templateUrl: './adm-usuarios.html',
  styleUrl: './adm-usuarios.scss',
})
export class AdmUsuarios implements OnInit {
  private readonly store = inject(AdministradorStore);
  public readonly loading = inject(Loading);

  public usuarios: any[] = [];
  public filtro = '';

  ngOnInit(): void {
    this.store.usuarios$.subscribe((list) => {
      this.usuarios = list || [];
    });

    this.store.loadUsuarios();
  }

  filteredItems(): any[] {
    const term = this.filtro.trim().toLowerCase();
    if (!term) return this.usuarios;

    return this.usuarios.filter((user) => {
      const nombre = this.getNombre(user).toLowerCase();
      const login = String(user?.dsLogin || '').toLowerCase();
      return nombre.includes(term) || login.includes(term);
    });
  }

  getNombre(usuario: any): string {
    return `${usuario?.dsNombre || ''} ${usuario?.dsApellido || ''}`.trim() || 'Sin nombre';
  }

  getId(usuario: any): number {
    return Number(usuario?.cdUsuario || usuario?.id || 0);
  }

  getRol(usuario: any): string {
    return usuario?.dsRol || 'Sin rol';
  }
}

