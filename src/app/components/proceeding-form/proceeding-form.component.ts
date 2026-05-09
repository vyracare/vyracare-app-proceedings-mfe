import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VcButtonComponent,
  VcHeadingComponent,
  VcInputComponent,
  VcSelectComponent,
  VcTextComponent
} from '@vyracare/design-system';
import type { VcSelectOption } from '@vyracare/design-system';
import { AestheticProcedurePayload } from '../../models/proceeding.model';

@Component({
  selector: 'vyracare-proceeding-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VcButtonComponent,
    VcHeadingComponent,
    VcInputComponent,
    VcSelectComponent,
    VcTextComponent
  ],
  templateUrl: './proceeding-form.component.html',
  styleUrl: './proceeding-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProceedingFormComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() formSubmit = new EventEmitter<AestheticProcedurePayload>();

  readonly categories = ['Facial', 'Corporal', 'Laser', 'Injetaveis', 'Capilar', 'Bem-estar'];
  readonly categoryOptions: VcSelectOption[] = this.categories.map((category) => ({
    label: category,
    value: category
  }));

  readonly form: FormGroup<{
    name: FormControl<string>;
    category: FormControl<string>;
    code: FormControl<string>;
    targetArea: FormControl<string>;
    durationMinutes: FormControl<number>;
    sessionPrice: FormControl<number>;
    sessionCount: FormControl<number>;
    recoveryTime: FormControl<string>;
    description: FormControl<string>;
    active: FormControl<boolean>;
  }>;

  constructor(private readonly fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      name: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      category: this.fb.control('', {
        validators: [Validators.required]
      }),
      code: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(4)]
      }),
      targetArea: this.fb.control('', {
        validators: [Validators.required]
      }),
      durationMinutes: this.fb.control(60, {
        validators: [Validators.required, Validators.min(10)]
      }),
      sessionPrice: this.fb.control(250, {
        validators: [Validators.required, Validators.min(1)]
      }),
      sessionCount: this.fb.control(1, {
        validators: [Validators.required, Validators.min(1)]
      }),
      recoveryTime: this.fb.control('Sem afastamento'),
      description: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(10)]
      }),
      active: this.fb.control(true)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }

  resetForm(): void {
    this.form.reset({
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
  }
}
