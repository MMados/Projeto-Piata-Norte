import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsappSelectorComponent } from './whatsapp-selector';

describe('WhatsappSelectorComponent', () => {
  let component: WhatsappSelectorComponent;
  let fixture: ComponentFixture<WhatsappSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsappSelectorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});