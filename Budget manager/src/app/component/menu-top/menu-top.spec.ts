import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from '@angular/router';
import { firebaseTestProviders } from '../../testing/firebase-test-providers';
import { MenuTop } from "./menu-top";

describe("MenuTop", () => {
  let component: MenuTop;
  let fixture: ComponentFixture<MenuTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTop],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        ...firebaseTestProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuTop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
