import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { AestheticProcedure, AestheticProcedurePayload } from '../models/proceeding.model';

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
/** Servico responsavel por integrar o catalogo do MFE com a API de proceedings. */
export class ProceedingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /** Carrega o catalogo da API e usa o mock local apenas como fallback de leitura. */
  listProceedings(): Observable<AestheticProcedure[]> {
    if (!this.apiUrl) {
      return of([...DEFAULT_PROCEEDINGS]);
    }

    return this.http.get<AestheticProcedure[]>(this.apiUrl).pipe(
      catchError(() => of([...DEFAULT_PROCEEDINGS]))
    );
  }

  /** Persiste um novo procedimento pela rota publicada da API. */
  registerProcedure(payload: AestheticProcedurePayload): Observable<AestheticProcedure> {
    if (!this.apiUrl) {
      return of({
        ...payload,
        id: payload.code.toLowerCase(),
        createdAt: new Date().toISOString()
      });
    }

    return this.http.post<AestheticProcedure>(this.apiUrl, payload);
  }
}
