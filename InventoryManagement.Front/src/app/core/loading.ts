import { Injectable } from '@angular/core';
import { BehaviorSubject, delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

//Este servicio se usa para hacer algo así: antes de una petición HTTP → show()
//cuando termina → hide()
//en la vista, un componente escucha loading$ para mostrar o esconder un spinner

export class Loading {
  //Crea una variable reactiva privada que guarda si la app está cargando o no.
  //Empieza en false → o sea, no está cargando.
  private _loading = new BehaviorSubject<boolean>(false);

  //Expone ese estado como un observable para que otros componentes se suscriban.
  //El delay(0) retrasa la emisión un instante mínimo; 
  // suele usarse para evitar ciertos errores de sincronización 
  // o de detección de cambios en Angular.
  public readonly loading$ = this._loading.asObservable().pipe(
    delay(0) 
  );

  // Cambia el estado a true. Activa el loading.
  show() { this._loading.next(true); }
  // Cambia el estado a false. Desactiva el loading.
  hide() { this._loading.next(false); }
}
