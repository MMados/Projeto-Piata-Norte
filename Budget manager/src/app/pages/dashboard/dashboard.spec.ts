import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OrcamentoService } from '../../services/orcamento.service';
import { firebaseTestProviders } from '../../testing/firebase-test-providers';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  const criarOrcamento = vi.fn();

  beforeEach(async () => {
    criarOrcamento.mockReset();
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        {
          provide: OrcamentoService,
          useValue: {
            limparRascunhos: vi.fn(),
            obterOrcamentos: () => of([]),
            eliminarOrcamentosAntigos: async () => 0,
            criarOrcamento,
          },
        },
        provideRouter([]),
        ...firebaseTestProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('duplicates an estimate with today’s date', async () => {
    const data = new Date();
    const hoje = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

    await component.duplicarOrcamento({
      id_orcamento: 'orcamento-1',
      nome_projeto: 'Projeto de teste',
      data_orcamento: '2020-01-01',
      cliente: 'Cliente',
      valor_total: 0,
      status: 'Em produção',
      itens: [],
    });

    expect(criarOrcamento).toHaveBeenCalledWith(
      expect.objectContaining({ data_orcamento: hoje }),
    );
  });
});
