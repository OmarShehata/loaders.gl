// @ts-nocheck
import {loadLibrary} from '@loaders.gl/worker-utils';

export const CRUNCH_EXTERNAL_LIBRARIES = {
  /** Crunch decoder library. It is used as dynamically imported script */
  DECODER: 'crunch.js'
};

/**
 * Load crunch decoder module
 * @param options - loader options
 * @returns Promise of module object
 */
export async function loadCrunchModule(options): Promise<any> {
  const modules = options.modules || {};
  if (modules.crunch) {
    return modules.crunch;
  }

  return loadCrunch(options);
}

let crunchModule;

/**
 * Load crunch decoder module
 * @param {any} options - Loader options
 * @returns {Promise<any>} Promise of Module object
 */
async function loadCrunch(options) {
  if (crunchModule) {
    return crunchModule;
  }

  let loadCrunchDecoder = await loadLibrary(CRUNCH_EXTERNAL_LIBRARIES.DECODER, 'textures', options);

  // Depends on how import happened...
  // @ts-ignore TS2339: Property does not exist on type
  loadCrunchDecoder = loadCrunchDecoder || globalThis.LoadCrunchDecoder;
  crunchModule = loadCrunchDecoder();
  return crunchModule;
}
