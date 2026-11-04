import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firebaseTestProviders } from '../../testing/firebase-test-providers';
import { HeaderComponent } from './user';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        ...firebaseTestProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
