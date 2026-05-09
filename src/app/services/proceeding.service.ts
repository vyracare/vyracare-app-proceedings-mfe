import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AestheticProcedure,
  AestheticProcedurePayload,
  PROCEEDINGS_STORAGE_KEY
} from '../models/proceeding.model';

type ProceedingsMockModule = AestheticProcedure[] | { default: AestheticProcedure[] };

const defaultProceedingsMock = require('../mock/default-procedures.json') as ProceedingsMockModule;
const DEFAULT_PROCEEDINGS = normalizeProceedingsMock(defaultProceedingsMock);

function normalizeProceedingsMock(mockModule: ProceedingsMockModule): AestheticProcedure[] {
  if (Array.isArray(mockModule)) {
    return mockModule;
  }

  return 'default' in mockModule ? mockModule.default : [];
}

@Injectable({
  providedIn: 'root'
})
/** Serviço responsável por ler e persistir o catálogo local de procedimentos estéticos do MFE. */
export class ProceedingService {
  /** Retorna o catálogo completo disponível no armazenamento local ou no mock inicial. */
  listProceedings(): Observable<AestheticProcedure[]> {
    return of(this.readProceedings());
  }

  /**
   * Registra um novo procedimento no catálogo local, gerando os metadados
   * mínimos necessários para que ele possa ser exibido na listagem.
   */
  registerProcedure(payload: AestheticProcedurePayload): Observable<AestheticProcedure> {
    const storedProceedings = this.readProceedings();
    const proceeding: AestheticProcedure = {
      ...payload,
      id: this.generateId(payload.code),
      createdAt: new Date().toISOString()
    };

    const nextProceedings = [proceeding, ...storedProceedings];
    this.writeProceedings(nextProceedings);
    return of(proceeding);
  }

  /**
   * Lê o catálogo persistido. Quando não houver `localStorage` disponível
   * ou os dados estiverem ausentes/inválidos, utiliza o mock padrão do projeto.
   */
  private readProceedings(): AestheticProcedure[] {
    if (typeof globalThis.localStorage === 'undefined') {
      return [...DEFAULT_PROCEEDINGS];
    }

    const storedValue = globalThis.localStorage.getItem(PROCEEDINGS_STORAGE_KEY);
    if (!storedValue) {
      return [...DEFAULT_PROCEEDINGS];
    }

    try {
      const parsedValue = JSON.parse(storedValue) as AestheticProcedure[];
      return Array.isArray(parsedValue) && parsedValue.length > 0 ? parsedValue : [...DEFAULT_PROCEEDINGS];
    } catch {
      return [...DEFAULT_PROCEEDINGS];
    }
  }

  /** Persiste o catálogo serializado no `localStorage` para manter o estado entre recargas. */
  private writeProceedings(proceedings: AestheticProcedure[]): void {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.setItem(PROCEEDINGS_STORAGE_KEY, JSON.stringify(proceedings));
  }

  /** Gera um identificador estável para novos procedimentos, usando UUID quando disponível. */
  private generateId(code: string): string {
    if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
      return globalThis.crypto.randomUUID();
    }

    return `${code.toLowerCase()}-${Date.now()}`;
  }
}
