import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AestheticProcedure,
  AestheticProcedurePayload,
  PROCEEDINGS_STORAGE_KEY
} from '../models/proceeding.model';

type ProceduresMockModule = AestheticProcedure[] | { default: AestheticProcedure[] };
const defaultProceduresMock = require('../mock/default-procedures.json') as ProceduresMockModule;

const DEFAULT_PROCEDURES = (
  Array.isArray(defaultProceduresMock)
    ? defaultProceduresMock
    : (defaultProceduresMock as ProceduresMockModule).default
) as AestheticProcedure[];

@Injectable({
  providedIn: 'root'
})
/** Serviço responsável por ler e persistir o catálogo local de procedimentos estéticos do MFE. */
export class ProceedingService {
  /** Retorna o catálogo completo disponível no armazenamento local ou no mock inicial. */
  listProcedures(): Observable<AestheticProcedure[]> {
    return of(this.readProcedures());
  }

  /**
   * Registra um novo procedimento no catálogo local, gerando os metadados
   * mínimos necessários para que ele possa ser exibido na listagem.
   */
  registerProcedure(payload: AestheticProcedurePayload): Observable<AestheticProcedure> {
    const storedProcedures = this.readProcedures();
    const procedure: AestheticProcedure = {
      ...payload,
      id: this.generateId(payload.code),
      createdAt: new Date().toISOString()
    };

    const nextProcedures = [procedure, ...storedProcedures];
    this.writeProcedures(nextProcedures);
    return of(procedure);
  }

  /**
   * Lê o catálogo persistido. Quando não houver `localStorage` disponível
   * ou os dados estiverem ausentes/inválidos, utiliza o mock padrão do projeto.
   */
  private readProcedures(): AestheticProcedure[] {
    if (typeof globalThis.localStorage === 'undefined') {
      return [...DEFAULT_PROCEDURES];
    }

    const storedValue = globalThis.localStorage.getItem(PROCEEDINGS_STORAGE_KEY);
    if (!storedValue) {
      return [...DEFAULT_PROCEDURES];
    }

    try {
      const parsedValue = JSON.parse(storedValue) as AestheticProcedure[];
      return Array.isArray(parsedValue) && parsedValue.length > 0 ? parsedValue : [...DEFAULT_PROCEDURES];
    } catch {
      return [...DEFAULT_PROCEDURES];
    }
  }

  /** Persiste o catálogo serializado no `localStorage` para manter o estado entre recargas. */
  private writeProcedures(procedures: AestheticProcedure[]): void {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.setItem(PROCEEDINGS_STORAGE_KEY, JSON.stringify(procedures));
  }

  /** Gera um identificador estável para novos procedimentos, usando UUID quando disponível. */
  private generateId(code: string): string {
    if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
      return globalThis.crypto.randomUUID();
    }

    return `${code.toLowerCase()}-${Date.now()}`;
  }
}
