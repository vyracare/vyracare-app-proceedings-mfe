import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VcHeadingComponent, VcTextComponent, VcToastService } from '@vyracare/design-system';
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
    private readonly router: Router,
    private readonly toast: VcToastService
  ) {}

  /** Persiste o procedimento e retorna ao catalogo depois do sucesso. */
  handleSubmit(payload: AestheticProcedurePayload): void {
    this.loading.set(true);
    this.error.set(null);
    this.proceedingService.registerProcedure(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Procedimento cadastrado', 'O procedimento foi salvo com sucesso.');
        void this.router.navigate(['/cadastro/procedimentos']);
      },
      error: () => {
        this.loading.set(false);
        const message = 'Falha ao salvar procedimento. Tente novamente.';
        this.error.set(message);
        this.toast.error('Nao foi possivel cadastrar o procedimento', message);
      }
    });
  }
}
