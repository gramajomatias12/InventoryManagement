import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatMenu } from './pat-menu';

describe('PatMenu', () => {
  let component: PatMenu;
  let fixture: ComponentFixture<PatMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
