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

  search(value: string): void {
    this.searchTerm.set(value);
  }

  openRegistration(): void {
    this.error.set(null);
    this.success.set(false);
    this.registrationModalOpen.set(true);
  }

  closeRegistration(): void {
    if (!this.loading()) {
      this.registrationModalOpen.set(false);
    }
  }

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

  protected trackProceeding(_: number, proceeding: AestheticProcedure): string {
    return proceeding.id;
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private loadCatalog(): void {
    this.listLoading.set(true);
    this.proceedingService.listProceedings().subscribe((proceedings) => {
      this.proceedings.set(proceedings);
      this.listLoading.set(false);
    });
  }
}
