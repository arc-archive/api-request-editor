import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { AmfLoader } from './amf-loader.js';
import '../api-request-editor.js';

describe('SE-12042', function() {
  async function modelFixture(amf, selected) {
    return (await fixture(html`<api-request-editor
      .amf="${amf}"
      .selected="${selected}"></api-request-editor>`));
  }

  const apiFile = 'SE-12042';
  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      let factory;
      describe('http method computation', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(apiFile, compact);
          factory = document.createElement('api-view-model-transformer');
        });

        after(() => {
          factory = null;
        });

        afterEach(() => {
          factory.clearCache();
        });

        it('sets headers from the authorization method', async () => {
          const method = AmfLoader.lookupOperation(amf, '/check/api-status', 'get');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout();
          const spy = sinon.spy();
          element.addEventListener('api-request', spy);
          element.execute();
          const { detail } = spy.args[0][0];
          const { headers } = detail;
          assert.equal(headers,
            'Client-Id: 283a6722121141feb7a929793d5c\nClient-Secret: 1421b7a929793d51fe283a67221c');
        });

        it('sets query parameter from the authorization method', async () => {
          const method = AmfLoader.lookupOperation(amf, '/check/api-status', 'get');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout();
          const spy = sinon.spy();
          element.addEventListener('api-request', spy);
          element.execute();
          const { detail } = spy.args[0][0];
          const { url } = detail;

          assert.include(url,
            'api-status?testParam=x-test-value');
        });
      });
    });
  });
});
