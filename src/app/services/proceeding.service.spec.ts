import { TestBed } from '@angular/core/testing';
import { ProceedingService } from './proceeding.service';
import { AestheticProcedurePayload } from '../models/proceeding.model';

describe('ProceedingService', () => {
  let service: ProceedingService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ProceedingService]
    });

    service = TestBed.inject(ProceedingService);
  });

  it('should return the seeded catalog when there is no local data', (done) => {
    service.listProcedures().subscribe((procedures) => {
      expect(procedures.length).toBeGreaterThan(0);
      expect(procedures[0]).toHaveProperty('category');
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

      service.listProcedures().subscribe((procedures) => {
        expect(procedures.some((item) => item.code === payload.code)).toBe(true);
        done();
      });
    });
  });
});
