import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface RolDialogData {
  cdSistema: number;
  prefijo: string;
  cdPerfil: number;
  dsPerfil: string;
}

export interface RolDialogResult {
  dsRol: string;
  dsNombre: string;
  dsDescripcion?: string;
  cdSistema: number;
  cdPerfil: number;
}

@Component({
  selector: 'app-adm-sistemas-editar-rol',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './adm-sistemas-editar-rol.html',
  styleUrl: './adm-sistemas-editar-rol.scss',
})
export class AdmSistemasEditarRol {
  private readonly fb = inject(FormBuilder);
  public readonly dialogRef = inject(MatDialogRef<AdmSistemasEditarRol>);
  public readonly data = inject<RolDialogData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    dsRol: ['', [Validators.required, Validators.minLength(2)]],
    dsNombre: ['', [Validators.required, Validators.minLength(2)]],
    dsDescripcion: [''],
  });

  get previewRol(): string {
    const val = String(this.form.value.dsRol || '').trim().toUpperCase();
    if (!val) return `${this.data.prefijo}_...`;
    return val.startsWith(this.data.prefijo + '_') ? val : `${this.data.prefijo}_${val}`;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = String(this.form.value.dsRol || '').trim().toUpperCase();
    const pref = this.data.prefijo.toUpperCase();
    const dsRol = val.startsWith(pref + '_') ? val : `${pref}_${val}`;

    const result: RolDialogResult = {
      dsRol,
      dsNombre: String(this.form.value.dsNombre || '').trim(),
      dsDescripcion: this.form.value.dsDescripcion?.trim() || undefined,
      cdSistema: this.data.cdSistema,
      cdPerfil: this.data.cdPerfil,
    };

    this.dialogRef.close(result);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
