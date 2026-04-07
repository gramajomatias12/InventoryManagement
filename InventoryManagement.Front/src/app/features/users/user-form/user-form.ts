import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UserStore } from '../user.store';
import { Loading } from '../../../core/loading';

export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('dsPassword');
  const confirmPassword = control.get('confirmarContraseña');

  // Si los campos no coinciden, devolvemos un error personalizado
  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordsNoMatch: true }
    : null;
};

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm {

  private fb = inject(FormBuilder);
  private store = inject(UserStore);
  private dialogRef = inject(MatDialogRef<UserForm>);
  public loadingService = inject(Loading);

  isLoading$ = this.loadingService.loading$; // Para mostrar un spinner o deshabilitar el botón mientras cargan los roles

  // Recibimos los datos si es edición
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  userForm: FormGroup = this.fb.group({
    cdUsuario: [0],
    dsLogin: ['', [Validators.required, Validators.minLength(4)]],
    dsPassword: ['', [Validators.required, Validators.minLength(4)]],
    confirmarContraseña: ['', [Validators.required, Validators.minLength(4)]],
    dsNombre: ['', Validators.required],
    dsApellido: ['', Validators.required],
    dsEmail: ['', [Validators.required, Validators.email]],
    cdRol: [null, Validators.required],
    icActivo: [true]
  }, {
    validators: passwordsMatchValidator //Agregamos la validación al GRUPO
  });

  roles$ = this.store.roles$; // Para el combo de roles

  ngOnInit() {
    this.store.loadRoles(); // Cargamos los roles al abrir

    if (this.data) {
      // 1. Cargamos los datos básicos (Nombre, Login, etc.)
      this.userForm.patchValue(this.data);

      // 2. IMPORTANTE: En edición, el password NO debe ser obligatorio
      // Limpiamos los campos de password para que empiecen vacíos
      this.userForm.get('dsPassword')?.setValue('');
      this.userForm.get('confirmarContraseña')?.setValue('');

      // Quitamos el validador de 'required' solo para edición
      this.userForm.get('dsPassword')?.setValidators([Validators.minLength(4)]);
      this.userForm.get('confirmarContraseña')?.setValidators([Validators.minLength(4)]);
    }

    // Refrescamos las validaciones
    this.userForm.get('dsPassword')?.updateValueAndValidity();
    this.userForm.get('confirmarContraseña')?.updateValueAndValidity();
  }

  guardar() {
    if (this.userForm.valid) {
      const { confirmarContraseña, ...usuarioParaGuardar } = this.userForm.value;
      this.dialogRef.close(usuarioParaGuardar); // Mandamos el objeto sin el campo extra
    }
  }

}
