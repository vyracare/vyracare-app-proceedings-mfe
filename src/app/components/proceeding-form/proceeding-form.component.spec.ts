import { TestBed } from '@angular/core/testing';
import { ProceedingFormComponent } from './proceeding-form.component';
import { AestheticProcedurePayload } from '../../models/proceeding.model';

describe('ProceedingFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProceedingFormComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProceedingFormComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should emit payload when form is valid', () => {
    const fixture = TestBed.createComponent(ProceedingFormComponent);
    const component = fixture.componentInstance;

    const formValue = {
      name: 'Microagulhamento com drug delivery',
      category: 'Facial',
      code: 'FAC-055',
      targetArea: 'Face',
      durationMinutes: 70,
      sessionPrice: 520,
      sessionCount: 4,
      recoveryTime: '48 horas',
      description: 'Protocolo para textura, poros e renovacao celular.',
      active: true
    };

    component.form.setValue(formValue);

    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith(formValue as AestheticProcedurePayload);
  });

  it('should mark controls as touched when form is invalid', () => {
    const fixture = TestBed.createComponent(ProceedingFormComponent);
    const component = fixture.componentInstance;

    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
    expect(component.form.controls.category.touched).toBe(true);
    expect(component.form.controls.description.touched).toBe(true);
  });

  it('should reset the form to defaults', () => {
    const fixture = TestBed.createComponent(ProceedingFormComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: 'Ultrassom microfocado',
      category: 'Corporal',
      code: 'COR-090',
      targetArea: 'Bracos',
      durationMinutes: 80,
      sessionPrice: 980,
      sessionCount: 3,
      recoveryTime: '24 horas',
      description: 'Protocolo para firmeza e contorno corporal.',
      active: false
    });

    component.resetForm();

    expect(component.form.getRawValue()).toEqual({
      name: '',
      category: '',
      code: '',
      targetArea: '',
      durationMinutes: 60,
      sessionPrice: 250,
      sessionCount: 1,
      recoveryTime: 'Sem afastamento',
      description: '',
      active: true
    });
  });
});
