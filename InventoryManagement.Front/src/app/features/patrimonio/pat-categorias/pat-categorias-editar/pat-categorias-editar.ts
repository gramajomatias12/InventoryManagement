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
import { Notify } from '../../../../core/notify';

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
  private readonly notify = inject(Notify);
  public saveError = '';

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
    this.saveError = '';
    this.modoEditar = true;
  }

  cancelar(): void {
    this.saveError = '';
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
    this.saveError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Revisa los campos requeridos antes de guardar la categoria.';
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
      next: () => {
        this.router.navigate(['/patrimonio/categorias']).then((navigated) => {
          if (navigated) {
            this.notify.success(id ? 'Categoria actualizada correctamente.' : 'Categoria creada correctamente.');
          }
        });
      },
      error: (err) => {
        this.saveError = 'No se pudo guardar la categoria. Intenta nuevamente.';
        console.error('Error guardando categoria:', err);
      },
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
