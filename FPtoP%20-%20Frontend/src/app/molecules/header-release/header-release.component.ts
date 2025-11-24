import {
    Input,
    Component
} from "@angular/core";

@Component({
  selector: 'header-release',
  templateUrl: './header-release.component.html',
  styleUrls: ['./header-release.component.scss'],
})
export class HeaderReleaseComponent { 
    @Input() title!: any;
    @Input() itemsSteps!: any;
}