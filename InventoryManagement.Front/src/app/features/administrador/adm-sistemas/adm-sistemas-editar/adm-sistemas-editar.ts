import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { finalize, skip, take } from 'rxjs';
import { AdministradorStore } from '../../administrador.store';
import { Loading } from '../../../../core/loading';
import { Notify } from '../../../../core/notify';
import { AdmSistemasEditarPerfil, PerfilDialogResult } from './adm-sistemas-editar-perfil/adm-sistemas-editar-perfil';
import { AdmSistemasEditarRol, RolDialogResult } from './adm-sistemas-editar-rol/adm-sistemas-editar-rol';

@Component({
  selector: 'app-adm-sistemas-editar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
  private readonly dialog = inject(MatDialog);
  public saveError = '';
  public rolSeleccionadoPorPerfil: Record<number, number | null> = {};

  public modoEditar = true;
  private sistemaOriginal: any = null;
  public rolesSistema: any[] = [];
  public perfilesSistema: any[] = [];

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

      this.setSeguridadDesdeSistema(sistema);
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

  abrirDialogPerfil(): void {
    const cdSistema = Number(this.form.value.id || 0);
    const prefijo = this.getPrefijo(this.form.value);
    if (!cdSistema || !prefijo) return;

    const ref = this.dialog.open(AdmSistemasEditarPerfil, {
      data: { cdSistema, prefijo },
      width: '440px',
    });

    ref.afterClosed().subscribe((result: PerfilDialogResult | undefined) => {
      if (!result) return;
      this.store.savePerfil({
        dsPerfil: result.dsPerfil,
        dsDescripcion: result.dsDescripcion,
        cdSistema: result.cdSistema,
        icBorrado: false,
      }).subscribe({
        next: () => {
          this.recargarSistema(cdSistema);
          this.notify.success('Perfil agregado correctamente.');
        },
        error: (err) => {
          console.error('Error agregando perfil:', err);
          this.notify.error('No se pudo agregar el perfil.');
        },
      });
    });
  }

  abrirDialogRol(cdPerfil: number, dsPerfil: string): void {
    const cdSistema = Number(this.form.value.id || 0);
    const prefijo = this.getPrefijo(this.form.value);
    if (!cdSistema || !prefijo || !cdPerfil) return;

    const ref = this.dialog.open(AdmSistemasEditarRol, {
      data: { cdSistema, prefijo, cdPerfil, dsPerfil },
      width: '440px',
    });

    ref.afterClosed().subscribe((result: RolDialogResult | undefined) => {
      if (!result) return;
      this.store.saveRol({
        dsRol: result.dsRol,
        dsNombre: result.dsNombre,
        dsDescripcion: result.dsDescripcion,
        cdSistema: result.cdSistema,
        icBorrado: false,
      }).subscribe({
        next: (res: any) => {
          // Vincular el rol recién creado al perfil
          const items = typeof res === 'string' ? JSON.parse(res) : res;
          const cdRolNuevo = Number(
            Array.isArray(items) ? items[0]?.id : items?.id ?? 0
          );
          if (cdRolNuevo) {
            this.store.savePerfilRol(result.cdPerfil, cdRolNuevo).subscribe({
              next: () => {
                this.recargarSistema(cdSistema);
                this.notify.success('Rol creado y vinculado al perfil.');
              },
              error: () => this.notify.error('Rol creado pero no se pudo vincular.'),
            });
          } else {
            this.recargarSistema(cdSistema);
            this.notify.success('Rol creado correctamente.');
          }
        },
        error: (err: any) => {
          console.error('Error agregando rol:', err);
          this.notify.error('No se pudo agregar el rol.');
        },
      });
    });
  }

  vincularRolPerfil(cdPerfil: number): void {
    const cdRol = Number(this.rolSeleccionadoPorPerfil[cdPerfil] || 0);
    const cdSistema = Number(this.form.value.id || 0);
    if (!cdPerfil || !cdRol || !cdSistema) return;

    this.store.savePerfilRol(cdPerfil, cdRol).subscribe({
      next: () => {
        this.rolSeleccionadoPorPerfil[cdPerfil] = null;
        this.recargarSistema(cdSistema);
        this.notify.success('Rol vinculado al perfil.');
      },
      error: (err) => {
        console.error('Error vinculando rol a perfil:', err);
        this.notify.error('No se pudo vincular el rol al perfil.');
      }
    });
  }

  getRolesDelPerfilObj(cdPerfil: number): any[] {
    const perfil = this.perfilesSistema.find((x: any) => Number(x?.cdPerfil) === Number(cdPerfil));
    return Array.isArray(perfil?.roles) ? perfil.roles : [];
  }

  getRolesDelPerfil(cdPerfil: number): string[] {
    return this.getRolesDelPerfilObj(cdPerfil)
      .map((x: any) => String(x?.dsNombre || x?.dsRol || '').trim())
      .filter((x: string) => !!x);
  }

  getRolesDisponibles(cdPerfil: number): any[] {
    const rolesYaVinculados = new Set(
      this.getRolesDelPerfilObj(cdPerfil).map((r: any) => Number(r.cdRol))
    );
    return this.rolesSistema.filter((rol: any) => !rolesYaVinculados.has(Number(rol.cdRol)));
  }

  private recargarSistema(cdSistema: number): void {
    this.loading.show();
    this.store.sistemas$.pipe(
      skip(1),
      take(1),
      finalize(() => this.loading.hide())
    ).subscribe((list) => {
      const sistema = Array.isArray(list) ? list.find((x: any) => this.getId(x) === cdSistema) : null;
      if (sistema) {
        this.setSeguridadDesdeSistema(sistema);
      }
    });
    this.store.loadSistemas();
  }

  private setSeguridadDesdeSistema(sistema: any): void {
    const cdSistema = this.getId(sistema);
    const prefijo = this.getPrefijo(sistema);
    const perfiles = Array.isArray(sistema?.perfiles) ? sistema.perfiles : [];
    const roles = Array.isArray(sistema?.roles) ? sistema.roles : [];

    this.rolesSistema = roles.filter((rol: any) => this.esDelSistema(rol?.cdSistema, rol?.dsRol, cdSistema, prefijo));

    this.perfilesSistema = perfiles
      .filter((perfil: any) => this.esDelSistema(perfil?.cdSistema, perfil?.dsPerfil, cdSistema, prefijo))
      .map((perfil: any) => {
        const rolesPerfil = Array.isArray(perfil?.roles) ? perfil.roles : [];
        return {
          ...perfil,
          roles: rolesPerfil.filter((rol: any) => this.esDelSistema(rol?.cdSistema, rol?.dsRol, cdSistema, prefijo)),
        };
      });

    this.rolSeleccionadoPorPerfil = {};
    for (const perfil of this.perfilesSistema) {
      const cdPerfil = Number(perfil?.cdPerfil || 0);
      if (cdPerfil > 0) {
        this.rolSeleccionadoPorPerfil[cdPerfil] = null;
      }
    }
  }

  private normalizarConPrefijo(nombre: string, prefijo: string): string {
    const valor = String(nombre || '').trim().toUpperCase();
    const pref = String(prefijo || '').trim().toUpperCase();
    if (!valor || !pref) return valor;
    if (valor.startsWith(pref + '_')) return valor;
    return `${pref}_${valor}`;
  }

  private esDelSistema(cdSistemaValor: any, clave: any, cdSistemaEsperado: number, prefijoEsperado: string): boolean {
    const sistemaOk = Number(cdSistemaValor || 0) === Number(cdSistemaEsperado || 0);
    const claveTexto = String(clave || '').trim().toUpperCase();
    const prefijo = String(prefijoEsperado || '').trim().toUpperCase();
    const prefijoOk = !!prefijo && claveTexto.startsWith(prefijo + '_');
    return sistemaOk || prefijoOk;
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
