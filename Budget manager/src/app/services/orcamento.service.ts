import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  docData,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Orcamento, OrcamentoFormDraft } from '../models/orcamento.model';

/** Encapsula leitura e gravação de orçamentos e rascunhos de edição. */
@Injectable({
  providedIn: 'root',
})
export class OrcamentoService {
  private readonly firestore: Firestore = inject(Firestore);
  private readonly auth: Auth = inject(Auth);
  private readonly injector = inject(EnvironmentInjector);
  private readonly orcamentosRef = collection(this.firestore, 'orcamentos');
  private readonly rascunhosFormulario = new Map<string, OrcamentoFormDraft>();

  /** Mantém temporariamente as alterações não salvas enquanto a prévia está aberta. */
  guardarRascunho(id: string, rascunho: OrcamentoFormDraft): void {
    this.rascunhosFormulario.set(id, rascunho);
  }

  obterRascunho(id: string): OrcamentoFormDraft | undefined {
    return this.rascunhosFormulario.get(id);
  }

  limparRascunhos(): void {
    this.rascunhosFormulario.clear();
  }

  limparRascunho(id: string): void {
    this.rascunhosFormulario.delete(id);
  }

  /**
   * Exclui orçamentos cuja data de criação seja anterior a seis meses.
   */
  async eliminarOrcamentosAntigos(): Promise<number> {
    return runInInjectionContext(this.injector, async () => {
      const dataLimite = this.obterDataLimiteSeisMeses();
      const consulta = await getDocs(this.orcamentosRef);

      const expirados = consulta.docs.filter((documento) => {
        const dataIso = this.converterDataParaIso(documento.data()['data_orcamento']);
        return dataIso !== null && dataIso < dataLimite;
      });

      for (let inicio = 0; inicio < expirados.length; inicio += 450) {
        const lote = writeBatch(this.firestore);
        const grupo = expirados.slice(inicio, inicio + 450);

        for (const documento of grupo) {
          lote.delete(documento.ref);
        }

        await lote.commit();
      }

      return expirados.length;
    });
  }

  private obterDataLimiteSeisMeses(): string {
    const hoje = new Date();
    const mesAlvo = hoje.getMonth() - 6;
    const ultimoDiaMesAlvo = new Date(hoje.getFullYear(), mesAlvo + 1, 0).getDate();
    const limite = new Date(
      hoje.getFullYear(),
      mesAlvo,
      Math.min(hoje.getDate(), ultimoDiaMesAlvo),
    );

    const ano = limite.getFullYear();
    const mes = String(limite.getMonth() + 1).padStart(2, '0');
    const dia = String(limite.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private converterDataParaIso(valor: unknown): string | null {
    if (typeof valor === 'string') {
      const texto = valor.trim();
      const correspondencia = texto.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/);
      if (!correspondencia) return null;

      const dataIso = correspondencia[1];
      const data = new Date(`${dataIso}T00:00:00.000Z`);
      return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === dataIso
        ? dataIso
        : null;
    }

    if (valor instanceof Date) {
      return Number.isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 10);
    }

    if (valor && typeof valor === 'object' && 'toDate' in valor) {
      const converter = (valor as { toDate?: unknown }).toDate;
      if (typeof converter === 'function') {
        const data = converter.call(valor);
        if (data instanceof Date && !Number.isNaN(data.getTime())) {
          return data.toISOString().slice(0, 10);
        }
      }
    }

    return null;
  }

  /** Observa a coleção de orçamentos usada pelo dashboard. */
  obterOrcamentos(): Observable<Orcamento[]> {
    return collectionData(this.orcamentosRef, { idField: 'id_orcamento' }) as Observable<Orcamento[]>;
  }

  /** Observa apenas os orçamentos exibidos como ativos no menu lateral. */
  obterOrcamentosEmProducao(): Observable<Orcamento[]> {
    const consulta = query(this.orcamentosRef, where('status', '==', 'Em produção'));
    return collectionData(consulta, { idField: 'id_orcamento' }) as Observable<Orcamento[]>;
  }

  /** Observa um documento específico durante a edição ou pré-visualização. */
  obterOrcamento(id: string): Observable<Orcamento | undefined> {
    const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
    return docData(orcamentoRef, { idField: 'id_orcamento' }) as Observable<Orcamento | undefined>;
  }

  private async obterNomeEditor(): Promise<string> {
    const usuarioAtual = this.auth.currentUser;

    if (!usuarioAtual) {
      throw new Error('Não há usuário autenticado para registrar o editor do orçamento.');
    }

    try {
      const usuarioRef = doc(this.firestore, `users/${usuarioAtual.uid}`);
      const usuarioSnapshot = await getDoc(usuarioRef);
      const nomeCadastrado = usuarioSnapshot.data()?.['nome'];

      if (typeof nomeCadastrado === 'string' && nomeCadastrado.trim()) {
        return nomeCadastrado.trim();
      }
    } catch {
      console.warn('Não foi possível consultar o nome do usuário no Firestore.');
    }

    return usuarioAtual.displayName?.trim() || usuarioAtual.email || 'Usuário não identificado';
  }

  /** Cria um documento e registra o usuário que realizou a operação. */
  async criarOrcamento(orcamento: Orcamento) {
    return runInInjectionContext(this.injector, async () => {
      const editor = await this.obterNomeEditor();
      return addDoc(this.orcamentosRef, { ...orcamento, editor });
    });
  }

  /** Atualiza os campos fornecidos, renova a data e registra o editor atual. */
  async atualizarOrcamento(id: string, orcamento: Partial<Omit<Orcamento, 'id_orcamento'>>) {
    return runInInjectionContext(this.injector, async () => {
      const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
      const editor = await this.obterNomeEditor();
      return updateDoc(orcamentoRef, {
        ...orcamento,
        data_orcamento: this.hojeIso(),
        editor,
      });
    });
  }

  private hojeIso(): string {
    const data = new Date();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${data.getFullYear()}-${mes}-${dia}`;
  }

  /** Exclui um orçamento pelo ID mantendo o contexto de injeção ativo. */
  async eliminarOrcamento(id: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `orcamentos/${id}`);
      await deleteDoc(docRef);
    });
  }
}