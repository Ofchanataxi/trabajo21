import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-missing-signatures-warning',
  templateUrl: './missing-signatures-warning.component.html',
  styleUrls: ['./missing-signatures-warning.component.scss']
})
export class MissingSignaturesWarningComponent implements OnChanges {
  @Input() signs: any[] = [];
  @Input() totalPeopleRequiredToSign: number = 0;
  uniqueSignatures = 0;
  unidentifiedPeople = 0;
  totalSignatures = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['signs']) {
      this.calculateSignaturesStats();
    }
  }

  private normalizeNames(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private calculateSignaturesStats(): void {
    const uniqueMap = new Map<string, any>();
    this.unidentifiedPeople = 0;
    this.totalSignatures = this.signs.length;

    this.signs.reduce((map, sign) => {
      const rawName = sign.userData?.Names;
      if (!rawName) return map;

      const normalizedName = this.normalizeNames(rawName);
      const ci = sign.userData?.CI || null;
      const nameKey = normalizedName;

      const existing = map.get(nameKey);

      if (existing) {
        if (existing.CI && ci && existing.CI !== ci) {
          map.set(nameKey + ci, sign.userData);
        } else if (!ci) {
          this.unidentifiedPeople++;
        }
      } else {
        map.set(nameKey, sign.userData);
      }

      return map;
    }, uniqueMap);

    this.uniqueSignatures = uniqueMap.size;
  }

  shouldShowWarning(): boolean {
    return (
      this.uniqueSignatures < this.totalPeopleRequiredToSign
    );
  }

  get tooltipText(): string {

        if (this.unidentifiedPeople > 0) {
            return `${this.totalSignatures} Firmas Totales,\n${this.uniqueSignatures}/${this.totalPeopleRequiredToSign} firmas únicas requeridas,\n${this.unidentifiedPeople} firmas que no se logró identificar`;
        } else {
            return `${this.totalSignatures} Firmas Totales,\n${this.uniqueSignatures}/${this.totalPeopleRequiredToSign} firmas únicas requeridas`;
        }
    }
}
