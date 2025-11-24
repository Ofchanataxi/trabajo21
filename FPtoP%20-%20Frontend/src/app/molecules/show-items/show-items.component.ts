import { Input, Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'show-items',
  templateUrl: './show-items.component.html',
  styleUrls: ['./show-items.component.scss'],
})
export class ShowItemsComponent {
  @Input() filteredItems!: any;
  @Input() urlRedirect!: any;
  @Input() idReleaseState!: number;
  @Input() idBusinessLine!: number;
  // [routerLink]="['edit', item.idRelease]"
  // [queryParams]="{ wellName: item.wellName }"
}
