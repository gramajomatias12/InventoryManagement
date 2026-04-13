import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize } from "rxjs";
import { Data } from "../../core/data";
import { Loading } from '../../core/loading';

@Injectable({ providedIn: 'root' })
export class PatrimonioStore {
    private readonly SISTEMA = 'PAT';


    private _categorias = new BehaviorSubject<any[]>([]);
    public categorias$ = this._categorias.asObservable();

    private readonly _proveedores = new BehaviorSubject<any[]>([]);
    public readonly proveedores$ = this._proveedores.asObservable();

    constructor(private data: Data, private loading: Loading) { }

    // --- MÉTODOS DE CATEGORÍAS ---

    loadCategorias() {
        this.loading.show();
        this.data.getEntidad('Categorias', this.SISTEMA)
            .pipe(finalize(() => this.loading.hide()))
            .subscribe({
                next: (res) => {
                    const list = typeof res === 'string' ? JSON.parse(res) : res;
                    this._categorias.next(list);
                },
                error: (err) => console.error('Error cargando categorías:', err)
            });
    }

    saveCategoria(categoria: any) {
        this.loading.show();
        return this.data.postEntidad('Categorias', categoria, this.SISTEMA).pipe(
            finalize(() => {
                this.loading.hide();
                this.loadCategorias(); // Recargamos la lista automáticamente
            })
        );
    }

    // --- MÉTODOS DE PROVEEDORES ---

    loadProveedores() {
        this.loading.show();
        this.data.getEntidad('Proveedores', this.SISTEMA)
            .pipe(finalize(() => this.loading.hide()))
            .subscribe({
                next: (res) => {
                    const list = typeof res === 'string' ? JSON.parse(res) : res;
                    this._proveedores.next(list);
                },
                error: (err) => console.error('Error cargando proveedores:', err)
            });
    }
}


