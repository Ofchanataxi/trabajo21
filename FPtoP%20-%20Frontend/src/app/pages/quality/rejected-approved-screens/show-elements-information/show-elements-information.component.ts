import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "app-show-elements-information",
  templateUrl: "./show-elements-information.component.html",
  styleUrls: ["./show-elements-information.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ShowElementsInformationComponent {
  @Input() completedSteps: boolean[] = [];
  @Input() pendingInformation: { [key: string]: any } = {};
  @Output() completedStepsEvent = new EventEmitter<boolean[]>();

  updateCompletedSteps() {
    this.completedStepsEvent.emit(this.completedSteps);
  }

  @Output() sendDataToNextStep = new EventEmitter<{
    data: {};
  }>();

  sendNextData() {
    this.sendDataToNextStep.emit({ data: {} });
  }

  goOnAddSigns(): void {
    this.completedSteps[0] = true;
    this.updateCompletedSteps();
    this.sendNextData();
  }

  private makeFile(name: string, buffer: string, extension: string): File {
    const byteCharacters = atob(buffer);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: extension });
    return new File([blob], name, { type: extension });
  }

  toFileArray(fileInformationArr: any[]): File[] {
    let fileArr: File[] = fileInformationArr.map(
      (fileInfo: { [key: string]: any }) =>
        this.makeFile(fileInfo.name, fileInfo.buffer, fileInfo.extension)
    );
    return fileArr;
  }
}
