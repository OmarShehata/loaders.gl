import test from 'tape-promise/tape';
import {validateLoader, validateWriter} from 'test/common/conformance';

import {ZipWriter, ZipLoader} from '@loaders.gl/zip';
import {encode, parse} from '@loaders.gl/core';

const FILE_MAP = {
  src: 'abc',
  dist: 'cba',
  'README.md': 'This is a module',
  package: '{"name": "module"}'
};

test('Zip#loader/writer conformance', (t) => {
  validateLoader(t, ZipLoader, 'ZipLoader');
  validateWriter(t, ZipWriter, 'ZipWriter');
  t.end();
});

test('Zip#encode/decode', async (t) => {
  const arrayBuffer = await encode(FILE_MAP, ZipWriter);
  const fileMap = await parse(arrayBuffer, ZipLoader);
  for (const key in FILE_MAP) {
    const text = new TextDecoder().decode(fileMap[key]);
    t.equal(text, FILE_MAP[key], `Subfile ${key} encoded/decoded correctly`);
  }
  t.end();
});
