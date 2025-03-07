import {FileProvider} from '@loaders.gl/loader-utils';
import {MD5Hash} from '@loaders.gl/crypto';
import {DeflateCompression, NoCompression} from '@loaders.gl/compression';
import {parseZipLocalFileHeader} from '@loaders.gl/zip';

type CompressionHandler = (compressedFile: ArrayBuffer) => Promise<ArrayBuffer>;

/**
 * Handling different compression types in zip
 */
const COMPRESSION_METHODS: {[key: number]: CompressionHandler} = {
  /** No compression */
  0: (data) => new NoCompression().decompress(data),
  /** Deflation */
  8: (data) => new DeflateCompression({raw: true}).decompress(data)
};

/**
 * Class for handling information about 3tz file
 */
export class Tiles3DArchive {
  /** FileProvider with whe whole file */
  private fileProvider: FileProvider;
  /** hash info */
  private hashTable: Record<string, bigint>;

  /**
   * creates Tiles3DArchive handler
   * @param fileProvider - FileProvider with the whole file
   * @param hashTable - hash info
   */
  constructor(fileProvider: FileProvider, hashTable: Record<string, bigint>) {
    this.fileProvider = fileProvider;
    this.hashTable = hashTable;
  }

  /**
   * Returns file with the given path from 3tz archive
   * @param path - path inside the 3tz
   * @returns buffer with ready to use file
   */
  async getFile(path: string): Promise<ArrayBuffer> {
    // sometimes paths are not in lower case when hash file is created,
    // so first we're looking for lower case file name and then for original one
    let data = await this.getFileBytes(path.toLocaleLowerCase());
    if (!data) {
      data = await this.getFileBytes(path);
    }
    if (!data) {
      throw new Error(`No such file in the archive: ${path}`);
    }

    return data;
  }

  /**
   * Trying to get raw file data by adress
   * @param path - path inside the archive
   * @returns buffer with the raw file data
   */
  private async getFileBytes(path: string): Promise<ArrayBuffer | null> {
    const arrayBuffer = new TextEncoder().encode(path).buffer;
    const nameHash = await new MD5Hash().hash(arrayBuffer, 'hex');
    const byteOffset = this.hashTable[nameHash];
    if (byteOffset === undefined) {
      return null;
    }

    const localFileHeader = await parseZipLocalFileHeader(byteOffset, this.fileProvider);
    if (!localFileHeader) {
      return null;
    }

    const compressedFile = await this.fileProvider.slice(
      localFileHeader.fileDataOffset,
      localFileHeader.fileDataOffset + localFileHeader.compressedSize
    );

    const compressionMethod = COMPRESSION_METHODS[localFileHeader.compressionMethod];
    if (!compressionMethod) {
      throw Error('Only Deflation compression is supported');
    }

    return compressionMethod(compressedFile);
  }
}
