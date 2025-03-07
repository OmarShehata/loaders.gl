// loaders.gl, MIT license
// Copyright (c) vis.gl contributors
// Forked from sax-ts & sax under ISC license

import test from 'tape-promise/tape';
import {testSax} from '../utils/test-utils';

test('SAXParser#xmlns-xml-default-redefine', (t) => {
  testSax(t, {
    xml: '<xml:root xmlns:xml=\'ERROR\'/>',
    expect: [
      [
        'opentagstart',
        {
          name: 'xml:root',
          attributes: {},
          ns: {}
        }
      ],
      [
        'error',
        'xml: prefix must be bound to http://www.w3.org/XML/1998/namespace\n' +
          'Actual: ERROR\n' +
          'Line: 0\nColumn: 27\nChar: \''
      ],
      [
        'attribute',
        {
          name: 'xmlns:xml',
          local: 'xml',
          prefix: 'xmlns',
          uri: 'http://www.w3.org/2000/xmlns/',
          value: 'ERROR'
        }
      ],
      [
        'opentag',
        {
          name: 'xml:root',
          uri: 'http://www.w3.org/XML/1998/namespace',
          prefix: 'xml',
          local: 'root',
          attributes: {
            'xmlns:xml': {
              name: 'xmlns:xml',
              local: 'xml',
              prefix: 'xmlns',
              uri: 'http://www.w3.org/2000/xmlns/',
              value: 'ERROR'
            }
          },
          ns: {},
          isSelfClosing: true
        }
      ],
      ['closetag', 'xml:root']
    ],
    saxOptions: {
      xmlns: true,
      strict: true
    }
  });

  t.end();
});
