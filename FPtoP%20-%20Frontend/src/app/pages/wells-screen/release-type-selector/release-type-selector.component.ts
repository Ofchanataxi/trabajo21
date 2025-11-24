import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export interface ReleaseOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-release-type-selector',
  templateUrl: './release-type-selector.component.html',
  styleUrls: ['./release-type-selector.component.scss']
})
export class ReleaseTypeSelectorComponent {
  @Input() options: ReleaseOption[] = [];
  @Output() idTypeOfReleaseSelected = new EventEmitter<number>();

  constructor(private router: Router, private route: ActivatedRoute) {}

  selectReleaseType(releaseTypeId: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        idTypeOfRelease: releaseTypeId,
      },
      queryParamsHandling: 'merge',
    });
    this.idTypeOfReleaseSelected.emit(releaseTypeId);
  }
  
}
