import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaserWrapperComponent } from './phaser-wrapper.component';

describe('PhaserWrapperComponent', () => {
  let component: PhaserWrapperComponent;
  let fixture: ComponentFixture<PhaserWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhaserWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhaserWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
