import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { delay, of } from 'rxjs';
import { Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento.service';
import { firebaseTestProviders } from '../../testing/firebase-test-providers';
import { Formulario } from './formulario';

describe('Formulario', () => {
  let fixture: ComponentFixture<Formulario>;
  let routeId: string | null;
  const atualizarOrcamento = vi.fn();
  const orcamentoOriginal: Orcamento = {
    id_orcamento: 'orcamento-1',
    nome_projeto: 'Projeto original',
    data_orcamento: '2020-01-01',
    cliente: 'Cliente',
    prazo_de_entrega: '30 dias',
    valor_total: 100,
    status: 'Em produção',
    itens: [
      {
        descricao: 'Armário',
        med_largura: 1,
        med_altura: 1,
        med_profundidade: 1,
        material_por_metro3: 100,
        metro_movel3: 1,
        insumos: 0,
        taxa_mao_de_obra: 0,
        valor: 100,
      },
    ],
  };

  beforeEach(async () => {
    routeId = null;
    atualizarOrcamento.mockReset().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [Formulario],
      providers: [
        {
          provide: OrcamentoService,
          useValue: {
            obterOrcamento: () => of(orcamentoOriginal).pipe(delay(0)),
            obterRascunho: () => undefined,
            atualizarOrcamento,
            limparRascunho: vi.fn(),
          },
        },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeId } } },
        },
        ...firebaseTestProviders,
      ],
    }).compileComponents();
  });

  async function criarComponente(): Promise<Formulario> {
    fixture = TestBed.createComponent(Formulario);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('should create', async () => {
    expect(await criarComponente()).toBeTruthy();
  });

  it('updates an estimate with today’s date', async () => {
    routeId = 'orcamento-1';
    const component = await criarComponente();
    const data = new Date();
    const hoje = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

    expect(component.orcamentoId).toBe('orcamento-1');
    expect(component.form.valid).toBe(true);
    await component.salvar();

    expect(atualizarOrcamento).toHaveBeenCalledWith(
      'orcamento-1',
      expect.objectContaining({ data_orcamento: hoje }),
    );
  });
});
