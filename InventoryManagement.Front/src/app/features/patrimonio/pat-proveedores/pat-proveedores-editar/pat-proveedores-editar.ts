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
  selector: 'app-pat-proveedores-editar',
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
  templateUrl: './pat-proveedores-editar.html',
  styleUrl: './pat-proveedores-editar.scss',
})
export class PatProveedoresEditar implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PatrimonioStore);
  public readonly loading = inject(Loading);
  private readonly notify = inject(Notify);

  public modoEditar = true;
  private proveedorOriginal: any = null;
  public saveError = '';

  form = this.fb.group({
    id: [0],
    dsProveedor: ['', [Validators.required, Validators.minLength(3)]],
    dsDireccion: [''],
    dsTelefono: [''],
    dsEmail: ['', [Validators.email]],
    icActivo: [true],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.modoEditar = id === 0;

    this.store.proveedores$.subscribe((list) => {
      if (!list || list.length === 0) return;
      if (id === 0) return;

      const proveedor = list.find((x) => this.getId(x) === id);
      if (!proveedor) return;

      this.proveedorOriginal = proveedor;
      this.form.patchValue({
        id: this.getId(proveedor),
        dsProveedor: proveedor?.dsProveedor,
        dsDireccion: proveedor?.dsDireccion || '',
        dsTelefono: proveedor?.dsTelefono || '',
        dsEmail: proveedor?.dsEmail || '',
        icActivo: proveedor?.icActivo !== false,
      });
    });

    this.store.loadProveedores();
  }

  editar(): void {
    this.saveError = '';
    this.modoEditar = true;
  }

  cancelar(): void {
    this.saveError = '';
    if (!this.form.value.id) {
      this.router.navigate(['/patrimonio/proveedores']);
      return;
    }
    if (this.proveedorOriginal) {
      this.form.patchValue({
        id: this.getId(this.proveedorOriginal),
        dsProveedor: this.proveedorOriginal?.dsProveedor,
        dsDireccion: this.proveedorOriginal?.dsDireccion || '',
        dsTelefono: this.proveedorOriginal?.dsTelefono || '',
        dsEmail: this.proveedorOriginal?.dsEmail || '',
        icActivo: this.proveedorOriginal?.icActivo !== false,
      });
    }
    this.modoEditar = false;
  }

  guardar(): void {
    this.saveError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Revisa los campos requeridos antes de guardar el proveedor.';
      this.notify.error(this.saveError);
      return;
    }

    const proveedor = this.form.value;
    this.store.saveProveedores(proveedor).subscribe({
      next: () => {
        this.notify.success('Proveedor guardado');
        this.modoEditar = false;
        this.router.navigate(['/patrimonio/proveedores']);
      },
      error: (err) => {
        this.saveError = err?.mensaje || 'Error al guardar';
        this.notify.error(this.saveError);
      },
    });
  }

  getId(item: any): number {
    return Number(item?.id || item?.cdProveedor || 0);
  }

  getTitulo(): string {
    return this.form.value.dsProveedor || 'Nuevo Proveedor';
  }
}
