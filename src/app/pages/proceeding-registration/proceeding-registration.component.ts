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
/** Pagina principal do MFE, responsavel por compor o formulario, os indicadores e o catalogo de procedimentos. */
export class ProceedingRegistrationPageComponent {
  /** Controla o estado de submissao do formulario para bloquear interacoes duplicadas. */
  protected readonly loading = signal(false);
  /** Exibe a mensagem de erro operacional em caso de falha na gravacao. */
  protected readonly error = signal<string | null>(null);
  /** Sinaliza visualmente quando o cadastro foi concluido com sucesso. */
  protected readonly success = signal(false);
  /** Armazena o catalogo de proceedings carregado pelo servico. */
  protected readonly proceedings = signal<AestheticProcedure[]>([]);
  /** Lista de categorias destacadas na lateral para reforcar a organizacao do catalogo. */
  protected readonly categoryHighlights = ['Facial', 'Corporal', 'Laser', 'Injetaveis', 'Capilar', 'Bem-estar'];
  /** Resume o total de itens existentes no catalogo. */
  protected readonly totalProceedings = computed(() => this.proceedings().length);
  /** Resume quantos procedimentos estao liberados para comercializacao. */
  protected readonly activeProceedings = computed(() => this.proceedings().filter((proceeding) => proceeding.active).length);
  /** Informa quantas categorias distintas existem hoje no catalogo. */
  protected readonly categoryCount = computed(() => new Set(this.proceedings().map((proceeding) => proceeding.category)).size);
  /** Agrupa os proceedings por categoria para renderizar o catalogo em blocos de leitura rapida. */
  protected readonly catalogByCategory = computed<ProcedureCategorySummary[]>(() => {
    const categoryMap = new Map<string, AestheticProcedure[]>();

    for (const proceeding of this.proceedings()) {
      const currentCategory = categoryMap.get(proceeding.category) ?? [];
      currentCategory.push(proceeding);
      categoryMap.set(proceeding.category, currentCategory);
    }

    return Array.from(categoryMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, proceedings]) => ({
        category,
        subtitle: `${proceedings.length} procedimento(s) registrado(s)`,
        items: proceedings.map((proceeding) => ({
          icon: proceeding.active ? 'check2-circle' : 'pause-circle',
          title: proceeding.name,
          description: `${proceeding.code} - ${proceeding.targetArea} - ${proceeding.durationMinutes} min - ${this.formatCurrency(proceeding.sessionPrice)}`
        }))
      }));
  });

  constructor(private readonly proceedingService: ProceedingService) {
    this.loadCatalog();
  }

  /**
   * Recebe o payload do formulario, delega a persistencia ao servico
   * e atualiza os estados visuais da pagina conforme o resultado.
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

  /** Recarrega o catalogo atual para refletir o estado mais recente da fonte de dados. */
  private loadCatalog(): void {
    this.proceedingService.listProceedings().subscribe((proceedings) => {
      this.proceedings.set(proceedings);
    });
  }

  /** Formata valores monetarios no padrao brasileiro para exibicao no catalogo. */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
