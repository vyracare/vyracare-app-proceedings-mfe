import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';
import { ProceedingFormComponent } from '../../components/proceeding-form/proceeding-form.component';
import { AestheticProcedurePayload } from '../../models/proceeding.model';
import { ProceedingService } from '../../services/proceeding.service';

@Component({
  selector: 'vyracare-proceeding-create-page',
  standalone: true,
  imports: [RouterLink, ProceedingFormComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './proceeding-create.component.html',
  styleUrl: './proceeding-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena o cadastro de procedimento em uma pagina dedicada. */
export class ProceedingCreatePageComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(
    private readonly proceedingService: ProceedingService,
    private readonly router: Router
  ) {}

  /** Persiste o procedimento e retorna ao catalogo depois do sucesso. */
  handleSubmit(payload: AestheticProcedurePayload): void {
    this.loading.set(true);
    this.error.set(null);
    this.proceedingService.registerProcedure(payload).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/cadastro/procedimentos']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao salvar procedimento. Tente novamente.');
      }
    });
  }
}
