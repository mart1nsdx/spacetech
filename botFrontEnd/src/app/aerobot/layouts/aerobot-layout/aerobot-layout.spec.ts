import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AerobotLayout } from './aerobot-layout';

describe('AerobotLayout', () => {
  let component: AerobotLayout;
  let fixture: ComponentFixture<AerobotLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AerobotLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(AerobotLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
