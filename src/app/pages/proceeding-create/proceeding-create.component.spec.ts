import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AestheticProcedurePayload } from '../../models/proceeding.model';
import { ProceedingService } from '../../services/proceeding.service';
import { ProceedingCreatePageComponent } from './proceeding-create.component';

describe('ProceedingCreatePageComponent', () => {
  let proceedingService: jest.Mocked<ProceedingService>;
  const payload: AestheticProcedurePayload = {
    name: 'Peeling químico controlado', category: 'Facial', code: 'FAC-011', targetArea: 'Rosto',
    durationMinutes: 50, sessionPrice: 320, sessionCount: 3, recoveryTime: '48 horas',
    description: 'Controle de textura e renovação epidérmica.', active: true
  };

  beforeEach(async () => {
    proceedingService = { registerProcedure: jest.fn() } as unknown as jest.Mocked<ProceedingService>;
    await TestBed.configureTestingModule({
      imports: [ProceedingCreatePageComponent],
      providers: [provideRouter([]), { provide: ProceedingService, useValue: proceedingService }]
    }).compileComponents();
  });

  it('should save the procedure and return to the catalog', () => {
    proceedingService.registerProcedure.mockReturnValue(of({ ...payload, id: 'new-id', createdAt: new Date().toISOString() }));
    const component = TestBed.createComponent(ProceedingCreatePageComponent).componentInstance;
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.handleSubmit(payload);

    expect(proceedingService.registerProcedure).toHaveBeenCalledWith(payload);
    expect(navigate).toHaveBeenCalledWith(['/cadastro/procedimentos']);
    expect((component as any).loading()).toBe(false);
  });

  it('should preserve the page and report a save failure', () => {
    proceedingService.registerProcedure.mockReturnValue(throwError(() => new Error('fail')));
    const component = TestBed.createComponent(ProceedingCreatePageComponent).componentInstance;

    component.handleSubmit(payload);

    expect((component as any).error()).toBe('Falha ao salvar procedimento. Tente novamente.');
    expect((component as any).loading()).toBe(false);
  });
});
