---
name: angular-crud-component
description: "Genera componentes Angular CRUD (lista + edición) alineados con InventoryManagement. Usar cuando el usuario pida: generar componente para tabla, crear lista y editar, crear CRUD angular, generar componentes para entidad. Produce: carpeta {pre}-{entidad}/ con lista + sub-carpeta editar, store, rutas y form group."
argument-hint: "Modulo (patrimonio|administrador|login), prefijo, entidad, columnas SQL o tabla existente"
---

# Skill: Angular CRUD Component (InventoryManagement)

## Objetivo

Generar componentes Angular standalone para CRUD de una entidad dentro del módulo especificado, siguiendo la arquitectura del proyecto:

- **Store patern**: BehaviorSubjects + métodos load/save en un service injectable.
- **Componentes**: Lista (con filtrado) y Editar (ReactiveFormsModule).
- **Estructura**: `{modulo}/{pre}-{entidad}/` y `{modulo}/{pre}-{entidad}/{pre}-{entidad}-editar/`.
- **Rutas**: Integración en `{modulo}.ts` routes array.

## Cuando usar este skill

- El usuario tiene SQL (CREATE TABLE o scripts _S/_IU) y quiere generar lista + edición Angular.
- El usuario pide crear componentes CRUD para una entidad.

Frases gatillo:

- "generar componente para esta tabla"
- "crear lista y editar"
- "crear CRUD angular"
- "generar componentes para esta entidad"

## Arquitectura de ESTE proyecto

1. **Store patern**: `{Pre}{Modulo}Store` en `{modulo}/{modulo}.store.ts` con BehaviorSubjects y métodos `load{Entidad}`, `save{Entidad}`.
2. **Data service**: Genérico `Data` en `core/data.ts` (ya existe). Llama a `api/Entidad` con headers.
3. **Componentes**: Standalone, inyectan store y servicios con `inject()`.
4. **Modulo principal**: `{modulo}.ts` con RouterOutlet y rutas anidadas.
5. **Forms**: ReactiveFormsModule con FormBuilder y validadores.

Modulos actuales:

- `patrimonio` → `PatrimonioStore`, prefijo `PAT`
- `administrador` → `AdministradorStore`, prefijo `ADM`
- `login` → `LoginStore`, prefijo `AUTH`

## Estructura de archivos a generar

Para módulo `{modulo}` con entidad `{Entidad}` (ej: `patrimonio` + `Categorias`):

| # | Archivo | Contenido |
|---|---------|----------|
| 1 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}.ts` | Componente lista (injectable, Observable) |
| 2 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}.html` | Template lista (cards, filtro, botón nuevo) |
| 3 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}.scss` | Estilos lista |
| 4 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}-editar/{pre}-{entidad}-editar.ts` | Componente editar (FormGroup, ReactiveFormsModule) |
| 5 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}-editar/{pre}-{entidad}-editar.html` | Template editar (form fields, botones guardar/cancelar) |
| 6 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}-editar/{pre}-{entidad}-editar.scss` | Estilos editar |

## Archivos a MODIFICAR

| # | Archivo | Cambio |
|---|---------|--------|
| 7 | `{modulo}/{modulo}.store.ts` | Agregar BehaviorSubject `_{entidad}$` y métodos `load{Entidad}()`, `save{Entidad}(item)` |
| 8 | `{modulo}.ts` | Agregar rutas: `{ path: '{entidad}', component: ... }`, `{ path: '{entidad}/:id', component: ... }` |

Nota: No se genera interfaz separada; se usa `any` y se tipan en el store/componentes según necesidad.

## Convención de nombres

| Elemento | Ejemplo | Formato |
|----------|---------|---------|
| Carpeta | `{modulo}/{pre}-{entidad}/` | ej: `patrimonio/pat-categorias/` |
| Componente lista | clase: `Pat{Entidad}` | archivo: `pat-categorias.ts` |
| Componente editar | clase: `Pat{Entidad}Editar` | archivo: `pat-categorias-editar.ts` |
| Selector lista | `app-pat-{entidad}` | template: `<app-pat-categorias>` |
| Selector editar | `app-pat-{entidad}-editar` | template: `<app-pat-categorias-editar>` |
| FormGroup | `form` | reactive forms |
| Store método | `load{Entidad}()`, `save{Entidad}(item)` | en `PatrimonioStore` |
| BehaviorSubject | `_{entidad}$` | ej: `_categorias$` |
| Observable público | `{entidad}$` | ej: `categorias$` |

Ejemplo: tabla `PAT_Categorias`
- Carpeta: `patrimonio/pat-categorias/`
- Componente lista: `PatCategorias` en `pat-categorias.ts`
- Componente editar: `PatCategoriasEditar` en `pat-categorias-editar/pat-categorias-editar.ts`
- Store: métodos `loadCategorias()`, `saveCategorias(cat)` en `PatrimonioStore`
- Rutas: `categorias`, `categorias/:id`

## Datos de COLUMNA SQL → FormControl

| Prefijo | Tipo SQL | Tipo TS | FormControl | Material |
|---------|----------|--------|------------|----------|
| `cd` (PK) | `int` | `number` | `[0]` | (hidden) |
| `cd` (FK) | `int` | `number` | `[null]` | MatSelect (opcional) |
| `ds` (nombre) | `nvarchar(N)` | `string` | `['', Validators.required]` | MatInput |
| `ds` (otro) | `nvarchar(N)` | `string` | `['']` | MatInput |
| `dt` | `date`/`datetime` | `Date` | `[null]` | MatDatepicker (opcional) |
| `ic` (activo/baja) | `bit` | `boolean` | `[true]` / `[false]` | MatSlideToggle |
| `vl` | `int`/`float` | `number` | `[null]` | MatInput `type="number"` |

## Mapeo de columnas SQL → Interface/Form

### De CREATE TABLE a interface

Para cada columna (excepto la PK):

| Prefijo columna | Tipo SQL | Tipo TS (interface) | Alias JSON | Tipo FormControl |
|-----------------|----------|--------------------|-----------|-|
| `cd` (PK) | `int IDENTITY` | `number` | `id` | `FormControl(undefined)` |
| `Plantilla STORE

Métodos a agregar en `{modulo}.store.ts`:

```typescript
private _{entidad} = new BehaviorSubject<any[]>([]);
public readonly {entidad}$ = this._{entidad}.asObservable();

load{Entidad}() {
    this.loading.show();
    this.data.getEntidad('{Entidad}', this.SISTEMA)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe({
            next: (res) => {
                const list = typeof res === 'string' ? JSON.parse(res) : res;
                this._{entidad}.next(list);
            },
            error: (err) => console.error('Error cargando {entidad}:', err)
        });
}

save{Entidad}({entidad}: any) {
    this.loading.show();
    return this.data.postEntidad('{Entidad}', {entidad}, this.SISTEMA).pipe(
        finalize(() => {
            this.loading.hide();
            this.load{Entidad}(); // Recargamos automáticamente
        })
    
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { M2IoService } from '../../shared/m2-io.service';
import { {Pre}CallsService } from '../shared/{pre}-calls.service';
import { I{Pre}{Entidad} } from '../shared/{pre}-clases';
import { {Pre}IoService } from '../shared/{pre}-io.service';

@Component({
  selector: 'app-{pre}-{entidad}',
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatCardModule, MatIconModule,
    RouterModule, MatProgressBarModule, MatMenuModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './{pre}-{entidad}.component.html',
  styleUrl: './{pre}-{entidad}.component.scss'
})
export class {Pre}{Entidad}Component {
  public loading: WritableSignal<boolean> = signal(false);
  public items: I{Pre}{Entidad}[] = [];
  public activo?: number = 1;
  public searchTerm: string = '';
  public pageSize: number = 200;
  public currentPage: number = 0;
  public totalItems: number = 0;
  public displayedItems: I{Pre}{Entidad}[] = [];

  cPlantilla COMPONENTE LISTA

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { {Pre}{Modulo}Store } from '../{modulo}.store';
import { Loading } from '../../../core/loading';

@Component({
  selector: 'app-{pre}-{entidad}',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './{pre}-{entidad}.html',
  styleUrl: './{pre}-{entidad}.scss',
})
export class {Pre}{Entidad} implements OnInit {
  private readonly store = inject({Pre}{Modulo}Store);
  public readonly loading = inject(Loading);

  public {entidad}: any[] = [];
  public filtro = '';

  ngOnInit(): void {
    this.store.{entidad}$.subscribe((list) => {
      this.{entidad} = list || [];
    });

    this.store.load{Entidad}();
  }

  filteredItems(): any[] {
    const term = this.filtro.trim().toLowerCase();
    if (!term) return this.{entidad};

    return this.{entidad}.filter((item) => {
      const nombre = this.getNombre(item).toLowerCase();
      return nombre.includes(term);
    });
  }

  getNombre(item: any): string {
    // Adaptar según el campo de nombre real (ej: dsCategoria, dsNombre, descripcion)
    return item?.dsNombre || item?.dsDescripcion || item?.nombre || 'Sin nombre';
  }

  getId(item: any): number {
    // Adaptar según el campo de PK real (ej: cdCategoria, cdEntidad, id)
    return Number(item?.id || item?.cdEntidad || item?.cd{Entidad} || 0);
  }
}
```

## Plantilla COMPONENTE LISTA HTML

```html
<mat-toolbar class="toolbar-header">
    <mat-toolbar-row>
        <mat-icon>{icon}</mat-icon>
        <span style="margin-left: 12px;">Gestionar {Entidad}</span>
        <span class="spacer"></span>
        <button mat-stroked-button class="toolbar-action" [routerLink]="['/{modulo}/{entidad}', 0]">
            <mat-icon>add</mat-icon>
            Nuevo/Nueva
        </button>
    </mat-toolbar-row>

    <mat-toolbar-row class="controls-row">
        <mat-form-field appearance="outline" class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <mat-label>Buscar {entidad}</mat-label>
            <input matInput type="search" placeholder="Escribir nombre..." [(ngModel)]="filtro">
            @if(filtro && filtro.trim()) {
            <button matSuffix mat-icon-button (click)="filtro=''" aria-label="Limpiar">
                <mat-icon>close</mat-icon>
            </button>
            }
        </mat-form-field>
    </mat-toolbar-row>
</mat-toolbar>

<div class="content-container">
    @if(loading()) {
        <div class="loading-state">
            <p>Cargando...</p>
        </div>
    } @else if((filteredItems()).length === 0) {
        <div class="empty-state">
            <mat-icon>{icon}</mat-icon>
            <h2>Sin resultados</h2>
            <p>No hay {entidad} para mostrar</p>
        </div>
    } @else {
        <div class="items-grid">
            @for(item of filteredItems(); track getId(item)) {
            <mat-card class="item-card" [routerLink]="['/{modulo}/{entidad}', getId(item)]">
                <mat-card-header>
                    <div class="card-title">{{getNombre(item)}}</div>
                </mat-card-header>
            </mat-card>
            }
        </div>
    }
</div>
```

## Plantilla COMPONENTE EDITAR

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { {Pre}{Modulo}Store } from '../../{modulo}.store';
import { Loading } from '../../../../core/loading';
import { Notify } from '../../../../core/notify';

@Component({
  selector: 'app-{pre}-{entidad}-editar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './{pre}-{entidad}-editar.html',
  styleUrl: './{pre}-{entidad}-editar.scss',
})
export class {Pre}{Entidad}Editar implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject({Pre}{Modulo}Store);
  public readonly loading = inject(Loading);
  private readonly notify = inject(Notify);

  public modoEditar = true;
  private itemOriginal: any = null;
  public saveError = '';

  form = this.fb.group({
    id: [0],
    // Agregar campos segun tabla SQL (ej: dsNombre, icActivo, etc)
    // dsNombre: ['', [Validators.required, Validators.minLength(3)]],
    // icActivo: [true],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.modoEditar = id === 0;

    this.store.{entidad}$.subscribe((list) => {
      if (!list || list.length === 0) return;
      if (id === 0) return;

      const item = list.find((x) => this.getId(x) === id);
      if (!item) return;

      this.itemOriginal = item;
      this.form.patchValue({
        id: this.getId(item),
        // Mapear campos: this.getNombre(item), etc.
      });
    });

    this.store.load{Entidad}();
  }

  editar(): void {
    this.saveError = '';
    this.modoEditar = true;
  }

  cancelar(): void {
    this.saveError = '';
    if (!this.form.value.id) {
      this.router.navigate(['/{modulo}/{entidad}']);
      return;
    }
    if (this.itemOriginal) {
      this.form.patchValue({
        id: this.getId(this.itemOriginal),
        // Restaurar valores
      });
    }
    this.modoEditar = false;
  }

  guardar(): void {
    this.saveError = '';
    if (this.form.invalid) {
      this.notify.error('Validar campos requeridos');
      return;
    }

    const item = this.form.value;
    this.store.save{Entidad}(item).subscribe({
      next: () => {
        this.notify.success('{Entidad} guardado');
        this.modoEditar = false;
        this.router.navigate(['/{modulo}/{entidad}']);
      },
      error: (err) => {
        this.saveError = err?.mensaje || 'Error al guardar';
        this.notify.error(this.saveError);
      }
    });
  }

  getId(item: any): number {
    return Number(item?.id || item?.cd{Entidad} || 0);
  }
}
```

## Plantilla RUTAS

En `{modulo}.ts`, agregar a `{MODULO}_ROUTES`:

```typescript
{
  path: '{entidad}',
  component: {Pre}{Entidad},
  canActivate: [permissionGuard],
  data: { requiredRoles: ['{PREFIJO}_ADM', '{PREFIJO}_USU'] }
},
{
  path: '{entidad}/:id',
  component: {Pre}{Entidad}Editar,
  canActivate: [permissionGuard],
  data: { requiredRoles: ['{PREFIJO}_ADM', '{PREFIJO}_USU'] }
},
```

## Datos minimos a pedir

Si la solicitud llega incompleta, pedir:

1. Modulo destino (`patrimonio`, `administrador`, `login` u otro).
2. Prefijo de sistema (`PAT`, `ADM`, `AUTH`).
3. Nombre de entidad (ej: `Categorias`, `Usuarios`).
4. Tabla SQL física y PK.
5. Columnas principales (nombre, descripción, activo).
6. Filtros del listado (por qué campo búsqueda, ordenamiento).
7. Si requiere permisos especiales en las rutas.

## Entregable del skill

Cuando se use el skill, entregar:

1. 6 archivos `.ts`/`.html`/`.scss` nuevos (lista + editar).
2. Cambios en `{modulo}.store.ts` (métodos load/save).
3. Rutas nuevas a agregar en `{modulo}.ts`.
4. Checklist de validación (store inyectado, rutas OK, imports Material).at-icon { color: #666; }
}

.search-field {
  flex: 1;
  max-width: 400px;
  position: relative;
  top: 10px;
}

.results-count {
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
}

.content-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 128px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #666;
  mat-progress-bar { width: 300px; max-width: 100%; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  mat-icon { font-size: 80px; width: 80px; height: 80px; color: #bdbdbd; margin-bottom: 24px; }
  h2 { font-size: 1.75rem; font-weight: 500; color: #424242; margin: 0 0 12px 0; }
  p { font-size: 1rem; color: #757575; margin: 0 0 24px 0; }
}

.clases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.clase-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  &:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); }
  mat-card-header {
    background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
  }
  mat-card-content {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-light 0%, $color-primary 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba($color-primary, 0.3);
  mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
  &.inactivo {
    background: linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%);
    box-shadow: 0 4px 8px rgba(158, 158, 158, 0.3);
  }
}

.header-content { flex: 1; }

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba($color-primary, 0.1);
  color: darken($color-primary, 15%);
  font-weight: 500;
  font-size: 0.9rem;
  flex-shrink: 0;
  mat-icon { font-size: 18px; width: 18px; height: 18px; color: $color-primary; }
  &.inactivo {
    background: rgba(239, 83, 80, 0.12);
    color: #c62828;
    mat-icon { color: #ef5350; }
  }
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  mat-icon { font-size: 20px; width: 20px; height: 20px; color: $color-primary; }
  span { font-size: 0.95rem; }
}

.fixed-paginator {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  z-index: 100;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

.content-with-fixed-paginator { padding-bottom: 80px; }

@media (max-width: 768px) {
  .clases-grid { grid-template-columns: 1fr; }
  .content-container { padding: 16px; }
  .controls-row .search-field { max-width: 100%; }
}
```

## Template: Componente Editar (`.ts`)

```typescript
import { Component, WritableSignal, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { M2IoService } from '../../../shared/m2-io.service';
import { {Pre}CallsService } from '../../shared/{pre}-calls.service';
import { I{Pre}{Entidad} } from '../../shared/{pre}-clases';

@Component({
  selector: 'app-{pre}-{entidad}-editar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterModule, MatCardModule,
    FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSlideToggleModule, MatProgressSpinnerModule],
  templateUrl: './{pre}-{entidad}-editar.component.html',
  styleUrl: './{pre}-{entidad}-editar.component.scss'
})
export class {Pre}{Entidad}EditarComponent {
  public loading: WritableSignal<boolean> = signal(false);
  public modoEditar: WritableSignal<boolean> = signal(false);
  public id: number = 0;

  constructor(private route: ActivatedRoute, private router: Router,
              public c: {Pre}CallsService, public io: M2IoService) {
    this.id = parseInt(route.snapshot.paramMap.get("id") || '0');
    if (!this.id) {
      this.modoEditar.set(true);
    } else {
      this.cargar(this.id);
    }
  }

  public form: FormGroup = new FormGroup({
    id: new FormControl(undefined, []),
    // Agregar FormControls según las columnas de la tabla:
    // n: new FormControl('', [Validators.required, Validators.minLength(3)]),
    // desc: new FormControl('', []),
    // act: new FormControl(true, []),
  });

  editar() {
    this.modoEditar.set(true);
  }

  async cargar(id: number) {
    this.loading.set(true);
    try {
      let obj: any = await this.c.{Entidad}(id, 2);
      this.form.reset();
      this.form.patchValue(obj[0]);
    } catch (e) {
      this.io.mensaje('Error al cargar');
      console.log(e);
    } finally {
      this.loading.set(false);
    }
  }

  async guardar() {
    this.loading.set(true);
    try {
      let result: any = await this.c.guardar{Entidad}(this.form.value);
      this.modoEditar.set(false);
      if (!this.id && result?.length > 0 && result[0].id) {
        this.id = result[0].id;
        this.router.navigate(['/{modulo}/{entidad}', this.id]);
        await this.cargar(this.id);
      }
    } catch (e) {
      this.io.mensaje('Error al guardar');
      console.log(e);
    } finally {
      this.loading.set(false);
    }
  }

  cancelar() {
    this.cargar(this.id);
    this.modoEditar.set(false);
  }
}
```

## Template: Componente Editar (`.html`)

```html
<mat-toolbar class="toolbar-header">
    <mat-toolbar-row>
        <button mat-icon-button routerLink="/{modulo}/{entidad}">
            <mat-icon>arrow_back</mat-icon>
        </button>
        <mat-icon class="title-icon">{matIcon}</mat-icon>
        @if(!form.value.id){
        <span class="toolbar-title">{Nuevo/Nueva} {entidad_label}</span>
        }
        @else {
        <span class="toolbar-ellipsis toolbar-title">{{form.value.n}}</span>
        }
        <span class="spacer"></span>
        @if(!modoEditar()){
        <button mat-flat-button class="toolbar-action" (click)="editar()">
            <mat-icon>edit</mat-icon>
            EDITAR
        </button>
        }
        @else{
        <button mat-stroked-button class="toolbar-action" [hidden]="!form.value.id" (click)="cancelar()">
            CANCELAR
        </button>
        <button mat-flat-button class="toolbar-action" (click)="guardar()" [disabled]="form.invalid">
            <mat-icon>save</mat-icon>
            GUARDAR
        </button>
        }
    </mat-toolbar-row>
</mat-toolbar>

<div class="container">
    @if(loading()){
        <div class="loading-overlay">
            <mat-spinner></mat-spinner>
        </div>
    }

    @if(modoEditar()){
        <div class="edit-container">
            <div class="form-header">
                <div class="avatar-large">
                    <mat-icon>{matIcon}</mat-icon>
                </div>
                <div class="header-info">
                    <h2>{{ form.value.id ? 'Editar {entidad_label}' : '{Nuevo/Nueva} {entidad_label}' }}</h2>
                    <p>Complete la información</p>
                </div>
            </div>

            <mat-card class="form-card">
                <mat-card-content>
                    <form [formGroup]="form" (ngSubmit)="guardar()">
                        <div class="form-section">
                            <div class="section-title">
                                <mat-icon>assignment</mat-icon>
                                <h3>Datos</h3>
                            </div>

                            <!-- Generar un mat-form-field por cada campo editable -->
                            <!--
                            <mat-form-field class="full-width" appearance="outline">
                                <mat-label>{Label}</mat-label>
                                <input matInput type="text" placeholder="{placeholder}" formControlName="{alias}">
                                <mat-icon matPrefix>{icon}</mat-icon>
                            </mat-form-field>
                            -->
                        </div>

                        <!-- Sección estado (si tiene icActivo) -->
                        <div class="form-section">
                            <div class="section-title">
                                <mat-icon>settings</mat-icon>
                                <h3>Estado</h3>
                            </div>
                            <div class="toggle-container">
                                <mat-slide-toggle formControlName="act">
                                    @if(form.value.act){
                                        <span class="toggle-active">Activo</span>
                                    } @else {
                                        <span class="toggle-inactive">Inactivo</span>
                                    }
                                </mat-slide-toggle>
                            </div>
                        </div>
                    </form>
                </mat-card-content>
            </mat-card>
        </div>
    }
    @else{
        <div class="view-container">
            <div class="profile-header">
                <div class="avatar-large">
                    <mat-icon>{matIcon}</mat-icon>
                </div>
                <div class="profile-info">
                    <h1>{{form.value.n}}</h1>
                    <p class="profile-type">{entidad_label}</p>
                    @if(form.value.act){
                        <span class="status-badge active">Activo</span>
                    } @else {
                        <span class="status-badge inactive">Inactivo</span>
                    }
                </div>
            </div>

            <div class="info-grid">
                <!-- Agregar info-cards según los campos de la entidad -->
                <!--
                <mat-card class="info-card">
                    <mat-card-content>
                        <div class="info-item-header">
                            <mat-icon>{icon}</mat-icon>
                            <h3>{Label}</h3>
                        </div>
                        <p class="info-value">{{form.value.{alias} || 'No especificado'}}</p>
                    </mat-card-content>
                </mat-card>
                -->
            </div>
        </div>
    }
</div>
```

## Template: Componente Editar (`.scss`)

Usa el **mismo** patrón de estilos que la lista, adaptando colores del módulo. Incluir:
- Variables `$color-primary`, `$color-dark`, `$color-light`
- `.toolbar-header` con gradiente del módulo
- `.container` con `max-width: 1000px`, `margin: 0 auto`, `min-height: calc(100vh - 64px)`
- `.loading-overlay`, `.edit-container`, `.form-header`, `.avatar-large`
- `.form-card`, `.form-section`, `.section-title`, `.full-width`
- `.toggle-container` con `.toggle-active` / `.toggle-inactive`
- `.view-container`, `.profile-header`, `.profile-info`, `.status-badge`
- `.info-grid`, `.info-card`, `.info-item-header`, `.info-value`
- `@keyframes fadeIn`

(Copiar el SCSS de `asi-areas-editar.component.scss` como base y adaptar colores.)

## Template: Rutas (`{mod}.component.ts`)

Agregar al array `{PRE}_ROUTES`:

```typescript
import { {Pre}{Entidad}Component } from './{pre}-{entidad}/{pre}-{entidad}.component';
import { {Pre}{Entidad}EditarComponent } from './{pre}-{entidad}/{pre}-{entidad}-editar/{pre}-{entidad}-editar.component';

// Dentro de {PRE}_ROUTES:
{ path: '{entidad}', component: {Pre}{Entidad}Component },
{ path: '{entidad}/:id', component: {Pre}{Entidad}EditarComponent },
```

## Mapeo de tipos de campo a controles del form

| Tipo campo | Control HTML | Material component |
|-----------|--------------|-------------------|
| `nvarchar` corto | `<input matInput type="text">` | `mat-form-field` |
| `nvarchar(max)` | `<textarea matInput rows="3">` | `mat-form-field` |
| `int` (FK) | `<mat-select>` con opciones cargadas | `mat-form-field` + `mat-select` |
| `date` | `<input matInput [matDatepicker]>` | `mat-form-field` + `mat-datepicker` |
| `bit` (activo) | `<mat-slide-toggle>` | sección estado |
| `bit` (otro) | `<mat-checkbox>` | dentro de form-section |
| `char(1)` género | `<mat-select>` con opciones M/F/X | `mat-form-field` + `mat-select` |
| `time` | `<input matInput type="time">` | `mat-form-field` |
| `float` / `decimal` | `<input matInput type="number">` | `mat-form-field` |

## Reglas importantes

1. **Todos los campos en el form son opcionales** (`?:` en la interface) excepto `id`
2. **El form siempre tiene `id`** como primer FormControl con valor `undefined`
3. **El campo `act` (icActivo)** siempre va en una sección separada "Estado" con `mat-slide-toggle`
4. **El toolbar del editar siempre tiene botón volver** (`arrow_back`) que navega a la lista
5. **Modo vista vs edición** se controla con `modoEditar` signal — por defecto es vista, click editar cambia a form
6. **Si id=0** (ruta `/{entidad}/0`), entra directo en modo edición (nuevo)
7. **Después de guardar un nuevo item**, navega a la URL con el id retornado y recarga
8. **Los imports relativos** dependen de la profundidad: lista usa `../../shared/`, editar usa `../../../shared/`
9. **No generar test files** (.spec.ts) a menos que se solicite
10. **Los SCSS del editar** deben coincidir en colores con la lista del mismo módulo
