import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatCategoriasEditar } from './pat-categorias-editar';

describe('PatCategoriasEditar', () => {
  let component: PatCategoriasEditar;
  let fixture: ComponentFixture<PatCategoriasEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatCategoriasEditar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatCategoriasEditar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
