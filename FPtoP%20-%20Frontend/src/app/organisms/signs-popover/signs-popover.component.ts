import { coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import {
  SlbPopoverComponent,
  SlbPopoverDirective
} from "@slb-dls/angular-material/popover";

@Component({
  selector: "app-signs-popover",
  templateUrl: "./signs-popover.component.html",
  styleUrls: ["./signs-popover.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SignsPopoverComponent implements OnInit {
  @Input({required: false}) slbPopoverTrigger: "click";
  @Input({required: false}) hideArrow: boolean = false;
  @Input({required: false}) slbPopoverCloseOnClick = true;
  @Input({required: false}) slbPopoverCloseOnEscape = true;
  @Input({required: false}) slbPopoverDisabled = false;
  @Input({required: false}) useTargetElement = false;
  @Input({required: false}) hasSigns: boolean = true;
  @Input({required: false}) invalidSigns: boolean = true;

  label: string = "Firmas";

  ngOnInit(): void {
    if (this.invalidSigns) this.label = "Revisar firmas";
  }

  @Input() set slbPopoverBackdropClass(value: string) {
    value = (value || "").trim();
    if (this.backDropClass !== value) {
      this.backDropClass = value;
      this._recreatePopover();
    }
  }
  get slbPopoverBackdropClass() {
    return this.backDropClass;
  }

  @Input() set slbPopoverHasBackdrop(value: boolean) {
    value = coerceBooleanProperty(value);
    if (value !== this.hasBackDrop) {
      this.hasBackDrop = value;
      this._recreatePopover();
    }
  }
  get slbPopoverHasBackdrop() {
    return this.hasBackDrop;
  }

  @Output() onClose = new EventEmitter();
  @Output() closed = new EventEmitter();
  @Output() onOpen = new EventEmitter();
  @Output() opened = new EventEmitter();

  @ViewChild(SlbPopoverDirective, { static: true })
  popoverDirective: SlbPopoverDirective;

  private backDropClass: string;
  private hasBackDrop: boolean = false;

  private _recreatePopover() {
    if (this.popoverDirective) {
      const isOpened = this.popoverDirective.isOpened;
      if (isOpened) {
        this.popoverDirective.closePopover();
      }
      this.popoverDirective.destroyPopover(); // to refresh settings
      if (isOpened) {
        setTimeout(() => this.popoverDirective.openPopover());
      }
    }
  }
}
