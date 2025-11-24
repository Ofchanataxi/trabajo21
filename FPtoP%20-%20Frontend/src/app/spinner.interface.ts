import { ProgressSpinnerMode } from "@angular/material/progress-spinner";

export interface SlbLoadingSpinnerParams {
  /** Display spinner delay*/
  delay?: number;

  /** The diameter of the progress spinner (will set width and height of svg). */
  diameter?: number;
  /** Text displayed under the spinner. */
  text?: string;
  /** Mode of the progress circle ('determinate' | 'indeterminate'). */
  mode?: ProgressSpinnerMode;
  /** Value of the progress circle. */
  value?: number;
}
