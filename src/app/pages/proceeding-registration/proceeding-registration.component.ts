import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VcHeadingComponent, VcSearchComponent, VcTextComponent } from '@vyracare/design-system';
import { AestheticProcedure } from '../../models/proceeding.model';
import { ProceedingService } from '../../services/proceeding.service';

@Component({
  selector: 'vyracare-proceeding-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    VcHeadingComponent,
    VcSearchComponent,
    VcTextComponent
  ],
  templateUrl: './proceeding-registration.component.html',
  styleUrl: './proceeding-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena a consulta e o filtro do catalogo de procedimentos. */
export class ProceedingRegistrationPageComponent {
  protected readonly listLoading = signal(true);
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
