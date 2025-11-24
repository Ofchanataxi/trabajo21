import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatSelectChange } from '@angular/material/select';

type OptionKV = { key: any; value: string };
type OptionIL = { id: any; label: string };

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  // Apariencia / props
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showLabel: boolean = false;
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() placeholder: string = '';
  @Input() disableRipple: boolean = false;
  @Input() disableOptionCentering: boolean = false;
  @Input() showHint: boolean = false;
  @Input() hint: string = '';
  @Input() size: string = 'large';
  color: ThemePalette = 'primary';

  // Acepta {key,value} o {id,label}
  @Input() options: Array<OptionKV | OptionIL> = [];

  @Output() selectionChange = new EventEmitter<any>();

  // === CVA state ===
  value: any = null;
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: any): void {
    this.value = v;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Normaliza la opción (soporta {key,value} y {id,label})
  getOptionValue(o: OptionKV | OptionIL) {
    return (o as OptionKV).key ?? (o as OptionIL).id;
  }
  getOptionLabel(o: OptionKV | OptionIL) {
    return (o as OptionKV).value ?? (o as OptionIL).label;
  }

  onMatChange(event: MatSelectChange) {
    const v = event.value;
    this.value = v;
    this.onChange(v);
    this.selectionChange.emit(v);
  }

  onBlur() {
    this.onTouched();
  }
}
