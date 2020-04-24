import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-request-editor.js';

describe('APIC-289', function() {
  async function modelFixture(amf, selected) {
    return (await fixture(html`<api-request-editor
      .amf="${amf}"
      .selected="${selected}"></api-request-editor>`));
  }

  const apiFile = 'APIC-289';
  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(`${label}`, () => {
      let factory;
      let amf;
      before(async () => {
        amf = await AmfLoader.load({ fileName: apiFile, compact });
        factory = document.createElement('api-view-model-transformer');
      });

      after(() => {
        factory = null;
      });

      afterEach(() => {
        factory.clearCache();
      });

      it('generates query parameters model', async () => {
        const method = AmfLoader.lookupOperation(amf, '/organization', 'get');
        const element = await modelFixture(amf, method['@id']);
        await aTimeout();
        await aTimeout();
        const model = element._queryModel;
        assert.lengthOf(model, 1);
      });

      it('has OAS name on a parameter', async () => {
        const method = AmfLoader.lookupOperation(amf, '/organization', 'get');
        const element = await modelFixture(amf, method['@id']);
        await aTimeout();
        await aTimeout();
        const model = element._queryModel;
        assert.equal(model[0].name, 'foo');
      });
    });
  });
});
