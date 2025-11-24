import { Component, Input, OnInit, Output, EventEmitter, NgZone, ViewChild  } from '@angular/core';
import { StepService } from '../../services/step.service';
import { first } from 'rxjs/operators';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-field-dynamic-stepper',
  templateUrl: './dynamic-stepper.component.html',
  styleUrls: ['./dynamic-stepper.component.scss'],
})
export class FieldDynamicStepperComponent implements OnInit {
  @Input() steps: any[];
  @Input() changesPending: boolean;
  @Input() disable: boolean;
  @Input() onSave!: () => Promise<void>;
  
  @ViewChild('stepper') stepper: MatStepper;

  previousStepIndex = 0; // track the previous step

  completedSteps: boolean[] = [];

  constructor(
      private stepService: StepService,
      private zone: NgZone
    ) { }

  ngOnInit(): void {
    this.completedSteps = Array(this.steps.length).fill(false);
  }

  
async onStepChange(index: number) {
  // Prevent selection if disabled and going to step 5 or 6
  if (this.disable && (index === 5 || index === 6)) {
    window.alert("⚠️ Aún no se han generado los reportes");

    // ⛔ Restore the previous step visually
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.zone.run(() => {
          this.stepper.selectedIndex = this.previousStepIndex;
        });
      });
    });

    return;
  }

  if (this.changesPending) {
    const confirmed = window.confirm("⚠️ Existen cambios pendientes por guardar, ¿desea guardarlos?");
    if (confirmed) {
      await this.onSave();
    }
  }

  await this.zone.onStable.pipe(first()).toPromise();

  this.previousStepIndex = index; // update tracker
  this.stepService.setCurrentStep(index);
}

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
}
