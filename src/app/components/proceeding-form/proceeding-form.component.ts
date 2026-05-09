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
/** Componente responsável por coletar os dados operacionais e comerciais de um procedimento estético. */
export class ProceedingFormComponent {
  /** Controla o estado de carregamento externo para bloquear o formulário durante a gravação. */
  @Input() loading = false;
  /** Exibe mensagens de erro operacionais vindas da página consumidora. */
  @Input() error: string | null = null;
  /** Emite o payload tipado do procedimento quando o formulário está válido. */
  @Output() formSubmit = new EventEmitter<AestheticProcedurePayload>();

  /** Lista base de categorias usadas pela clínica para padronizar o cadastro. */
  readonly categories = ['Facial', 'Corporal', 'Laser', 'Injetaveis', 'Capilar', 'Bem-estar'];
  /** Converte as categorias em opções compatíveis com o componente de select do design system. */
  readonly categoryOptions: VcSelectOption[] = this.categories.map((category) => ({
    label: category,
    value: category
  }));

  /** Estrutura reativa central do formulário de cadastro de procedimentos. */
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

  /**
   * Valida o formulário e, quando consistente, envia o payload completo
   * para a página responsável pela persistência.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }

  /** Restaura os valores iniciais para agilizar um novo cadastro manual. */
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
