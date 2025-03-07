import {FileProvider, compareArrayBuffers} from '@loaders.gl/loader-utils';
import {parseEoCDRecord} from './end-of-central-directory';
import {ZipSignature} from './search-from-the-end';

/**
 * zip central directory file header info
 * according to https://en.wikipedia.org/wiki/ZIP_(file_format)
 */
export type ZipCDFileHeader = {
  /** Compressed size */
  compressedSize: bigint;
  /** Uncompressed size */
  uncompressedSize: bigint;
  /** Extra field size */
  extraFieldLength: number;
  /** File name length */
  fileNameLength: number;
  /** File name */
  fileName: string;
  /** Extra field offset */
  extraOffset: bigint;
  /** Relative offset of local file header */
  localHeaderOffset: bigint;
};

/**
 * Data that might be in Zip64 notation inside extra data
 */
type Zip64Data = {
  /** Uncompressed size */
  uncompressedSize: bigint;
  /** Compressed size */
  compressedSize: bigint;
  /** Relative offset of local file header */
  localHeaderOffset: bigint;
  /** Start disk */
  startDisk: bigint;
};

// offsets accroding to https://en.wikipedia.org/wiki/ZIP_(file_format)
const CD_COMPRESSED_SIZE_OFFSET = 20n;
const CD_UNCOMPRESSED_SIZE_OFFSET = 24n;
const CD_FILE_NAME_LENGTH_OFFSET = 28n;
const CD_EXTRA_FIELD_LENGTH_OFFSET = 30n;
const CD_START_DISK_OFFSET = 32n;
const CD_LOCAL_HEADER_OFFSET_OFFSET = 42n;
const CD_FILE_NAME_OFFSET = 46n;

export const signature: ZipSignature = new Uint8Array([0x50, 0x4b, 0x01, 0x02]);

/**
 * Parses central directory file header of zip file
 * @param headerOffset - offset in the archive where header starts
 * @param buffer - buffer containing whole array
 * @returns Info from the header
 */
export const parseZipCDFileHeader = async (
  headerOffset: bigint,
  file: FileProvider
): Promise<ZipCDFileHeader | null> => {
  const magicBytes = await file.slice(headerOffset, headerOffset + 4n);
  if (!compareArrayBuffers(magicBytes, signature.buffer)) {
    return null;
  }

  const compressedSize = BigInt(await file.getUint32(headerOffset + CD_COMPRESSED_SIZE_OFFSET));
  const uncompressedSize = BigInt(await file.getUint32(headerOffset + CD_UNCOMPRESSED_SIZE_OFFSET));
  const extraFieldLength = await file.getUint16(headerOffset + CD_EXTRA_FIELD_LENGTH_OFFSET);
  const startDisk = BigInt(await file.getUint16(headerOffset + CD_START_DISK_OFFSET));
  const fileNameLength = await file.getUint16(headerOffset + CD_FILE_NAME_LENGTH_OFFSET);
  const filenameBytes = await file.slice(
    headerOffset + CD_FILE_NAME_OFFSET,
    headerOffset + CD_FILE_NAME_OFFSET + BigInt(fileNameLength)
  );
  const fileName = new TextDecoder().decode(filenameBytes);

  const extraOffset = headerOffset + CD_FILE_NAME_OFFSET + BigInt(fileNameLength);
  const oldFormatOffset = await file.getUint32(headerOffset + CD_LOCAL_HEADER_OFFSET_OFFSET);

  const localHeaderOffset = BigInt(oldFormatOffset);
  const extraField = new DataView(
    await file.slice(extraOffset, extraOffset + BigInt(extraFieldLength))
  );
  // looking for info that might be also be in zip64 extra field

  const zip64data: Zip64Data = {
    uncompressedSize,
    compressedSize,
    localHeaderOffset,
    startDisk
  };

  const res = findZip64DataInExtra(zip64data, extraField);

  return {
    ...zip64data,
    ...res,
    extraFieldLength,
    fileNameLength,
    fileName,
    extraOffset
  };
};

/**
 * Create iterator over files of zip archive
 * @param fileProvider - file provider that provider random access to the file
 */
export async function* makeZipCDHeaderIterator(
  fileProvider: FileProvider
): AsyncIterable<ZipCDFileHeader> {
  const {cdStartOffset} = await parseEoCDRecord(fileProvider);
  let cdHeader = await parseZipCDFileHeader(cdStartOffset, fileProvider);
  while (cdHeader) {
    yield cdHeader;
    cdHeader = await parseZipCDFileHeader(
      cdHeader.extraOffset + BigInt(cdHeader.extraFieldLength),
      fileProvider
    );
  }
}
/**
 * returns the number written in the provided bytes
 * @param bytes two bytes containing the number
 * @returns the number written in the provided bytes
 */
const getUint16 = (...bytes: [number, number]) => {
  return bytes[0] + bytes[1] * 16;
};

/**
 * reads all nesessary data from zip64 record in the extra data
 * @param zip64data values that might be in zip64 record
 * @param extraField full extra data
 * @returns data read from zip64
 */

const findZip64DataInExtra = (zip64data: Zip64Data, extraField: DataView): Partial<Zip64Data> => {
  const zip64dataList = findExpectedData(zip64data);

  const zip64DataRes: Partial<Zip64Data> = {};
  if (zip64dataList.length > 0) {
    // total length of data in zip64 notation in bytes
    const zip64chunkSize = zip64dataList.reduce((sum, curr) => sum + curr.length, 0);
    // we're looking for the zip64 nontation header (0x0001)
    // and a size field with a correct value next to it
    const offsetInExtraData = new Uint8Array(extraField.buffer).findIndex(
      (_val, i, arr) =>
        getUint16(arr[i], arr[i + 1]) === 0x0001 &&
        getUint16(arr[i + 2], arr[i + 3]) === zip64chunkSize
    );
    // then we read all the nesessary fields from the zip64 data
    let bytesRead = 0;
    for (const note of zip64dataList) {
      const offset = bytesRead;
      zip64DataRes[note.name] = extraField.getBigUint64(offsetInExtraData + 4 + offset, true);
      bytesRead = offset + note.length;
    }
  }

  return zip64DataRes;
};

/**
 * frind data that's expected to be in zip64
 * @param zip64data values that might be in zip64 record
 * @returns zip64 data description
 */

const findExpectedData = (zip64data: Zip64Data): {length: number; name: string}[] => {
  // We define fields that should be in zip64 data
  const zip64dataList: {length: number; name: string}[] = [];
  if (zip64data.uncompressedSize === BigInt(0xffffffff)) {
    zip64dataList.push({name: 'uncompressedSize', length: 8});
  }
  if (zip64data.compressedSize === BigInt(0xffffffff)) {
    zip64dataList.push({name: 'compressedSize', length: 8});
  }
  if (zip64data.localHeaderOffset === BigInt(0xffffffff)) {
    zip64dataList.push({name: 'localHeaderOffset', length: 8});
  }
  if (zip64data.startDisk === BigInt(0xffffffff)) {
    zip64dataList.push({name: 'startDisk', length: 4});
  }

  return zip64dataList;
};
