/* global ImageBitmap, Buffer */
import test from 'tape-promise/tape';
import {fetchFile, isBrowser} from '@loaders.gl/core';
import {getSupportedGPUTextureFormats} from '@loaders.gl/textures';
import I3SNodePagesTiles from '@loaders.gl/i3s/helpers/i3s-nodepages-tiles';
import {TILESET_STUB} from '@loaders.gl/i3s/test/test-utils/load-utils';

import {parseI3STileContent} from '@loaders.gl/i3s/lib/parsers/parse-i3s-tile-content';

const I3S_TILE_CONTENT =
  '@loaders.gl/i3s/test/data/SanFrancisco_3DObjects_1_7/SceneServer/layers/0/nodes/1/geometries/0';

const I3S_TILE_COMPRESSED_CONTENT =
  '@loaders.gl/i3s/test/data/SanFrancisco_3DObjects_1_7/SceneServer/layers/0/nodes/1/geometries/1';

test('ParseI3sTileContent#should parse tile content', async t => {
  const i3sTilesetData = TILESET_STUB();
  const i3SNodePagesTiles = new I3SNodePagesTiles(i3sTilesetData, {});
  const tile = await i3SNodePagesTiles.formTileFromNodePages(1);
  const response = await fetchFile(I3S_TILE_CONTENT);
  const data = await response.arrayBuffer();
  const result = await parseI3STileContent(data, tile, i3sTilesetData, {
    i3s: {
      useDracoGeometry: false
    }
  });
  t.ok(result);
  t.end();
});

test('ParseI3sTileContent#should load "dds" texture if it is supported', async t => {
  const i3sTilesetData = TILESET_STUB();
  const i3SNodePagesTiles = new I3SNodePagesTiles(i3sTilesetData, {});
  const tile = await i3SNodePagesTiles.formTileFromNodePages(1);
  const response = await fetchFile(I3S_TILE_CONTENT);
  const data = await response.arrayBuffer();
  const result = await parseI3STileContent(data, tile, i3sTilesetData, {
    i3s: {
      useDracoGeometry: false
    }
  });
  const texture = result.content.texture;
  if (isBrowser) {
    const supportedFormats = getSupportedGPUTextureFormats();
    if (supportedFormats.has('dxt')) {
      t.ok(texture.compressed);
      t.ok(texture.data instanceof Array);
    } else {
      t.ok(texture instanceof ImageBitmap);
    }
  } else {
    t.ok(texture instanceof Object);
    t.ok(texture.data instanceof Buffer);
  }
  t.end();
});

test('ParseI3sTileContent#should make PBR material', async t => {
  const i3sTilesetData = TILESET_STUB();
  const i3SNodePagesTiles = new I3SNodePagesTiles(i3sTilesetData, {});
  const tile = await i3SNodePagesTiles.formTileFromNodePages(1);
  const response = await fetchFile(I3S_TILE_CONTENT);
  const data = await response.arrayBuffer();
  const result = await parseI3STileContent(data, tile, i3sTilesetData, {
    i3s: {
      useDracoGeometry: false
    }
  });
  const material = result.content.material;
  t.ok(material.doubleSided);
  t.deepEqual(material.emissiveFactor, [1, 1, 1]);
  t.ok(material.pbrMetallicRoughness);
  t.ok(material.pbrMetallicRoughness.baseColorTexture);

  const texture = material.pbrMetallicRoughness.baseColorTexture.texture;
  t.ok(texture);
  t.ok(texture.source);
  if (isBrowser) {
    const supportedFormats = getSupportedGPUTextureFormats();
    if (supportedFormats.has('dxt')) {
      t.ok(texture.source.image.compressed);
      t.ok(texture.source.image.data instanceof Array);
    } else {
      t.ok(texture.source.image instanceof ImageBitmap);
    }
  } else {
    t.ok(texture.source.image instanceof Object);
    t.ok(texture.source.image.data instanceof Buffer);
  }
  t.end();
});

test('ParseI3sTileContent#should parse tile content with simple geometry if loadFeatureAttributes false', async t => {
  const i3sTilesetData = TILESET_STUB();
  const i3SNodePagesTiles = new I3SNodePagesTiles(i3sTilesetData, {i3s: {useDracoGeometry: false}});
  const tile = await i3SNodePagesTiles.formTileFromNodePages(1);
  const response = await fetchFile(I3S_TILE_CONTENT);
  const data = await response.arrayBuffer();
  const result = await parseI3STileContent(data, tile, i3sTilesetData, {
    i3s: {
      useDracoGeometry: false,
      loadFeatureAttributes: false
    }
  });
  t.ok(result);
  t.deepEqual(result.userData, {});
  t.end();
});

test('ParseI3sTileContent#should parse tile content with simple geometry if loadFeatureAttributes true', async t => {
  const i3sTilesetData = TILESET_STUB();
  const i3SNodePagesTiles = new I3SNodePagesTiles(i3sTilesetData, {i3s: {useDracoGeometry: false}});
  const tile = await i3SNodePagesTiles.formTileFromNodePages(1);
  const response = await fetchFile(I3S_TILE_CONTENT);
  const data = await response.arrayBuffer();
  const result = await parseI3STileContent(data, tile, i3sTilesetData, {
    i3s: {
      useDracoGeometry: false,
      loadFeatureAttributes: true
    }
  });
  t.ok(result);
  t.ok(result.userData.layerFeaturesAttributes);
  t.equal(result.userData.layerFeaturesAttributes.length, 0);
  t.end();
});

test('ParseI3sTileContent#should parse tile content with compressed geometry if loadFeatureAttributes false', async t => {
  const i3sTilesetData = TILESET_STUB();
  const i3SNodePagesTiles = new I3SNodePagesTiles(i3sTilesetData, {i3s: {useDracoGeometry: true}});
  const tile = await i3SNodePagesTiles.formTileFromNodePages(1);
  const response = await fetchFile(I3S_TILE_COMPRESSED_CONTENT);
  const data = await response.arrayBuffer();
  const result = await parseI3STileContent(data, tile, i3sTilesetData, {
    i3s: {
      useDracoGeometry: true,
      loadFeatureAttributes: false
    }
  });
  t.ok(result);
  t.deepEqual(result.userData, {});
  t.end();
});

test('ParseI3sTileContent#should parse tile content with compressed geometry if loadFeatureAttributes true', async t => {
  const i3sTilesetData = TILESET_STUB();
  const i3SNodePagesTiles = new I3SNodePagesTiles(i3sTilesetData, {i3s: {useDracoGeometry: true}});
  const tile = await i3SNodePagesTiles.formTileFromNodePages(1);
  const response = await fetchFile(I3S_TILE_COMPRESSED_CONTENT);
  const data = await response.arrayBuffer();
  const result = await parseI3STileContent(data, tile, i3sTilesetData, {
    i3s: {
      useDracoGeometry: true,
      loadFeatureAttributes: true
    }
  });
  t.ok(result);
  t.ok(result.userData.layerFeaturesAttributes);
  t.equal(result.userData.layerFeaturesAttributes.length, 0);
  t.end();
});
