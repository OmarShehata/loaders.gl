// Fork of https://github.com/floatdrop/require-from-string/blob/master/index.js
// Copyright (c) Vsevolod Strukchinsky <floatdrop@gmail.com> (github.com/floatdrop)
// MIT license

// this file is not visible to webpack (it is excluded in the package.json "browser" field).

import Module from 'module';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Load a file from local file system
 * @param filename
 * @returns
 */
export async function readFileAsArrayBuffer(filename: string): Promise<ArrayBuffer> {
  if (filename.startsWith('http')) {
    const response = await fetch(filename);
    return await response.arrayBuffer();
  }
  const buffer = fs.readFileSync(filename);
  return buffer.buffer;
}

/**
 * Load a file from local file system
 * @param filename
 * @returns
 */
export async function readFileAsText(filename: string): Promise<string> {
  if (filename.startsWith('http')) {
    const response = await fetch(filename);
    return await response.text();
  }
  const text = fs.readFileSync(filename, 'utf8');
  return text;
}

// Node.js Dynamically require from file
// Relative names are resolved relative to cwd
// This indirect function is provided because webpack will try to bundle `module.require`.
// this file is not visible to webpack (it is excluded in the package.json "browser" field).
export async function requireFromFile(filename: string): Promise<any> {
  if (filename.startsWith('http')) {
    const response = await fetch(filename);
    const code = await response.text();
    return requireFromString(code);
  }

  if (!filename.startsWith('/')) {
    filename = `${process.cwd()}/${filename}`;
  }
  const code = await fs.promises.readFile(filename, 'utf8');
  return requireFromString(code);
}

// Dynamically require from string
// - `code` - Required - Type: string - Module code.
// - `filename` - Type: string - Default: '' - Optional filename.
// - `options.appendPaths` Type: Array List of paths, that will be appended to module paths.
// Useful, when you want to be able require modules from these paths.
// - `options.prependPaths` Type: Array Same as appendPaths, but paths will be prepended.
export function requireFromString(
  code: string,
  filename = '',
  options?: {
    prependPaths?: string[];
    appendPaths?: string[];
  }
): any {
  if (typeof filename === 'object') {
    options = filename;
    filename = '';
  }

  if (typeof code !== 'string') {
    throw new Error(`code must be a string, not ${typeof code}`);
  }

  // @ts-ignore
  const paths = Module._nodeModulePaths(path.dirname(filename));

  const parent = typeof module !== 'undefined' && module?.parent;

  // @ts-ignore
  const newModule = new Module(filename, parent);
  newModule.filename = filename;
  newModule.paths = ([] as string[])
    .concat(options?.prependPaths || [])
    .concat(paths)
    .concat(options?.appendPaths || []);
  // @ts-ignore
  newModule._compile(code, filename);

  if (parent && parent.children) {
    parent.children.splice(parent.children.indexOf(newModule), 1);
  }

  return newModule.exports;
}
