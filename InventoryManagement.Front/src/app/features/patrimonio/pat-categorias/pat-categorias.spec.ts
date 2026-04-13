import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatCategorias } from './pat-categorias';

describe('PatCategorias', () => {
  let component: PatCategorias;
  let fixture: ComponentFixture<PatCategorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatCategorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatCategorias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
