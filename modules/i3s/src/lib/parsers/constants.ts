// loaders.gl, MIT license
// Copyright (c) vis.gl contributors

import {GL} from '@loaders.gl/math';

export function getConstructorForDataFormat(dataType: string) {
  switch (dataType) {
    case 'UInt8':
      return Uint8Array;
    case 'UInt16':
      return Uint16Array;
    case 'UInt32':
      return Uint32Array;
    case 'Float32':
      return Float32Array;
    case 'UInt64':
      return Float64Array;
    default:
      throw new Error(`parse i3s tile content: unknown type of data: ${dataType}`);
  }
}

export const GL_TYPE_MAP: {[key: string]: number} = {
  UInt8: GL.UNSIGNED_BYTE,
  UInt16: GL.UNSIGNED_SHORT,
  Float32: GL.FLOAT,
  UInt32: GL.UNSIGNED_INT,
  UInt64: GL.DOUBLE
};
/**
 * Returns how many bytes a type occupies
 * @param dataType
 * @returns
 */
export function sizeOf(dataType: string): number {
  switch (dataType) {
    case 'UInt8':
      return 1;
    case 'UInt16':
    case 'Int16':
      return 2;
    case 'UInt32':
    case 'Int32':
    case 'Float32':
      return 4;
    case 'UInt64':
    case 'Int64':
    case 'Float64':
      return 8;
    default:
      throw new Error(`parse i3s tile content: unknown size of data: ${dataType}`);
  }
}

export const STRING_ATTRIBUTE_TYPE = 'String';
export const OBJECT_ID_ATTRIBUTE_TYPE = 'Oid32';
export const FLOAT_64_TYPE = 'Float64';
export const INT_16_ATTRIBUTE_TYPE = 'Int16';

// https://github.com/visgl/deck.gl/blob/9548f43cba2234a1f4877b6b17f6c88eb35b2e08/modules/core/src/lib/constants.js#L27
// Describes the format of positions
export enum COORDINATE_SYSTEM {
  /**
   * `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
   */
  DEFAULT = -1,
  /**
   * Positions are interpreted as [lng, lat, elevation]
   * lng lat are degrees, elevation is meters. distances as meters.
   */
  LNGLAT = 1,
  /**
   * Positions are interpreted as meter offsets, distances as meters
   */
  METER_OFFSETS = 2,
  /**
   * Positions are interpreted as lng lat offsets: [deltaLng, deltaLat, elevation]
   * deltaLng, deltaLat are delta degrees, elevation is meters.
   * distances as meters.
   */
  LNGLAT_OFFSETS = 3,
  /**
   * Non-geospatial
   */
  CARTESIAN = 0
}
