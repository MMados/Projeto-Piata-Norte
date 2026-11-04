import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LadingPageComponent } from './lading-page';

describe('LadingPage', () => {
  let component: LadingPageComponent;
  let fixture: ComponentFixture<LadingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LadingPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LadingPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
