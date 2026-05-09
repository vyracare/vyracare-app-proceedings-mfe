import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import defaultProceduresMock from '../mock/default-procedures.json';
import {
  AestheticProcedure,
  AestheticProcedurePayload,
  PROCEEDINGS_STORAGE_KEY
} from '../models/proceeding.model';

const DEFAULT_PROCEDURES = defaultProceduresMock as AestheticProcedure[];

@Injectable({
  providedIn: 'root'
})
export class ProceedingService {
  listProcedures(): Observable<AestheticProcedure[]> {
    return of(this.readProcedures());
  }

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

  private writeProcedures(procedures: AestheticProcedure[]): void {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.setItem(PROCEEDINGS_STORAGE_KEY, JSON.stringify(procedures));
  }

  private generateId(code: string): string {
    if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
      return globalThis.crypto.randomUUID();
    }

    return `${code.toLowerCase()}-${Date.now()}`;
  }
}
