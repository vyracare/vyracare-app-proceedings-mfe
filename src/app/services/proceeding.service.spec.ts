import { TestBed } from '@angular/core/testing';
import { ProceedingService } from './proceeding.service';
import {
  AestheticProcedure,
  AestheticProcedurePayload,
  PROCEEDINGS_STORAGE_KEY
} from '../models/proceeding.model';

describe('ProceedingService', () => {
  let service: ProceedingService;
  const originalLocalStorage = globalThis.localStorage;
  const originalCrypto = globalThis.crypto;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ProceedingService]
    });

    service = TestBed.inject(ProceedingService);
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage
    });

    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto
    });

    jest.restoreAllMocks();
  });

  it('should return the seeded catalog when there is no local data', (done) => {
    service.listProceedings().subscribe((proceedings) => {
      expect(proceedings.length).toBeGreaterThan(0);
      expect(proceedings[0]).toHaveProperty('category');
      done();
    });
  });

  it('should persist a newly registered procedure', (done) => {
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

    service.registerProcedure(payload).subscribe((procedure) => {
      expect(procedure.name).toBe(payload.name);
      expect(localStorage.getItem(PROCEEDINGS_STORAGE_KEY)).not.toBeNull();

      service.listProceedings().subscribe((proceedings) => {
        expect(proceedings.some((item) => item.code === payload.code)).toBe(true);
        done();
      });
    });
  });

  it('should fallback to the mock catalog when localStorage is unavailable', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined
    });

    const proceedings = (service as any).readProceedings() as AestheticProcedure[];

    expect(proceedings.length).toBeGreaterThan(0);
    expect(proceedings[0].id).toBeDefined();
  });

  it('should fallback to the mock catalog when persisted data is invalid', () => {
    localStorage.setItem(PROCEEDINGS_STORAGE_KEY, 'not-a-json');

    const proceedings = (service as any).readProceedings() as AestheticProcedure[];

    expect(proceedings.length).toBeGreaterThan(0);
    expect(proceedings[0].category).toBeDefined();
  });

  it('should fallback to the mock catalog when persisted data is empty', () => {
    localStorage.setItem(PROCEEDINGS_STORAGE_KEY, JSON.stringify([]));

    const proceedings = (service as any).readProceedings() as AestheticProcedure[];

    expect(proceedings.length).toBeGreaterThan(0);
  });

  it('should ignore writes when localStorage is unavailable', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined
    });

    expect(() => (service as any).writeProceedings([])).not.toThrow();
  });

  it('should generate a fallback id when crypto randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {}
    });
    jest.spyOn(Date, 'now').mockReturnValue(123456);

    const id = (service as any).generateId('FAC-777') as string;

    expect(id).toBe('fac-777-123456');
  });
});
