import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProceedingService } from './proceeding.service';
import { AestheticProcedure, AestheticProcedurePayload } from '../models/proceeding.model';

describe('ProceedingService', () => {
  let service: ProceedingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProceedingService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ProceedingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load proceedings from the API', (done) => {
    const response: AestheticProcedure[] = [
      {
        id: 'proc-1',
        name: 'Botox',
        category: 'Injetaveis',
        code: 'INJ-001',
        targetArea: 'Face',
        durationMinutes: 45,
        sessionPrice: 950,
        sessionCount: 1,
        recoveryTime: '24 horas',
        description: 'Suavizacao de rugas dinamicas.',
        active: true,
        createdAt: '2026-05-01T09:00:00.000Z'
      }
    ];

    service.listProceedings().subscribe((proceedings) => {
      expect(proceedings).toEqual(response);
      done();
    });

    const request = httpMock.expectOne('https://eri1s9zq97.execute-api.us-east-1.amazonaws.com/api/proceedings');
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should fallback to the seeded catalog when the API fails', (done) => {
    service.listProceedings().subscribe((proceedings) => {
      expect(proceedings.length).toBeGreaterThan(0);
      expect(proceedings[0]).toHaveProperty('category');
      done();
    });

    const request = httpMock.expectOne('https://eri1s9zq97.execute-api.us-east-1.amazonaws.com/api/proceedings');
    request.flush('fail', { status: 500, statusText: 'Server Error' });
  });

  it('should persist a new proceeding through the API', (done) => {
    const payload: AestheticProcedurePayload = {
      name: 'Bioestimulador de colageno',
      category: 'Injetaveis',
      code: 'INJ-040',
      targetArea: 'Face',
      durationMinutes: 60,
      sessionPrice: 1500,
      sessionCount: 3,
      recoveryTime: '24 horas',
      description: 'Protocolo para firmeza e melhora da qualidade da pele.',
      active: true
    };

    service.registerProcedure(payload).subscribe((proceeding) => {
      expect(proceeding.name).toBe(payload.name);
      expect(proceeding.code).toBe(payload.code);
      done();
    });

    const request = httpMock.expectOne('https://eri1s9zq97.execute-api.us-east-1.amazonaws.com/api/proceedings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      ...payload,
      id: 'new-id',
      createdAt: '2026-05-16T18:00:00.000Z'
    });
  });

  it('should fallback to the mock catalog when apiUrl is empty', (done) => {
    (service as any).apiUrl = '';

    service.listProceedings().subscribe((proceedings) => {
      expect(proceedings.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should build a local response when apiUrl is empty on save', (done) => {
    (service as any).apiUrl = '';

    const payload: AestheticProcedurePayload = {
      name: 'Peeling glow',
      category: 'Facial',
      code: 'FAC-999',
      targetArea: 'Rosto',
      durationMinutes: 30,
      sessionPrice: 199,
      sessionCount: 1,
      recoveryTime: 'Sem afastamento',
      description: 'Protocolo rapido para luminosidade.',
      active: true
    };

    service.registerProcedure(payload).subscribe((proceeding) => {
      expect(proceeding.id).toBe('fac-999');
      expect(proceeding.name).toBe(payload.name);
      done();
    });
  });
}
