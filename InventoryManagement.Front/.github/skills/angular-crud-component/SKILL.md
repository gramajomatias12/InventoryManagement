---
name: angular-crud-component
description: "Genera componentes Angular CRUD (lista + edicion) alineados con InventoryManagement. Usar cuando el usuario pida: generar componente para tabla, crear lista y editar, crear CRUD angular, generar componentes para entidad. Produce componentes standalone, cambios en store, rutas y estilo visual consistente con el modulo."
argument-hint: "Modulo (patrimonio|administrador|login), prefijo, entidad, columnas SQL o tabla existente"
---

# Skill: Angular CRUD Component (InventoryManagement)

## Objetivo

Generar componentes Angular standalone para CRUD de una entidad dentro del modulo especificado, siguiendo la arquitectura real del proyecto.

Incluye:

- Componente de lista con filtro y navegacion.
- Componente de editar/ver detalle con Reactive Forms.
- Integracion con store del modulo.
- Rutas nuevas dentro de `{modulo}.ts`.
- Estilo visual consistente con el lenguaje ya existente del modulo.

## Cuando usar este skill

- El usuario ya tiene tabla SQL o stored procedures y quiere lista + editar en Angular.
- El usuario pide crear CRUD Angular para una entidad nueva.
- El usuario quiere completar store, rutas y vistas de una entidad basada en el backend generico `api/Entidad`.

Frases gatillo:

- "generar componente para esta tabla"
- "crear lista y editar"
- "crear CRUD angular"
- "generar componentes para esta entidad"
- "agregame el componente angular"

## Arquitectura del proyecto

1. Store pattern: cada modulo tiene un store injectable con `BehaviorSubject` y metodos `load{Entidad}` y `save{Entidad}`.
2. Data service: `src/app/core/data.ts` expone `getEntidad()` y `postEntidad()` contra `api/Entidad`.
3. Componentes: standalone, usando `inject()`.
4. Modulo principal: `{modulo}.ts` con `RouterOutlet` y rutas hijas.
5. Formularios: `ReactiveFormsModule`, `FormBuilder`, `Validators`.

Modulos actuales:

- `patrimonio` -> `PatrimonioStore`, prefijo `PAT`
- `administrador` -> `AdministradorStore`, prefijo `ADM`
- `login` -> `LoginStore`, prefijo `AUTH`

## Estilo visual obligatorio

- No usar la maqueta basica de `mat-toolbar` + `content-container` si el modulo ya tiene un lenguaje visual mas rico.
- Para `patrimonio`, tomar como referencia directa `pat-categorias` y `pat-categorias-editar`.
- La lista debe usar hero superior, panel de estadisticas, buscador integrado, tarjetas con `surface-panel` y estados `loading`, `empty` y `no-results`.
- El editar debe usar hero superior con acciones, overlay de loading con `mat-spinner`, cabecera de formulario o perfil y cards informativas en modo lectura.
- Reutilizar la misma paleta, radios, sombras, espaciados y nombres de clases cuando el modulo ya tenga un sistema visual definido.
- En templates, para loading usar `loading.loading$ | async`, no `loading()`.

## Estructura de archivos a generar

Para modulo `{modulo}` con entidad `{Entidad}`:

| # | Archivo | Contenido |
|---|---------|----------|
| 1 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}.ts` | Componente lista |
| 2 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}.html` | Template lista |
| 3 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}.scss` | Estilos lista |
| 4 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}-editar/{pre}-{entidad}-editar.ts` | Componente editar |
| 5 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}-editar/{pre}-{entidad}-editar.html` | Template editar |
| 6 | `{modulo}/{pre}-{entidad}/{pre}-{entidad}-editar/{pre}-{entidad}-editar.scss` | Estilos editar |

## Archivos a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 7 | `{modulo}/{modulo}.store.ts` | Agregar `BehaviorSubject`, observable publico y metodos `load{Entidad}()` / `save{Entidad}()` |
| 8 | `{modulo}/{modulo}.ts` | Agregar imports y rutas `{entidad}` y `{entidad}/:id` |

Nota: por ahora este proyecto trabaja mayormente con `any` en stores y componentes. No generar interfaces separadas salvo que el usuario lo pida.

## Convenciones de nombres

| Elemento | Formato | Ejemplo |
|----------|---------|---------|
| Carpeta | `{modulo}/{pre}-{entidad}/` | `patrimonio/pat-categorias/` |
| Componente lista | `{Pre}{Entidad}` | `PatCategorias` |
| Componente editar | `{Pre}{Entidad}Editar` | `PatCategoriasEditar` |
| Selector lista | `app-{pre}-{entidad}` | `app-pat-categorias` |
| Selector editar | `app-{pre}-{entidad}-editar` | `app-pat-categorias-editar` |
| Store metodo | `load{Entidad}()`, `save{Entidad}(item)` | `loadCategorias()`, `saveCategoria(item)` |
| Subject privado | `_{entidad}` | `_categorias` |
| Observable publico | `{entidad}$` | `categorias$` |

Reglas practicas:

- La ruta usa plural o la forma ya elegida por el modulo: `categorias`, `proveedores`.
- El metodo `save...` debe respetar el patron que ya exista en el store. Si el modulo usa singular, continuar con singular.
- El campo nombre debe mapear al nombre real de la entidad, no a placeholders genericos.

## Mapeo SQL -> FormControl

| Prefijo | Tipo SQL | Tipo TS | FormControl sugerido | UI |
|---------|----------|---------|----------------------|----|
| `cd` PK | `int identity` | `number` | `[0]` | oculto |
| `cd` FK | `int` | `number` | `[null]` | `MatSelect` si aplica |
| `ds` nombre | `nvarchar` | `string` | `['', [Validators.required, Validators.minLength(3)]]` | `MatInput` |
| `ds` otro | `nvarchar` | `string` | `['']` | `MatInput` |
| `ic` | `bit` | `boolean` | `[true]` o `[false]` | `MatSlideToggle` |
| `vl` | `int` o `float` | `number` | `[null]` | `MatInput type=number` |
| `dt` | `date` o `datetime` | `Date` | `[null]` | `MatDatepicker` si aplica |

## Plantilla store

Agregar en `{modulo}.store.ts`:

```typescript
private readonly _{entidad} = new BehaviorSubject<any[]>([]);
public readonly {entidad}$ = this._{entidad}.asObservable();

load{Entidad}() {
    this.loading.show();
    this.data.getEntidad('{Entidad}', this.SISTEMA)
        .pipe(finalize(() => this.loading.hide()))
        .subscribe({
            next: (res) => {
                const list = typeof res === 'string' ? JSON.parse(res) : res;
                this._{entidad}.next(list || []);
            },
            error: (err) => console.error('Error cargando {entidad}:', err)
        });
}

save{Entidad}(item: any) {
    this.loading.show();
    return this.data.postEntidad('{Entidad}', item, this.SISTEMA).pipe(
        finalize(() => {
            this.loading.hide();
            this.load{Entidad}();
        })
    );
}
```

## Plantilla componente lista TS

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { {Pre}{Modulo}Store } from '../{modulo}.store';
import { Loading } from '../../../core/loading';

@Component({
  selector: 'app-{pre}-{entidad}',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
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
    return item?.dsNombre || item?.dsDescripcion || item?.descripcion || '';
  }

  getId(item: any): number {
    return Number(item?.id || item?.cd{Entidad} || 0);
  }
}
```

## Plantilla componente lista HTML

Usar como referencia estructural el patron visual del modulo. Para `patrimonio`, replicar el enfoque de `pat-categorias`:

```html
<section class="crud-page patrimonio-theme">
    <header class="section-hero">
        <div class="hero-copy">
            <span class="hero-kicker">Patrimonio</span>
            <h1>{TituloEntidad}</h1>
            <p>{Descripcion funcional de la entidad}</p>
        </div>

        <a mat-flat-button class="hero-action" [routerLink]="['/{modulo}/{entidad}', 0]">
            <mat-icon>add</mat-icon>
            {Texto alta}
        </a>
    </header>

    <div class="container">
        @if(loading.loading$ | async){
        <div class="feedback-card loading-container">
            <div>
                <h2>Cargando {entidad}</h2>
                <p>{Texto de carga}</p>
            </div>
        </div>
        }
        @else if({entidad}.length === 0){
        <div class="feedback-card empty-state">
            <mat-icon class="empty-icon">{icono}</mat-icon>
            <h2>No hay {entidad} registrados</h2>
            <p>{Texto vacio}</p>
        </div>
        }
        @else {
        <div class="surface-panel header-section">
            <!-- stats + search -->
        </div>

        @if(filteredItems().length === 0){
        <div class="feedback-card no-results">
            <mat-icon>search_off</mat-icon>
            <h3>No se encontraron resultados</h3>
            <p>No hay coincidencias con "{{ filtro }}"</p>
        </div>
        }
        @else {
        <div class="items-grid">
            @for(item of filteredItems(); track getId(item)) {
            <mat-card class="item-card" [routerLink]="['/{modulo}/{entidad}', getId(item)]">
                <!-- card content -->
            </mat-card>
            }
        </div>
        }
        }
    </div>
</section>
```

## Plantilla componente editar TS

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
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
    // Completar segun columnas reales
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.modoEditar = id === 0;

    this.store.{entidad}$.subscribe((list) => {
      if (!list || list.length === 0 || id === 0) return;

      const item = list.find((x) => this.getId(x) === id);
      if (!item) return;

      this.itemOriginal = item;
      this.form.patchValue({
        id: this.getId(item),
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
      });
    }

    this.modoEditar = false;
  }

  guardar(): void {
    this.saveError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Revisa los campos requeridos antes de guardar.';
      this.notify.error(this.saveError);
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
      },
    });
  }

  getId(item: any): number {
    return Number(item?.id || item?.cd{Entidad} || 0);
  }
}
```

## Plantilla componente editar HTML

Usar como referencia estructural el patron de `pat-categorias-editar`:

```html
<section class="detail-page patrimonio-theme">
    <header class="detail-hero">
        <div class="hero-main">
            <a mat-stroked-button class="back-link" routerLink="/{modulo}/{entidad}">
                <mat-icon>arrow_back</mat-icon>
                Volver
            </a>
            <span class="hero-kicker">Patrimonio</span>
            <h1>{{ getTitulo ? getTitulo() : '{TituloEntidad}' }}</h1>
            <p>{Descripcion del detalle}</p>
        </div>

        <div class="hero-actions">
            <!-- editar / cancelar / guardar -->
        </div>
    </header>

    <div class="container">
        @if(loading.loading$ | async){
        <div class="loading-overlay">
            <mat-spinner></mat-spinner>
        </div>
        }

        @if(modoEditar){
        <div class="edit-container">
            <!-- header + form -->
        </div>
        }
        @else {
        <div class="view-container">
            <!-- profile header + info cards -->
        </div>
        }
    </div>
</section>
```

## Rutas

En `{modulo}.ts`, agregar:

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

1. Modulo destino.
2. Prefijo de sistema.
3. Nombre de la entidad.
4. Tabla SQL o stored procedures existentes.
5. PK real y campo nombre principal.
6. Columnas visibles del listado.
7. Campos editables y validaciones.
8. Roles requeridos para las rutas.

## Checklist de salida

Cuando uses este skill, entrega:

1. Los 6 archivos `.ts` / `.html` / `.scss` de lista y editar.
2. Los cambios del store.
3. Las rutas nuevas.
4. La verificacion minima:
   - imports Material correctos
   - `loading.loading$ | async` en templates
   - metodo `save...` agregado al store
   - rutas apuntando a componentes standalone correctos
   - estilos alineados con el modulo
