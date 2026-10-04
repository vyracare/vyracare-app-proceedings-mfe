import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProceedingRegistrationPageComponent } from './proceeding-registration.component';
import { ProceedingService } from '../../services/proceeding.service';
import { AestheticProcedure, AestheticProcedurePayload } from '../../models/proceeding.model';

describe('ProceedingRegistrationPageComponent', () => {
  let proceedingService: jest.Mocked<ProceedingService>;

  beforeEach(async () => {
    proceedingService = {
      listProceedings: jest.fn(),
      registerProcedure: jest.fn()
    } as unknown as jest.Mocked<ProceedingService>;

    proceedingService.listProceedings.mockReturnValue(of([]));

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

    expect(proceedingService.listProceedings).toHaveBeenCalled();
  });

  it('should filter the catalog by name, code or category', () => {
    const seededProceedings: AestheticProcedure[] = [
      {
        id: 'laser-1',
        name: 'Laser facial',
        category: 'Laser',
        code: 'LAS-001',
        targetArea: 'Face',
        durationMinutes: 40,
        sessionPrice: 350,
        sessionCount: 4,
        recoveryTime: 'Sem afastamento',
        description: 'Sessao facial.',
        active: true,
        createdAt: '2026-05-09T00:00:00.000Z'
      },
      {
        id: 'facial-1',
        name: 'Peeling leve',
        category: 'Facial',
        code: 'FAC-002',
        targetArea: 'Rosto',
        durationMinutes: 55,
        sessionPrice: 280,
        sessionCount: 3,
        recoveryTime: '24 horas',
        description: 'Renovacao leve.',
        active: false,
        createdAt: '2026-05-09T00:00:00.000Z'
      }
    ];

    proceedingService.listProceedings.mockReturnValue(of(seededProceedings));

    const fixture = TestBed.createComponent(ProceedingRegistrationPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.search('fac-002');

    expect((component as any).filteredProceedings()).toEqual([seededProceedings[1]]);
    component.search('laser');
    expect((component as any).filteredProceedings()).toEqual([seededProceedings[0]]);
    component.search('');
    expect((component as any).filteredProceedings()).toEqual(seededProceedings);
    expect((component as any).formatCurrency(280)).toContain('280');
  });

  it('should manage the registration modal without closing during a save', () => {
    const fixture = TestBed.createComponent(ProceedingRegistrationPageComponent);
    const component = fixture.componentInstance;

    component.openRegistration();
    expect((component as any).registrationModalOpen()).toBe(true);

    (component as any).loading.set(true);
    component.closeRegistration();
    expect((component as any).registrationModalOpen()).toBe(true);

    (component as any).loading.set(false);
    component.closeRegistration();
    expect((component as any).registrationModalOpen()).toBe(false);
  });

  it('should track proceedings by id', () => {
    const fixture = TestBed.createComponent(ProceedingRegistrationPageComponent);
    const component = fixture.componentInstance;
    const proceeding = {
      id: 'proc-1', name: 'Botox', category: 'Injetaveis', code: 'INJ-001', targetArea: 'Face',
      durationMinutes: 45, sessionPrice: 950, sessionCount: 1, recoveryTime: '24 horas',
      description: 'Procedimento facial.', active: true, createdAt: '2026-05-01T09:00:00.000Z'
    };

    expect((component as any).trackProceeding(0, proceeding)).toBe('proc-1');
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
