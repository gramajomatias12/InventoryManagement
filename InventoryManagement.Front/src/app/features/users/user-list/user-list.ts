import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips'; // Para etiquetas de Rol/Estado
import { UserStore } from '../user.store';
import { MatDialog } from '@angular/material/dialog';
import { UserForm } from '../user-form/user-form';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatSnackBarModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  // Definimos las columnas que queremos mostrar en la tabla
  displayedColumns: string[] = ['nombre', 'login', 'email', 'rol', 'estado', 'acciones'];

  // Exponemos el observable directamente a la vista
  private readonly usersStore = inject(UserStore);
  users$ = this.usersStore.users$;
  private dialog = inject(MatDialog);
  public isAdmin$ = this.usersStore.isAdmin$;
  private snackBar = inject(MatSnackBar);

  constructor() { }

  ngOnInit() {
    this.usersStore.loadUsers(); // Disparamos la carga inicial
  }

  editar(usuario: any) {
    //console.log('Editar:', usuario);
    this.abrirForm(usuario);
  }


  borrar(usuario: any) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { mensaje: `¿Estás seguro de que quieres eliminar a ${usuario.dsNombre}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ahora nos suscribimos aquí para reaccionar al éxito
        this.usersStore.deleteUser(usuario.cdUsuario).subscribe({
          next: () => {
            this.snackBar.open(`Usuario ${usuario.dsNombre} eliminado`, 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar'] // El mismo estilo verde que antes
            });

            // Recargamos la lista para que desaparezca de la tabla
            this.usersStore.loadUsers();
          },
          error: (err: any) => {
            console.error('Error al borrar:', err);
            // Opcional: SnackBar de error si tu interceptor no lo hace
          }
        });
      }
    });
  }


  abrirForm(usuario?: any) {
    const dialogRef = this.dialog.open(UserForm, {
      width: '450px',
      data: usuario
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ahora saveUser retorna un Observable, por lo que subscribe funciona
        this.usersStore.saveUser(result).subscribe({
          next: (res: any) => {
            this.snackBar.open('¡Usuario guardado correctamente!', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.usersStore.loadUsers();
          },
          error: (err: any) => {
            console.error('Error al guardar:', err);
          }
        });
      }
    });
  }

  // setRole(id: number) {
  //   // Accedemos al store para cambiar el usuario actual (solo para prueba)
  //   (this.usersStore as any)._currentUser.next({
  //     dsNombre: id === 1 ? 'Admin' : 'Operador',
  //     cdRol: id
  //   });
  // }
}
