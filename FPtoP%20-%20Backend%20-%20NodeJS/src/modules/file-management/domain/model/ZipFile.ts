// src/domain/model/ZipFile.ts
export class ZipFile {
  constructor(
    public fileName: string,
    public content: Uint8Array,
    public buffer: Buffer,
    public mimetype: string,
  ) {}
}
