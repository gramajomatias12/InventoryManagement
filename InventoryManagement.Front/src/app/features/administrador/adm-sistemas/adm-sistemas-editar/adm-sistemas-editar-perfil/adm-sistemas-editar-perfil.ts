import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface PerfilDialogData {
  cdSistema: number;
  prefijo: string;
}

export interface PerfilDialogResult {
  dsPerfil: string;
  dsDescripcion?: string;
  cdSistema: number;
}

@Component({
  selector: 'app-adm-sistemas-editar-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './adm-sistemas-editar-perfil.html',
  styleUrl: './adm-sistemas-editar-perfil.scss',
})
export class AdmSistemasEditarPerfil {
  private readonly fb = inject(FormBuilder);
  public readonly dialogRef = inject(MatDialogRef<AdmSistemasEditarPerfil>);
  public readonly data = inject<PerfilDialogData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    dsPerfil: ['', [Validators.required, Validators.minLength(2)]],
    dsDescripcion: [''],
  });

  get preview(): string {
    const val = String(this.form.value.dsPerfil || '').trim().toUpperCase();
    if (!val) return `${this.data.prefijo}_...`;
    return val.startsWith(this.data.prefijo + '_') ? val : `${this.data.prefijo}_${val}`;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = String(this.form.value.dsPerfil || '').trim().toUpperCase();
    const pref = this.data.prefijo.toUpperCase();
    const dsPerfil = val.startsWith(pref + '_') ? val : `${pref}_${val}`;

    const result: PerfilDialogResult = {
      dsPerfil,
      dsDescripcion: this.form.value.dsDescripcion?.trim() || undefined,
      cdSistema: this.data.cdSistema,
    };

    this.dialogRef.close(result);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
