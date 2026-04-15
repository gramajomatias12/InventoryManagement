import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-adm-sistema-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './adm-sistema-form.html',
  styleUrl: './adm-sistema-form.scss',
})
export class AdmSistemaForm {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AdmSistemaForm>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  sistemaForm: FormGroup = this.fb.group({
    id: [0],
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    prefijo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
    icBaja: [false],
  });

  ngOnInit() {
    if (this.data) {
      this.sistemaForm.patchValue({
        id: this.data.id ?? 0,
        descripcion: this.data.descripcion ?? '',
        prefijo: this.normalizarPrefijo(this.data.prefijo),
        icBaja: this.data.icBaja ?? false,
      });
    }
  }

  guardar() {
    if (this.sistemaForm.invalid) {
      this.sistemaForm.markAllAsTouched();
      return;
    }

    const value = this.sistemaForm.getRawValue();
    this.dialogRef.close({
      id: Number(value.id || 0),
      descripcion: String(value.descripcion || '').trim(),
      prefijo: this.normalizarPrefijo(value.prefijo),
      icBaja: !!value.icBaja,
    });
  }

  private normalizarPrefijo(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
  }
}
