import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { AmfLoader } from './amf-loader.js';
import '../api-request-editor.js';

describe('Basic authentication', function() {
  async function basicFixture() {
    return (await fixture(`<api-request-editor></api-request-editor>`));
  }

  async function awareFixture() {
    return (await fixture(`<api-request-editor aware="test"></api-request-editor>`));
  }

  async function allowCustomFixture() {
    return (await fixture(`<api-request-editor allowcustom></api-request-editor>`));
  }

  async function modelFixture(amf, selected) {
    return (await fixture(html`<api-request-editor
      .amf="${amf}"
      .selected="${selected}"></api-request-editor>`));
  }

  function clearCache() {
    const transformer = document.createElement('api-view-model-transformer');
    transformer.clearCache();
  }

  describe('initialization', () => {
    it('can be initialized with document.createElement', () => {
      const element = document.createElement('api-request-editor');
      assert.ok(element);
    });

    it('renders url editor without the model', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.url-editor');
      assert.isFalse(node.hasAttribute('hidden'));
    });

    it('renders send button without the model', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.send-button');
      assert.ok(node);
    });

    it('send button has "send" label', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.send-button');
      assert.equal(node.textContent.trim(), 'Send');
    });

    it('hiddes query editor without the model', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('api-url-params-editor').parentElement;
      assert.isTrue(node.hasAttribute('hidden'));
    });

    it('hiddes headers editor without the model', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('api-headers-editor').parentElement;
      assert.isTrue(node.hasAttribute('hidden'));
    });

    it('does not render payload editor without the model', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('api-body-editor');
      assert.notOk(node);
    });

    it('does not render authorization editor without the model', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('authorization-panel');
      assert.notOk(node);
    });
  });

  describe('allows custom property', () => {
    let element;
    beforeEach(async () => {
      element = await allowCustomFixture();
    });

    it('renders query editor', async () => {
      const node = element.shadowRoot.querySelector('api-url-params-editor').parentElement;
      assert.isFalse(node.hasAttribute('hidden'));
    });
  });

  describe('raml-aware', () => {
    let element;
    beforeEach(async () => {
      element = await awareFixture();
    });

    it('renders raml-aware', async () => {
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.ok(node);
      assert.equal(node.scope, 'test');
    });

    it('data is passed', async () => {
      const aware = document.createElement('raml-aware');
      aware.scope = 'test';
      aware.api = [{}];
      assert.deepEqual(element.amf, [{}]);
    });
  });

  describe('oauth2-redirect-uri-changed', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets redirectUri from the event', () => {
      const value = 'https://auth.domain.com';
      document.body.dispatchEvent(new CustomEvent('oauth2-redirect-uri-changed', {
        bubbles: true,
        detail: {
          value
        }
      }));

      assert.equal(element.redirectUri, value);
    });
  });

  describe('_computeIsPayloadRequest()', () => {
    let element;
    beforeEach(async () => {
      element = await allowCustomFixture();
    });

    it('Returns false for GET', () => {
      const result = element._computeIsPayloadRequest('get');
      assert.isFalse(result);
    });

    it('Returns false for HEAD', () => {
      const result = element._computeIsPayloadRequest('head');
      assert.isFalse(result);
    });

    it('Returns true for other inputs', () => {
      const result = element._computeIsPayloadRequest('post');
      assert.isTrue(result);
    });
  });

  describe('_dispatch()', () => {
    let element;
    beforeEach(async () => {
      element = await allowCustomFixture();
    });
    const eName = 'test-event';
    const eDetail = 'test-detail';

    it('Dispatches an event', () => {
      const spy = sinon.spy();
      element.addEventListener(eName, spy);
      element._dispatch(eName);
      assert.isTrue(spy.called);
    });

    it('Returns the event', () => {
      const e = element._dispatch(eName);
      assert.typeOf(e, 'customevent');
    });

    it('Event is cancelable by default', () => {
      const e = element._dispatch(eName);
      assert.isTrue(e.cancelable);
    });

    it('Event is composed', () => {
      const e = element._dispatch(eName);
      if (typeof e.composed !== 'undefined') {
        assert.isTrue(e.composed);
      }
    });

    it('Event bubbles', () => {
      const e = element._dispatch(eName);
      assert.isTrue(e.bubbles);
    });

    it('Event is not cancelable when set', () => {
      const e = element._dispatch(eName, eDetail, false);
      assert.isFalse(e.cancelable);
    });

    it('Event has detail', () => {
      const e = element._dispatch(eName, eDetail);
      assert.equal(e.detail, eDetail);
    });
  });

  describe('_sendGaEvent()', () => {
    let element;
    beforeEach(async () => {
      element = await allowCustomFixture();
    });

    const action = 'test-action';
    it('Calls _dispatch()', () => {
      const spy = sinon.spy(element, '_dispatch');
      element._sendGaEvent(action);
      assert.isTrue(spy.called);
    });

    it('Returns the event', () => {
      const e = element._sendGaEvent(action);
      assert.typeOf(e, 'customevent');
      assert.equal(e.type, 'send-analytics');
    });

    it('Event is not cancelable', () => {
      const e = element._sendGaEvent(action);
      assert.isFalse(e.cancelable);
    });

    it('Detail has action', () => {
      const e = element._sendGaEvent(action);
      assert.equal(e.detail.action, action);
    });

    it('Detail has category', () => {
      const e = element._sendGaEvent(action);
      assert.equal(e.detail.category, 'Request editor');
    });

    it('Detail has type', () => {
      const e = element._sendGaEvent(action);
      assert.equal(e.detail.type, 'event');
    });
  });

  describe('clearRequest()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._url = 'https://api.com';
      element._headers = 'x-test: true';
      element._payload = 'test-payload';
    });

    it('Clears the URL', () => {
      element.clearRequest();
      assert.equal(element.url, '');
    });

    it('Clears headers', () => {
      element.clearRequest();
      assert.equal(element.headers, '');
    });

    it('Clears payload', () => {
      element.clearRequest();
      assert.equal(element.payload, '');
    });

    it('Calls _dispatch() with parameters', () => {
      const spy = sinon.spy(element, '_dispatch');
      element.clearRequest();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'request-clear-state');
    });

    it('Calls _sendGaEvent() with parameters', () => {
      const spy = sinon.spy(element, '_sendGaEvent');
      element.clearRequest();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Clear request');
    });
  });

  describe('_responseHandler()', () => {
    let element;
    const requestId = 'test-id';
    beforeEach(async () => {
      clearCache();
      element = await basicFixture();
      element._loadingRequest = true;
      element._requestId = requestId;
    });

    it('Does nothing when ID is different', () => {
      element._responseHandler({
        detail: {
          id: 'otherId'
        }
      });
      assert.isTrue(element.loadingRequest);
    });

    it('Does nothing when no detail', () => {
      element._responseHandler({});
      assert.isTrue(element.loadingRequest);
    });

    it('Resets loadingRequest', () => {
      element._responseHandler({
        detail: {
          id: requestId
        }
      });
      assert.isFalse(element.loadingRequest);
    });

    it('Event handler is connected', () => {
      document.body.dispatchEvent(new CustomEvent('api-response', {
        bubbles: true,
        detail: {
          id: requestId
        }
      }));
      assert.isFalse(element.loadingRequest);
    });
  });

  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      const httpbinApi = 'httpbin';
      const driveApi = 'google-drive-api';
      const demoApi = 'demo-api';

      describe('http method computation', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(httpbinApi, compact);
        });

        it('sets _httpMethod proeprty (get)', async () => {
          const method = AmfLoader.lookupOperation(amf, '/anything', 'get');
          const element = await modelFixture(amf, method['@id']);
          assert.equal(element.httpMethod, 'get');
        });

        it('sets _httpMethod proeprty (post)', async () => {
          const method = AmfLoader.lookupOperation(amf, '/anything', 'post');
          const element = await modelFixture(amf, method['@id']);
          assert.equal(element.httpMethod, 'post');
        });

        it('sets _httpMethod proeprty (put)', async () => {
          const method = AmfLoader.lookupOperation(amf, '/anything', 'put');
          const element = await modelFixture(amf, method['@id']);
          assert.equal(element.httpMethod, 'put');
        });

        it('sets _httpMethod proeprty (delete)', async () => {
          const method = AmfLoader.lookupOperation(amf, '/anything', 'delete');
          const element = await modelFixture(amf, method['@id']);
          assert.equal(element.httpMethod, 'delete');
        });
      });

      describe('_computeApiPayload() and _apiPayload', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(driveApi, compact);
        });

        it('returns undefined when no model', async () => {
          const element = await basicFixture();
          assert.isUndefined(element._computeApiPayload());
        });

        it('returns undefined when no "expects"', async () => {
          const element = await basicFixture();
          element.amf = amf;
          assert.isUndefined(element._computeApiPayload({}));
        });

        it('returns payload definition', async () => {
          const method = AmfLoader.lookupOperation(amf, '/files/{fileId}', 'patch');
          const element = await basicFixture();
          element.amf = amf;
          assert.typeOf(element._computeApiPayload(method), 'array');
        });

        it('sets _apiPayload when selection changed', async () => {
          const method = AmfLoader.lookupOperation(amf, '/files/{fileId}', 'patch');
          const element = await modelFixture(amf, method['@id']);
          assert.typeOf(element.apiPayload, 'array');
        });
      });

      describe('_isPayloadRequest', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(driveApi, compact);
        });

        it('is false for get request', async () => {
          const method = AmfLoader.lookupOperation(amf, '/files/{fileId}', 'get');
          const element = await modelFixture(amf, method['@id']);
          assert.isFalse(element.isPayloadRequest);
        });

        it('returns true for post request', async () => {
          const method = AmfLoader.lookupOperation(amf, '/files/{fileId}', 'patch');
          const element = await modelFixture(amf, method['@id']);
          assert.isTrue(element.isPayloadRequest);
        });
      });

      describe('_computeSecuredBy() and _securedBy', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(driveApi, compact);
        });

        it('returns undefined when no model', async () => {
          const element = await basicFixture();
          element.amf = amf;
          assert.isUndefined(element._computeSecuredBy());
        });

        it('returns undefined when no security model', async () => {
          const element = await basicFixture();
          element.amf = amf;
          assert.isUndefined(element._computeSecuredBy({}));
        });

        it('returns security scheme model', async () => {
          const method = AmfLoader.lookupOperation(amf, '/files', 'get');
          const element = await modelFixture(amf, method['@id']);
          const security = element._computeSecuredBy(method);
          assert.typeOf(security, 'array');
        });

        it('sets securedBy', async () => {
          const method = AmfLoader.lookupOperation(amf, '/files', 'get');
          const element = await modelFixture(amf, method['@id']);
          assert.typeOf(element.securedBy, 'array');
          assert.lengthOf(element.securedBy, 1);
        });
      });

      describe('_computeHeaders() and _apiHeaders', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        it('returns undefined when no model', async () => {
          const element = await basicFixture();
          element.amf = amf;
          assert.isUndefined(element._computeHeaders());
        });

        it('returns undefined when no security model', async () => {
          const element = await basicFixture();
          element.amf = amf;
          assert.isUndefined(element._computeHeaders({}));
        });

        it('returns headers model', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const security = element._computeHeaders(method);
          assert.typeOf(security, 'array');
        });

        it('sets _apiHeaders', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          assert.typeOf(element.apiHeaders, 'array');
          assert.lengthOf(element.apiHeaders, 1);
        });
      });

      describe('ui state', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        it('renders authorization panel when authorization is required', async () => {
          const method = AmfLoader.lookupOperation(amf, '/messages', 'get');
          const element = await modelFixture(amf, method['@id']);
          const node = element.shadowRoot.querySelector('authorization-panel');
          assert.ok(node);
        });

        it('renders query/uri editor when model is set', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const node = element.shadowRoot.querySelector('api-url-params-editor').parentElement;
          assert.isFalse(node.hasAttribute('hidden'));
        });

        it('renders headers editor when model is set', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const node = element.shadowRoot.querySelector('api-headers-editor').parentElement;
          assert.isFalse(node.hasAttribute('hidden'));
        });

        it('hiddes URL editor when noUrlEditor', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          element.noUrlEditor = true;
          await nextFrame();
          const node = element.shadowRoot.querySelector('.url-editor');
          assert.isTrue(node.hasAttribute('hidden'));
        });

        it('computes URL when URL editor is hidden', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          element.noUrlEditor = true;
          await nextFrame();
          assert.equal(element.url, 'http://production.domain.com/people');
        });
      });

      describe('validation', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        beforeEach(() => {
          clearCache();
        });

        it('is invalid when query parameters are invalid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/required-query-parameters', 'get');
          const element = await modelFixture(amf, method['@id']);
          await nextFrame();
          await aTimeout();
          assert.isTrue(element.invalid, 'Editor is invalid');
        });

        it('is valid when query parameters are valid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/optional-query-parameters', 'get');
          const element = await modelFixture(amf, method['@id']);
          await nextFrame();
          await aTimeout();
          assert.isFalse(element.invalid, 'Editor is valid');
        });

        it('is invalid when uri parameters are invalid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/orgs/{orgId}', 'get');
          const element = await modelFixture(amf, method['@id']);
          await nextFrame();
          await aTimeout();
          assert.isTrue(element.invalid, 'Editor is invalid');
        });

        it('is valid when uri parameters are valid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          await nextFrame();
          await aTimeout();
          assert.isFalse(element.invalid, 'Editor is valid');
        });

        // @TODO: this.should be also true when initializing model ans selection together
        it('is invalid when headers are invalid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/required-headers', 'get');
          const element = await basicFixture();
          element.amf = amf;
          element.selected = method['@id'];
          await nextFrame();
          await aTimeout();
          await nextFrame();
          await aTimeout();
          assert.isTrue(element.invalid, 'Editor is invalid');
        });

        it('is valid when headers are valid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/optional-headers', 'get');
          const element = await modelFixture(amf, method['@id']);
          await nextFrame();
          await aTimeout();
          assert.isFalse(element.invalid, 'Editor is valid');
        });

        it('is invalid when authorization is invalid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people/{personId}', 'get');
          const element = await modelFixture(amf, method['@id']);
          await nextFrame();
          await aTimeout();
          // auth panel runs validation after 2 ticks (commiting changes, validation)
          // that gives 3 ticks altogether
          await nextFrame();
          await aTimeout();
          await nextFrame();
          await aTimeout();
          assert.isTrue(element.invalid, 'Editor is invalid');
          assert.isTrue(element.authInvalid, 'Authorization panel is invalid');
        });

        it('is valid when query parameters are valid', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          await nextFrame();
          await aTimeout();
          // auth panels runs validation after 2 ticks (commiting changes, validation)
          await nextFrame();
          await aTimeout();
          await nextFrame();
          await aTimeout();
          assert.isFalse(element.invalid, 'Editor is valid');
          assert.notOk(element.authInvalid, 'Authorization panel is valid');
        });
      });

      describe('execute()', () => {
        let amf;
        let element;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        beforeEach(async () => {
          clearCache();
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          element = await modelFixture(amf, method['@id']);
        });

        it('Dispatches `api-request` event', () => {
          const spy = sinon.spy();
          element.addEventListener('api-request', spy);
          element.execute();
          assert.isTrue(spy.called);
        });

        it('Sets loadingRequest property', () => {
          element.execute();
          assert.isTrue(element.loadingRequest);
        });

        it('Sets requestId property', () => {
          element.execute();
          assert.typeOf(element.requestId, 'string');
        });

        it('Calls serializeRequest()', () => {
          const spy = sinon.spy(element, 'serializeRequest');
          element.execute();
          assert.isTrue(spy.called);
        });

        it('Calls _dispatch()', () => {
          const spy = sinon.spy(element, '_dispatch');
          element.execute();
          assert.isTrue(spy.called);
        });

        it('_dispatch() is called with event name', () => {
          const spy = sinon.spy(element, '_dispatch');
          element.execute();
          assert.equal(spy.args[0][0], 'api-request');
        });

        it('_dispatch() is called with serialized request', () => {
          const spy = sinon.spy(element, '_dispatch');
          element.execute();
          const compare = element.serializeRequest();
          compare.id = element.requestId;
          assert.deepEqual(spy.args[0][1], compare);
        });

        it('Calls _sendGaEvent()', () => {
          const spy = sinon.spy(element, '_sendGaEvent');
          element.execute();
          assert.isTrue(spy.called);
          assert.equal(spy.args[0][0], 'request-execute');
          assert.equal(spy.args[0][1], 'true');
        });
      });

      describe('abort()', () => {
        let amf;
        let element;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        beforeEach(async () => {
          clearCache();
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          element = await modelFixture(amf, method['@id']);
          element._loadingRequest = true;
          element._requestId = 'test-request';
          await nextFrame();
        });

        it('Fires when abort button pressed', function() {
          const spy = sinon.spy();
          element.addEventListener('abort-api-request', spy);
          const button = element.shadowRoot.querySelector('.send-button.abort');
          button.click();
          assert.isTrue(spy.calledOnce);
        });

        it('Event contains the URL and the ID', function(done) {
          element.addEventListener('abort-api-request', function clb(e) {
            element.removeEventListener('abort-api-request', clb);
            assert.equal(e.detail.url, 'http://production.domain.com/people', 'URL is set');
            assert.equal(e.detail.id, 'test-request', 'id is set');
            done();
          });
          element.abort();
        });

        it('Calls _sendGaEvent()', () => {
          const spy = sinon.spy(element, '_sendGaEvent');
          element.abort();
          assert.isTrue(spy.called);
          assert.equal(spy.args[0][0], 'request-abort');
          assert.equal(spy.args[0][1], 'true');
        });

        it('Resets loadingRequest property', () => {
          element.abort();
          assert.isFalse(element.loadingRequest);
        });

        it('Resets requestId property', () => {
          element.abort();
          assert.isUndefined(element.requestId);
        });
      });

      describe('serializeRequest()', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        beforeEach(async () => {
          clearCache();
        });

        it('Returns an object', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const result = element.serializeRequest();
          assert.typeOf(result, 'object');
        });

        it('Sets editor url', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const result = element.serializeRequest();
          assert.equal(result.url, 'http://production.domain.com/people');
        });

        it('Sets editor method', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const result = element.serializeRequest();
          assert.equal(result.method, 'GET');
        });

        it('Sets headers from the editor', async () => {
          const method = AmfLoader.lookupOperation(amf, '/post-headers', 'post');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout();
          const result = element.serializeRequest();
          assert.equal(result.headers, 'x-string: \nContent-Type: application/json');
        });

        it('sets editor payload', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'post');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout();
          const result = element.serializeRequest();
          assert.notEmpty(result.payload);
          assert.equal(result.payload, element.payload);
        });

        it('sets auth data', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people/{personId}', 'get');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout(100);
          const result = element.serializeRequest();
          assert.equal(result.authType, 'x-custom');
          assert.typeOf(result.auth, 'object');
        });
      });

      describe('_urlChanged()', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        beforeEach(async () => {
          clearCache();
        });

        const newUrl = 'https://new-url';

        it('calls _dispatch()', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const spy = sinon.spy(element, '_dispatch');
          element.url = newUrl;
          assert.isTrue(spy.calledOnce);
        });

        it('calls _dispatch() with data', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          const spy = sinon.spy(element, '_dispatch');
          element.url = newUrl;
          assert.equal(spy.args[0][0], 'url-value-changed', 'type is set');
          assert.equal(spy.args[0][1].value, newUrl, 'value is set');
        });
      });

      describe('_authSettingsChanged()', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        let element;
        beforeEach(async () => {
          clearCache();
          const method = AmfLoader.lookupOperation(amf, '/basic-auth-with-defaults', 'get');
          element = await modelFixture(amf, method['@id']);
          await aTimeout(100);
        });

        it('sets _authMethod', () => {
          assert.equal(element._authMethod, 'Basic Authentication');
        });

        it('sets _authSettings data', () => {
          assert.typeOf(element._authSettings, 'object');
        });
      });

      describe('_sendHandler()', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        it('calls authAndExecute() when authorization is required', async () => {
          const method = AmfLoader.lookupOperation(amf, '/messages', 'get');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout(5);
          const spy = sinon.spy(element, 'authAndExecute');
          const button = element.shadowRoot.querySelector('.send-button');
          MockInteractions.tap(button);
          assert.isTrue(spy.called);
        });

        it('renders invalid state toast', async () => {
          const method = AmfLoader.lookupOperation(amf, '/messages', 'get');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout(5);
          const button = element.shadowRoot.querySelector('.send-button');
          MockInteractions.tap(button);
          const toast = element.shadowRoot.querySelector('#authFormError');
          assert.isTrue(toast.opened);
        });

        it('sets __requestAuthAwaiting', async () => {
          const method = AmfLoader.lookupOperation(amf, '/messages', 'get');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout(5);
          const button = element.shadowRoot.querySelector('.send-button');
          MockInteractions.tap(button);
          assert.isTrue(element.__requestAuthAwaiting);
        });

        it('calls execute() when authorization is not required', async () => {
          const method = AmfLoader.lookupOperation(amf, '/people', 'get');
          const element = await modelFixture(amf, method['@id']);
          await aTimeout(5);
          const spy = sinon.spy(element, 'execute');
          const button = element.shadowRoot.querySelector('.send-button');
          MockInteractions.tap(button);
          assert.isTrue(spy.called);
        });
      });
    });
  });
  // AMF 4 breaking changes the model and I have no way (?) of generating partial model.
  describe.skip('Partial model', () => {
    async function partialFixture(amf, selected, server, protocols, version) {
      return await fixture(html`<api-request-editor
        .amf="${amf}"
        .selected="${selected}"
        .server="${server}"
        .protocols="${protocols}"
        .version="${version}"></api-request-editor>`);
    }

    let amf;
    let server;
    let scheme;
    let version;
    before(async () => {
      const summary = await AmfLoader.load('partial-model/summary', false);
      const endpoint = await AmfLoader.load('partial-model/endpoint', false);
      server = summary['doc:encodes']['http:server'];
      scheme = [summary['doc:encodes']['http:scheme']];
      version = summary['doc:encodes']['schema-org:version'];
      amf = endpoint;
    });

    let element;
    beforeEach(async () => {
      clearCache();
      element = await partialFixture(amf, '#69', server, scheme, version);
      await aTimeout(50); // 50 for slower browsers
    });

    it('is invalid', () => {
      assert.isTrue(element.invalid);
    });

    it('url is computed', () => {
      assert.equal(element.url, 'http://petstore.swagger.io/v2/api/user?stringParameter=');
    });

    it('queryModel is computed', () => {
      assert.lengthOf(element._queryModel, 7);
    });
  });
});
