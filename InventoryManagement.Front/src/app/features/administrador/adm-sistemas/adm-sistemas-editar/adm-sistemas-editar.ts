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
import { AdministradorStore } from '../../administrador.store';
import { Loading } from '../../../../core/loading';
import { Notify } from '../../../../core/notify';

@Component({
  selector: 'app-adm-sistemas-editar',
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
  templateUrl: './adm-sistemas-editar.html',
  styleUrl: './adm-sistemas-editar.scss',
})
export class AdmSistemasEditar implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(AdministradorStore);
  public readonly loading = inject(Loading);
  private readonly notify = inject(Notify);
  public saveError = '';

  public modoEditar = true;
  private sistemaOriginal: any = null;

  form = this.fb.group({
    id: [0],
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    prefijo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
    icBaja: [false],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.modoEditar = id === 0;

    this.store.sistemas$.subscribe((list) => {
      if (!list || list.length === 0) return;
      if (id === 0) return;

      const sistema = list.find((x) => this.getId(x) === id);
      if (!sistema) return;

      this.sistemaOriginal = sistema;
      this.form.patchValue({
        id: this.getId(sistema),
        descripcion: this.getNombre(sistema),
        prefijo: this.getPrefijo(sistema),
        icBaja: !!sistema?.icBaja,
      });
    });

    this.store.loadSistemas();
  }

  editar(): void {
    this.saveError = '';
    this.modoEditar = true;
  }

  cancelar(): void {
    this.saveError = '';
    if (!this.form.value.id) {
      this.router.navigate(['/administrador/sistemas']);
      return;
    }

    if (this.sistemaOriginal) {
      this.form.patchValue({
        id: this.getId(this.sistemaOriginal),
        descripcion: this.getNombre(this.sistemaOriginal),
        prefijo: this.getPrefijo(this.sistemaOriginal),
        icBaja: !!this.sistemaOriginal?.icBaja,
      });
    }

    this.modoEditar = false;
  }

  guardar(): void {
    this.saveError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Revisa la descripcion y el prefijo antes de guardar el sistema.';
      return;
    }

    const payload = {
      id: Number(this.form.value.id || 0),
      descripcion: String(this.form.value.descripcion || '').trim(),
      prefijo: this.getPrefijo(this.form.value),
      icBaja: !!this.form.value.icBaja,
    };

    this.store.saveSistema(payload).subscribe({
      next: () => {
        this.router.navigate(['/administrador/sistemas']).then((navigated) => {
          if (navigated) {
            this.notify.success(payload.id ? 'Sistema actualizado correctamente.' : 'Sistema creado correctamente.');
          }
        });
      },
      error: (err) => {
        this.saveError = 'No se pudo guardar el sistema. Intenta nuevamente.';
        console.error('Error guardando sistema:', err);
      },
    });
  }

  getTitulo(): string {
    return this.form.value.id ? String(this.form.value.descripcion || 'Sistema') : 'Nuevo Sistema';
  }

  private getId(item: any): number {
    return Number(item?.id || item?.cdSistema || 0);
  }

  private getNombre(item: any): string {
    return item?.descripcion || item?.dsSistema || item?.nombre || '';
  }

  private getPrefijo(item: any): string {
    return String(item?.prefijo || item?.dsPrefijo || '').trim().toUpperCase();
  }
}
