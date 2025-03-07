/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
 const sidebars = {
  examplesSidebar: [
    {
      type: 'doc',
      label: 'Overview',
      id: 'index'
    },
    {
      type: 'category',
      label: 'Geospatial Loaders',
      items: [
        'geoparquet',
        'geopackage',
        'flatgeobuf',
        'geojson'
      ],
    },
    {
      type: 'category',
      label: 'Tile Loaders and Services',
      items: [
        'pmtiles',
        'wms'
      ]
    },
    {
      type: 'category',
      label: '3D Tile Loaders',
      items: [
        'i3s',
        'i3s-arcgis',
        '3d-tiles'
      ]
    },
    {
      type: 'category',
      label: 'General Loaders',
      items: [
        'textures',
        // 'gltf',
        'pointcloud'
      ],
    }
    // {
    //   type: 'category',
    //   label: 'Benchmarks',
    //   items: [
    //     'benchmarks',
    //   ]
    // }
  ]
};

module.exports = sidebars;
