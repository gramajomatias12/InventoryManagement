import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Este servicio se encarga de hacer las peticiones HTTP al backend para obtener 
// o enviar datos.
// Tiene métodos genéricos para cualquier entidad, usando la URL base y 
// el nombre de la entidad.

@Injectable({
  providedIn: 'root',
})
export class Data {
    // Cambia el puerto (ej: 7245 o 5000) y la ruta según tu configuración
  private urlApi = 'http://localhost:5035/api/Entidad';

  constructor(private http: HttpClient) { }

  private getSistemaActual(): string {
    return localStorage.getItem('sistema_prefijo') || 'ADM';
  }

  private getSesionActual(): string {
    const uiSesion = localStorage.getItem('ui_sesion');
    if (uiSesion) {
      return uiSesion;
    }

    const rawUser = localStorage.getItem('user_data');
    if (!rawUser) {
      return '';
    }

    try {
      const user = JSON.parse(rawUser);
      return String(user?.sesion || '');
    } catch {
      return '';
    }
  }

  private buildHeaders(sistema?: string): Record<string, string> {
    return {
      'Sistema': sistema || this.getSistemaActual(),
      'X-Session-Id': this.getSesionActual(),
    };
  }

  getEntidad(entidad: string, sistema?: string): Observable<any> {
    const headers = this.buildHeaders(sistema);
    return this.http.get(`${this.urlApi}/${entidad}`, { headers });
  }

  postEntidad(entidad: string, objeto: any, sistema?: string): Observable<any> {
    const headers = this.buildHeaders(sistema);
    const body = { jsonParametros: JSON.stringify(objeto) };
    return this.http.post(`${this.urlApi}/${entidad}`, body, { headers });
  }
  
}
