import { Component, Input, OnInit } from "@angular/core";
import moment from 'moment';

@Component({
  selector: "app-show-valid-signs",
  templateUrl: "./show-valid-signs.component.html",
  styleUrls: ["./show-valid-signs.component.scss"],
})
export class ShowValidSignsComponent implements OnInit {
  @Input() unzipSigns: any[];
  @Input() annots: { [key: string]: any };

  sortedData: any[];
  docWithAnnots: boolean = false;
  docWithModifications: boolean = false;

  ngOnInit(): void {
    if (this.annots.didDocChange) this.docWithAnnots = true;
    this.docWithModifications = this.unzipSigns.some(
      (sign) => sign.signIntegrity.hasIntegrity === false
    );

    const combined = this.combineDate(
      this.unzipSigns,
      this.annots.modifications
    );
    this.sortedData = combined;
  }

  private combineDate(unzipSigns: any[], annotsArr: any[]) {
    const combined2 = [
      ...unzipSigns.map((sign) => ({
        ...sign,
        sortType: "sign",
        momentDate: moment(sign.signingTime),
      })),
      ...annotsArr.map((modification) => ({
        ...modification,
        sortType: "modification",
        momentDate: modification.date ? moment(modification.date) : null,
      })),
    ];

    const sortedCombined = combined2.sort((a, b) => {
      if (a.momentDate === null) return 1;
      if (b.momentDate === null) return -1;
      return a.momentDate.valueOf() - b.momentDate.valueOf();
    });

    return sortedCombined;
  }
}
