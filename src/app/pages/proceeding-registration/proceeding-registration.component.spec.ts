import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProceedingRegistrationPageComponent } from './proceeding-registration.component';
import { ProceedingService } from '../../services/proceeding.service';
import { AestheticProcedurePayload } from '../../models/proceeding.model';

describe('ProceedingRegistrationPageComponent', () => {
  let proceedingService: jest.Mocked<ProceedingService>;

  beforeEach(async () => {
    proceedingService = {
      listProcedures: jest.fn(),
      registerProcedure: jest.fn()
    } as unknown as jest.Mocked<ProceedingService>;

    proceedingService.listProcedures.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProceedingRegistrationPageComponent, RouterTestingModule],
      providers: [{ provide: ProceedingService, useValue: proceedingService }]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProceedingRegistrationPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load the catalog on startup', () => {
    const fixture = TestBed.createComponent(ProceedingRegistrationPageComponent);
    fixture.detectChanges();

    expect(proceedingService.listProcedures).toHaveBeenCalled();
  });

  it('should handle successful procedure registration', () => {
    const fixture = TestBed.createComponent(ProceedingRegistrationPageComponent);
    const component = fixture.componentInstance;

    const payload: AestheticProcedurePayload = {
      name: 'Peeling quimico controlado',
      category: 'Facial',
      code: 'FAC-011',
      targetArea: 'Rosto',
      durationMinutes: 50,
      sessionPrice: 320,
      sessionCount: 3,
      recoveryTime: '48 horas',
      description: 'Controle de textura, manchas leves e renovacao epidermica.',
      active: true
    };

    proceedingService.registerProcedure.mockReturnValue(
      of({
        ...payload,
        id: 'new-id',
        createdAt: new Date().toISOString()
      })
    );

    component.handleSubmit(payload);

    expect(proceedingService.registerProcedure).toHaveBeenCalledWith(payload);
    expect((component as any).loading()).toBe(false);
    expect((component as any).success()).toBe(true);
    expect((component as any).error()).toBeNull();
  });

  it('should handle failed procedure registration', () => {
    const fixture = TestBed.createComponent(ProceedingRegistrationPageComponent);
    const component = fixture.componentInstance;

    const payload: AestheticProcedurePayload = {
      name: 'Radiofrequencia facial',
      category: 'Facial',
      code: 'FAC-021',
      targetArea: 'Face',
      durationMinutes: 45,
      sessionPrice: 290,
      sessionCount: 6,
      recoveryTime: 'Sem afastamento',
      description: 'Melhora da firmeza e da circulacao local.',
      active: true
    };

    proceedingService.registerProcedure.mockReturnValue(throwError(() => new Error('fail')));

    component.handleSubmit(payload);

    expect(proceedingService.registerProcedure).toHaveBeenCalledWith(payload);
    expect((component as any).loading()).toBe(false);
    expect((component as any).success()).toBe(false);
    expect((component as any).error()).toBe('Falha ao salvar procedimento. Tente novamente.');
  });
});
