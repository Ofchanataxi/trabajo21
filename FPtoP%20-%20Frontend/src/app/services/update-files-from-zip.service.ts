import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UpdateFilesFromZipService {
  private filesSubject = new Subject<{ data: any[]; index: number }>();
  files$ = this.filesSubject.asObservable();

  changeArray(data: any[], index: number) {
    this.filesSubject.next({ data, index });
  }
}
