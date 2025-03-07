import test from 'tape-promise/tape';
import {load} from '@loaders.gl/core';
import {Tiles3DArchiveFileLoader} from '../src';

const testUrl = '@loaders.gl/3d-tiles/test/data/test.3tz';

test('Tiles3DArchiveFileLoader#load uncompressed file', async (t) => {
  const uncompressedFile = await load(testUrl, Tiles3DArchiveFileLoader, {
    '3d-tiles-archive': {path: 'tileset.json'}
  });
  t.deepEqual(uncompressedFile.byteLength, 2339, 'tileset.json has the correct length');
  t.end();
});
