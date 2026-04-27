import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class Notify {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, action = 'Cerrar'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['success-snackbar'],
     // horizontalPosition: 'right',
     // verticalPosition: 'top',
    });
  }

  error(message: string, action = 'Cerrar'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['error-snackbar'],
     // horizontalPosition: 'right',
    //verticalPosition: 'top',
    });
  }
}