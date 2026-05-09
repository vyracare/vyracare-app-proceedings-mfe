import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  VcCardComponent,
  VcHeadingComponent,
  VcListComponent,
  VcTextComponent
} from '@vyracare/design-system';
import { ProceedingFormComponent } from '../../components/proceeding-form/proceeding-form.component';
import {
  AestheticProcedure,
  AestheticProcedurePayload,
  ProcedureCategorySummary
} from '../../models/proceeding.model';
import { ProceedingService } from '../../services/proceeding.service';

@Component({
  selector: 'vyracare-proceeding-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProceedingFormComponent,
    VcCardComponent,
    VcHeadingComponent,
    VcListComponent,
    VcTextComponent
  ],
  templateUrl: './proceeding-registration.component.html',
  styleUrl: './proceeding-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Página principal do MFE, responsável por compor o formulário, os indicadores e o catálogo de procedimentos. */
export class ProceedingRegistrationPageComponent {
  /** Controla o estado de submissão do formulário para bloquear interações duplicadas. */
  protected readonly loading = signal(false);
  /** Exibe a mensagem de erro operacional em caso de falha na gravação. */
  protected readonly error = signal<string | null>(null);
  /** Sinaliza visualmente quando o cadastro foi concluído com sucesso. */
  protected readonly success = signal(false);
  /** Armazena o catálogo de procedimentos carregado pelo serviço. */
  protected readonly procedures = signal<AestheticProcedure[]>([]);
  /** Lista de categorias destacadas na lateral para reforçar a organização do catálogo. */
  protected readonly categoryHighlights = ['Facial', 'Corporal', 'Laser', 'Injetaveis', 'Capilar', 'Bem-estar'];
  /** Resume o total de itens existentes no catálogo. */
  protected readonly totalProcedures = computed(() => this.procedures().length);
  /** Resume quantos procedimentos estão liberados para comercialização. */
  protected readonly activeProcedures = computed(() => this.procedures().filter((procedure) => procedure.active).length);
  /** Informa quantas categorias distintas existem hoje no catálogo. */
  protected readonly categoryCount = computed(() => new Set(this.procedures().map((procedure) => procedure.category)).size);
  /** Agrupa os procedimentos por categoria para renderizar o catálogo em blocos de leitura rápida. */
  protected readonly catalogByCategory = computed<ProcedureCategorySummary[]>(() => {
    const categoryMap = new Map<string, AestheticProcedure[]>();

    for (const procedure of this.procedures()) {
      const currentCategory = categoryMap.get(procedure.category) ?? [];
      currentCategory.push(procedure);
      categoryMap.set(procedure.category, currentCategory);
    }

    return Array.from(categoryMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, procedures]) => ({
        category,
        subtitle: `${procedures.length} procedimento(s) registrado(s)`,
        items: procedures.map((procedure) => ({
          icon: procedure.active ? 'check2-circle' : 'pause-circle',
          title: procedure.name,
          description: `${procedure.code} - ${procedure.targetArea} - ${procedure.durationMinutes} min - ${this.formatCurrency(procedure.sessionPrice)}`
        }))
      }));
  });

  constructor(private readonly proceedingService: ProceedingService) {
    this.loadCatalog();
  }

  /**
   * Recebe o payload do formulário, delega a persistência ao serviço
   * e atualiza os estados visuais da página conforme o resultado.
   */
  handleSubmit(payload: AestheticProcedurePayload): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.proceedingService.registerProcedure(payload).subscribe({
      next: () => {
        this.loadCatalog();
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao salvar procedimento. Tente novamente.');
      }
    });
  }

  /** Recarrega o catálogo atual para refletir o estado mais recente da fonte de dados. */
  private loadCatalog(): void {
    this.proceedingService.listProcedures().subscribe((procedures) => {
      this.procedures.set(procedures);
    });
  }

  /** Formata valores monetários no padrão brasileiro para exibição no catálogo. */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
