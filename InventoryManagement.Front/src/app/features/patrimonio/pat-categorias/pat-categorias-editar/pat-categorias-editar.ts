import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PatrimonioStore } from '../../patrimonio.store';
import { Loading } from '../../../../core/loading';

@Component({
  selector: 'app-pat-categorias-editar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './pat-categorias-editar.html',
  styleUrl: './pat-categorias-editar.scss',
})
export class PatCategoriasEditar implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PatrimonioStore);
  public readonly loading = inject(Loading);

  public modoEditar = true;
  private categoriaOriginal: any = null;

  form = this.fb.group({
    id: [0],
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    icBaja: [false],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.modoEditar = id === 0;

    this.store.categorias$.subscribe((list) => {
      if (!list || list.length === 0) return;
      if (id === 0) return;

      const categoria = list.find((x) => this.getId(x) === id);
      if (!categoria) return;

      this.categoriaOriginal = categoria;
      this.form.patchValue({
        id: this.getId(categoria),
        descripcion: this.getNombre(categoria),
        icBaja: this.getBaja(categoria),
      });
    });

    this.store.loadCategorias();
  }

  editar(): void {
    this.modoEditar = true;
  }

  cancelar(): void {
    if (!this.form.value.id) {
      this.router.navigate(['/patrimonio/categorias']);
      return;
    }

    if (this.categoriaOriginal) {
      this.form.patchValue({
        id: this.getId(this.categoriaOriginal),
        descripcion: this.getNombre(this.categoriaOriginal),
        icBaja: this.getBaja(this.categoriaOriginal),
      });
    }

    this.modoEditar = false;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = Number(this.form.value.id || 0);
    const descripcion = String(this.form.value.descripcion || '').trim();
    const icBaja = !!this.form.value.icBaja;

    const payload = {
      id,
      cdCategoria: id,
      descripcion,
      dsCategoria: descripcion,
      icBaja,
    };

    this.store.saveCategoria(payload).subscribe({
      next: () => this.router.navigate(['/patrimonio/categorias']),
      error: (err) => console.error('Error guardando categoria:', err),
    });
  }

  getTitulo(): string {
    return this.form.value.id ? String(this.form.value.descripcion || 'Categoria') : 'Nueva Categoria';
  }

  private getId(item: any): number {
    return Number(item?.id || item?.cdCategoria || 0);
  }

  private getNombre(item: any): string {
    return item?.descripcion || item?.dsCategoria || item?.nombre || '';
  }

  private getBaja(item: any): boolean {
    return !!item?.icBaja;
  }

}
