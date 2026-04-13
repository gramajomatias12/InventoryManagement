import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatInicio } from './pat-inicio';

describe('PatInicio', () => {
  let component: PatInicio;
  let fixture: ComponentFixture<PatInicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatInicio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatInicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
