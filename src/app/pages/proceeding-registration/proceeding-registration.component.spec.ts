import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProceedingRegistrationPageComponent } from './proceeding-registration.component';
import { ProceedingService } from '../../services/proceeding.service';
import { AestheticProcedure } from '../../models/proceeding.model';

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

});
