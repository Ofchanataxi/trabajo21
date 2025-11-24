import { Component, Input, OnInit } from '@angular/core';
import { StepService } from '../../pages/field/services/step.service';


@Component({
  selector: 'app-dynamic-stepper',
  templateUrl: './dynamic-stepper.component.html',
  styleUrls: ['./dynamic-stepper.component.scss'],
})
export class DynamicStepperComponent implements OnInit {
  @Input() steps: any[];

  completedSteps: boolean[] = [];

  constructor(private stepService: StepService) { }

  ngOnInit(): void {
    this.completedSteps = Array(this.steps.length).fill(false);
  }

  onStepChange(index: number) {
    this.stepService.setCurrentStep(index);
  }
}
