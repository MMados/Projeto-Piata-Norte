import { Injectable, inject } from '@angular/core';
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
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Orcamento, OrcamentoFormDraft } from '../models/orcamento.model';

@Injectable({
  providedIn: 'root'
})
export class OrcamentoService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private orcamentosRef = collection(this.firestore, 'orcamentos');
  private readonly rascunhosFormulario = new Map<string, OrcamentoFormDraft>();

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
   * Esta rotina é chamada quando o dashboard é aberto; não depende de
   * Cloud Functions nem de uma tarefa agendada no Firebase.
   *
   * Datas inválidas ou ausentes são ignoradas para evitar exclusões indevidas.
   */
  async eliminarOrcamentosAntigos(): Promise<number> {
    const dataLimite = this.obterDataLimiteSeisMeses();
    const consulta = await getDocs(this.orcamentosRef);

    const expirados = consulta.docs.filter((documento) => {
      const dataIso = this.converterDataParaIso(documento.data()['data_orcamento']);
      return dataIso !== null && dataIso < dataLimite;
    });

    // O Firestore permite até 500 operações por lote. Usamos 450 por segurança.
    for (let inicio = 0; inicio < expirados.length; inicio += 450) {
      const lote = writeBatch(this.firestore);
      const grupo = expirados.slice(inicio, inicio + 450);

      for (const documento of grupo) {
        lote.delete(documento.ref);
      }

      await lote.commit();
    }

    return expirados.length;
  }

  /** Retorna a data de seis meses atrás no formato AAAA-MM-DD. */
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

  /**
   * Normaliza as datas usadas pelo projeto. O formato AAAA-MM-DD é preservado
   * como data de calendário; Timestamp e datas ISO completas são convertidos.
   */
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

  // Consulta todos os orçamentos no Firestore em tempo real
  obterOrcamentos(): Observable<Orcamento[]> {
    return collectionData(this.orcamentosRef, { idField: 'id_orcamento' }) as Observable<Orcamento[]>;
  }

  obterOrcamento(id: string): Observable<Orcamento | undefined> {
    const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
    return docData(orcamentoRef, { idField: 'id_orcamento' }) as Observable<Orcamento | undefined>;
  }

  /**
   * Recupera o nome do usuário autenticado para registrar quem realizou
   * a última alteração do orçamento. O nome cadastrado no Firestore tem
   * prioridade; displayName e e-mail são alternativas de identificação.
   */
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
    } catch (erro) {
      // A identificação ainda pode ser feita pelo perfil do Firebase Auth.
      console.warn('Não foi possível consultar o nome do usuário no Firestore:', erro);
    }

    return usuarioAtual.displayName?.trim() || usuarioAtual.email || 'Usuário não identificado';
  }

  // Grava um novo orçamento já identificando quem o cadastrou.
  async criarOrcamento(orcamento: Orcamento) {
    const editor = await this.obterNomeEditor();
    return addDoc(this.orcamentosRef, { ...orcamento, editor });
  }

  // Toda atualização registra automaticamente o usuário responsável.
  async atualizarOrcamento(id: string, orcamento: Partial<Omit<Orcamento, 'id_orcamento'>>) {
    const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
    const editor = await this.obterNomeEditor();
    return updateDoc(orcamentoRef, { ...orcamento, editor });
  }

  // Remove um orçamento pelo ID
  eliminarOrcamento(id: string) {
    const docRef = doc(this.firestore, `orcamentos/${id}`);
    return deleteDoc(docRef);
  }
}