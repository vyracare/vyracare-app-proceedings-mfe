import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';
import { ProceedingFormComponent } from '../../components/proceeding-form/proceeding-form.component';
import { AestheticProcedure, AestheticProcedurePayload } from '../../models/proceeding.model';
import { ProceedingService } from '../../services/proceeding.service';

@Component({
  selector: 'vyracare-proceeding-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProceedingFormComponent,
    VcButtonComponent,
    VcHeadingComponent,
    VcTextComponent
  ],
  templateUrl: './proceeding-registration.component.html',
  styleUrl: './proceeding-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena a consulta, o filtro e o cadastro modal de procedimentos. */
export class ProceedingRegistrationPageComponent {
  protected readonly loading = signal(false);
  protected readonly listLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);
  protected readonly registrationModalOpen = signal(false);
  protected readonly proceedings = signal<AestheticProcedure[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly filteredProceedings = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('pt-BR');

    if (!term) {
      return this.proceedings();
    }

    return this.proceedings().filter((proceeding) =>
      [proceeding.name, proceeding.code, proceeding.category]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(term))
    );
  });

  constructor(private readonly proceedingService: ProceedingService) {
    this.loadCatalog();
  }

  /** Atualiza o termo usado para filtrar nome, codigo e categoria do catalogo. */
  search(value: string): void {
    this.searchTerm.set(value);
  }

  /** Abre o formulario de cadastro com os feedbacks anteriores limpos. */
  openRegistration(): void {
    this.error.set(null);
    this.success.set(false);
    this.registrationModalOpen.set(true);
  }

  /** Fecha o cadastro quando nao existe uma gravacao em andamento. */
  closeRegistration(): void {
    if (!this.loading()) {
      this.registrationModalOpen.set(false);
    }
  }

  /** Persiste um procedimento e atualiza o catalogo depois da gravacao. */
  handleSubmit(payload: AestheticProcedurePayload): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.proceedingService.registerProcedure(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.registrationModalOpen.set(false);
        this.loadCatalog();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao salvar procedimento. Tente novamente.');
      }
    });
  }

  /** Fornece uma chave estavel para a renderizacao das linhas de procedimentos. */
  protected trackProceeding(_: number, proceeding: AestheticProcedure): string {
    return proceeding.id;
  }

  /** Formata o valor da sessao no padrao monetario brasileiro. */
  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /** Recarrega o catalogo apresentado na tabela. */
  private loadCatalog(): void {
    this.listLoading.set(true);
    this.proceedingService.listProceedings().subscribe((proceedings) => {
      this.proceedings.set(proceedings);
      this.listLoading.set(false);
    });
  }
}
