import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  VcCardComponent,
  VcHeadingComponent,
  VcListComponent,
  VcTextComponent,
  type VcListItem
} from '@vyracare/design-system';
import { ProceedingFormComponent } from '../../components/proceeding-form/proceeding-form.component';
import { AestheticProcedure, AestheticProcedurePayload } from '../../models/proceeding.model';
import { ProceedingService } from '../../services/proceeding.service';

type ProcedureCategorySummary = {
  category: string;
  subtitle: string;
  items: VcListItem[];
};

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
export class ProceedingRegistrationPageComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);
  protected readonly procedures = signal<AestheticProcedure[]>([]);
  protected readonly categoryHighlights = ['Facial', 'Corporal', 'Laser', 'Injetaveis', 'Capilar', 'Bem-estar'];
  protected readonly totalProcedures = computed(() => this.procedures().length);
  protected readonly activeProcedures = computed(() => this.procedures().filter((procedure) => procedure.active).length);
  protected readonly categoryCount = computed(() => new Set(this.procedures().map((procedure) => procedure.category)).size);
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

  private loadCatalog(): void {
    this.proceedingService.listProcedures().subscribe((procedures) => {
      this.procedures.set(procedures);
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
