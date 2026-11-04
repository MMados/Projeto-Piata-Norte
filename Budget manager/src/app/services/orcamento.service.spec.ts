import { TestBed } from "@angular/core/testing";
import { OrcamentoService } from "./orcamento.service";

describe("OrcamentoService", () => {
  let service: OrcamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: OrcamentoService, useValue: {} }],
    });
    service = TestBed.inject(OrcamentoService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
