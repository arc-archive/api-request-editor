/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html, LitElement } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { UrlParser } from '@advanced-rest-client/url-parser/url-parser.js';
import { HeadersParserMixin } from '@advanced-rest-client/headers-parser-mixin/headers-parser-mixin.js';
import { apiFormStyles } from '@api-components/api-form-mixin/index.js';
import '@api-components/api-url-data-model/api-url-data-model.js';
import '@api-components/api-url-editor/api-url-editor.js';
import '@api-components/api-url-params-editor/api-url-params-editor.js';
import '@api-components/api-authorization/api-authorization.js';
import '@api-components/api-headers-editor/api-headers-editor.js';
import '@api-components/api-body-editor/api-body-editor.js';
import '@api-components/raml-aware/raml-aware.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/uuid-generator/uuid-generator.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@api-components/api-server-selector/api-server-selector.js';
import styles from './Styles.js';

/** @typedef {import('@api-components/api-url-data-model/index.js').ApiUrlDataModel} ApiUrlDataModel */
/** @typedef {import('@api-components/api-authorization/src/ApiAuthorization.js').ApiAuthorization} ApiAuthorization */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

/**
 * @typedef {Object} ServerParameters
 * @property {String=} id AMF model's ID for currently selected node.
 * @property {String=} type API Component's internal main selection value.
 * @property {String=} endpointId If available, current endpoint ID
 */

/**
 * `api-request-editor`
 *
 * @customElement
 * @demo demo/index.html
 * @mixes AmfHelperMixin
 * @mixes EventTargetMixin
 * @mixes HeadersParserMixin
 * @extends LitElement
 */
export class ApiRequestEditor extends HeadersParserMixin(AmfHelperMixin(EventsTargetMixin(LitElement))) {
  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: { type: String },
      /**
       * An `@id` of selected AMF shape. When changed it computes
       * method model for the selection.
       */
      selected: { type: String },
      /**
       * Hides the URL editor from the view.
       * The editor is still in the DOM and the `urlInvalid` property still will be set.
       */
      noUrlEditor: { type: Boolean },
      /**
       * When set it renders a label with the computed URL.
       * This intended to be used with `noUrlEditor` set to true.
       * This way it replaces the editor with a simple label.
       */
      urlLabel: { type: Boolean },
      /**
       * A base URI for the API. To be set if RAML spec is missing `baseUri`
       * declaration and this produces invalid URL input. This information
       * is passed to the URL editor that prefixes the URL with `baseUri` value
       * if passed URL is a relative URL.
       */
      baseUri: { type: String },
      /**
       * If set it computes `hasOptional` property and shows checkbox in the
       * form to show / hide optional properties.
       */
      allowHideOptional: { type: Boolean },
      /**
       * If set, enable / disable param checkbox is rendered next to each
       * form item.
       */
      allowDisableParams: { type: Boolean },
      /**
       * When set, renders "add custom" item button.
       * If the element is to be used withouth AMF model this should always
       * be enabled. Otherwise users won't be able to add a parameter.
       */
      allowCustom: { type: Boolean },
      /**
       * API server definition from the AMF model.
       *
       * This value to be set when partial AMF mnodel for an endpoint is passed
       * instead of web api to be passed to the `api-url-data-model` element.
       *
       * Do not set with full AMF web API model.
       */
      server: { type: Object },
      /**
       * Supported protocl versions.
       *
       * E.g.
       *
       * ```json
       * ["http", "https"]
       * ```
       *
       * This value to be set when partial AMF mnodel for an endpoint is passed
       * instead of web api to be passed to the `api-url-data-model` element.
       *
       * Do not set with full AMF web API model.
       */
      protocols: { type: Array },
      /**
       * API version name.
       *
       * This value to be set when partial AMF mnodel for an endpoint is passed
       * instead of web api to be passed to the `api-url-data-model` element.
       *
       * Do not set with full AMF web API model.
       */
      version: { type: String },
      /**
       * Enables compatibility with Anypoint styling
       */
      compatibility: { type: Boolean, reflect: true },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set all controls are disabled in the form
       */
      disabled: { type: Boolean },
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       */
      redirectUri: { type: String },
      /**
       * If set it will renders the view in the narrow layout.
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * Prohibits rendering of the documentation (the icon and the
       * description).
       */
      noDocs: { type: Boolean },
      /**
       * Computed value, true if any of the editors has invalid state.
       */
      invalid: { type: Boolean },
      /**
       * Computed from AMF model for the metod HTTP method name.
       */
      _httpMethod: { type: String },
      /**
       * Headers for the request.
       */
      _headers: { type: String },
      /**
       * Body for the request. The type of the body depends on
       * defined in the API media type.
       */
      _payload: { type: String },
      /**
       * Final request URL including settings like `baseUri`, AMF
       * model settings and user provided parameters.
       * This value is always computed by the `api-url-editor` even if it's
       * hidden from the view.
       */
      _url: { type: String },
      /**
       * Current content type.
       */
      _contentType: { type: String },
      /**
       * Computed value of security scheme from selected method.
       */
      _securedBy: { type: Array },
      /**
       * Computed list of headers in the AMF model
       */
      _apiHeaders: { type: Array },
      /**
       * Defined by the API payload data.
       */
      _apiPayload: { type: Array },
      /**
       * Computed value if the method can carry a payload.
       */
      _isPayloadRequest: { type: Boolean },
      /**
       * Inheritet from the authorization panel state if authorization
       * data is valid.
       */
      _authInvalid: { type: Boolean },
      /**
       * Flag set when the request is being made.
       */
      _loadingRequest: { type: Boolean },
      /**
       * Generated request ID when the request is sent. This value is reported
       * in send and abort events
       */
      _requestId: { type: String },
      /**
       * Request query parameters view model
       */
      _queryModel: { type: Array },
      /**
       * Request path parameters view model
       */
      _pathModel: { type: Array },
      /**
       * Computed when URL params editor is invalid.
       */
      _paramsInvalid: { type: Boolean },
      /**
       * Computed when headers editor is invalid.
       */
      _headersInvalid: { type: Boolean },
      /**
       * Validity state of the URL editor
       */
      _urlInvalid: { type: Boolean },

      _endpointUri: { type: String },
      _apiBaseUri: { type: String },
      /**
       * Holds the value of the currently selected server
       * Data type: URI
       */
      serverValue: { type: String },
      /**
       * Holds the type of the currently selected server
       * Values: `server` | `uri` | `custom`
       */
      serverType: { type: String },
      /**
       * Optional property to set
       * If true, the server selector is not rendered
       */
      noServerSelector: { type: Boolean },
      /**
       * Optional property to set
       * If true, the server selector custom base URI option is rendered
       */
      allowCustomBaseUri: { type: Boolean },
    };
  }

  get styles() {
    return [
      apiFormStyles,
      styles,
    ];
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selected = value;
    this.requestUpdate('selected', old);
    this._selectedChanged();
  }

  get url() {
    return this._url;
  }

  set url(value) {
    const old = this._url;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._url = value;
    this._urlChanged(value);
  }

  get invalid() {
    return this._invalid;
  }

  set invalid(value) {
    const old = this._invalid;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._invalid = value;
    this._invalidChnaged(value);
    this.requestUpdate('invalid', old);
  }

  get httpMethod() {
    return this._httpMethod;
  }

  get headers() {
    return this._headers;
  }

  get payload() {
    return this._payload;
  }

  get contentType() {
    return this._contentType;
  }

  get securedBy() {
    return this._securedBy;
  }

  get apiHeaders() {
    return this._apiHeaders;
  }

  get apiPayload() {
    return this._apiPayload;
  }

  get isPayloadRequest() {
    return this._isPayloadRequest;
  }

  get authInvalid() {
    return this._authInvalid;
  }

  get loadingRequest() {
    return this._loadingRequest;
  }

  get requestId() {
    return this._requestId;
  }

  get serversCount() {
    return this._serversCount;
  }

  set serversCount(value) {
    const old = this._serversCount;
    if (old === value) {
      return;
    }
    this._serversCount = value;
    this._updateServer();
    this.requestUpdate('serversCount', old);
  }

  get serverValue() {
    return this._serverValue;
  }

  set serverValue(value) {
    const old = this._serverValue;
    if (old === value) {
      return;
    }
    this._serverValue = value;
    this._updateServer();
    this.requestUpdate('serverValue', old);
  }

  get serverType() {
    return this._serverType;
  }

  set serverType(value) {
    const old = this._serverType;
    if (old === value) {
      return;
    }
    this._serverType = value;
    this._updateServer();
    this.requestUpdate('serverType', old);
  }

  /**
   * This is the final computed value for the baseUri to propagate downwards
   * If baseUri is defined, return baseUri
   * Else, return the selectedServerValue if serverType is not `server`
   */
  get effectiveBaseUri() {
    if (this.baseUri) {
      return this.baseUri;
    }
    if (this.serverType !== 'server') {
      return this.serverValue;
    }
    return '';
  }

  /**
   * @return {Boolean} True when there are not enough servers to render the selector
   */
  get _serverSelectorHidden() {
    const { serversCount = 0, noServerSelector } = this;
    return serversCount < 2 || noServerSelector;
  }

  /**
   * @return {ApiUrlDataModel|null} A reference to `api-url-data-model`
   * if exists in shadow DOM.
   */
  get apiUrlDataModel() {
    return /** @type {ApiUrlDataModel} */ (this.shadowRoot.querySelector('api-url-data-model'));
  }

  /**
   * @return {ApiAuthorization} A reference to the authorization panel, if exists
   */
  get _auth() {
    return /** @type {ApiAuthorization} */ (this.shadowRoot.querySelector('api-authorization'));
  }

  /**
   * @constructor
   */
  constructor() {
    super();
    this._responseHandler = this._responseHandler.bind(this);
    this._authRedirectChangedHandler = this._authRedirectChangedHandler.bind(this);
    this._handleNavigationChange = this._handleNavigationChange.bind(this);

    this.urlLabel = false;
    this.outlined = false;
    this.compatibility = false;
    this.readOnly = false;
    this.disabled = false;
  }

  _attachListeners(node) {
    node.addEventListener('api-response', this._responseHandler);
    node.addEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
    node.addEventListener('api-navigation-selection-changed', this._handleNavigationChange);
  }

  _detachListeners(node) {
    node.removeEventListener('api-response', this._responseHandler);
    node.removeEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
    node.removeEventListener('api-navigation-selection-changed', this._handleNavigationChange);
  }
  /**
   * Overrides `AmfHelperMixin.__amfChanged`.
   * It updates selection and clears cache in the model generator, per APIC-229
   */
  __amfChanged() {
    const modelGenerator = this.apiUrlDataModel;
    if (modelGenerator && modelGenerator.clearCache) {
      modelGenerator.clearCache();
    }
    this._updateServers();
    this._selectedChanged();
  }
  /**
   * Dispatches bubbling and composed custom event.
   * By default the event is cancelable until `cancelable` property is set to false.
   * @param {String} type Event type
   * @param {any=} detail A detail to set
   * @param {Boolean=} cancelable When false the event is not cancelable.
   * @return {CustomEvent}
   */
  _dispatch(type, detail, cancelable) {
    if (typeof cancelable !== 'boolean') {
      cancelable = true;
    }
    const e = new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable,
      detail
    });
    this.dispatchEvent(e);
    return e;
  }

  /**
   * Sends usage google analytics event
   * @param {String} action Action description
   * @param {String=} label Event label
   * @return {CustomEvent}
   */
  _sendGaEvent(action, label) {
    return this._dispatch('send-analytics', {
      type: 'event',
      category: 'Request editor',
      action,
      label
    }, false);
  }
  /**
   * Clears the request properties.
   */
  clearRequest() {
    this._url = '';
    this._headers = '';
    this._payload = '';
    this._dispatch('request-clear-state');
    this._sendGaEvent('Clear request');
  }

  _selectedChanged() {
    const { amf, selected } = this;
    if (!amf || !selected) {
      return;
    }
    const model = this._computeMethodAmfModel(amf, selected);
    if (!model) {
      return;
    }
    this._authInvalid = false;
    this._headersInvalid = false;
    this._paramsInvalid = false;
    this._authSettings = undefined;
    const method = this._httpMethod = this._getValue(model, this.ns.aml.vocabularies.apiContract.method);
    this._isPayloadRequest = this._computeIsPayloadRequest(method);
    this._securedBy = this._computeSecuredBy(model);
    this._apiHeaders = this. _computeHeaders(model);
    this._apiPayload = this._computeApiPayload(model);
    this._reValidate();
  }

  _computeMethodAmfModel(model, selected) {
    if (!model || !selected) {
      return;
    }
    if (model instanceof Array) {
      model = model[0];
    }
    if (this._hasType(model, this.ns.aml.vocabularies.document.Document)) {
      const webApi = this._computeWebApi(model);
      return this._computeMethodModel(webApi, selected);
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const methods = this._ensureArray(model[key]);
    if (!methods) {
      return;
    }
    for (let i = 0; i < methods.length; i++) {
      if (methods[i]['@id'] === selected) {
        return methods[i];
      }
    }
  }
  /**
   * Computes AMF model for authorization panel.
   *
   * @param {Object} model Current method model.
   * @return {Array|undefined} List of security definitions for the endpoint.
   */
  _computeSecuredBy(model) {
    if (!model) {
      return;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.security.security);
    let data = model[key];
    if (data && !Array.isArray(data)) {
      data = [data];
    }
    return data;
  }
  /**
   * Computes model definition for headers.
   *
   * @param {?Object} model Method model
   * @return {Array|undefined} List of headers or undefined.
   */
  _computeHeaders(model) {
    if (!model) {
      return;
    }
    const expects = this._computeExpects(model);
    if (!expects) {
      return;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.header);
    let headers = expects[key];
    if (headers && !(headers instanceof Array)) {
      headers = [headers];
    }
    return headers;
  }
  /**
   * Computes value for `apiPayload` property from AMF model for current
   * method.
   *
   * @param {Object} model Operation model.
   * @return {Array<Object>|undefined} Method payload.
   */
  _computeApiPayload(model) {
    if (!model) {
      return;
    }
    const expects = this._computeExpects(model);
    if (!expects) {
      return;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.payload);
    let payload = expects[key];
    if (payload && !(payload instanceof Array)) {
      payload = [payload];
    }
    return payload;
  }
  /**
   * Computes value for `isPayloadRequest`.
   * Only `GET` and `HEAD` methods are known as ones that can't carry a
   * payload. For any other HTTP method this always returns true.
   *
   * @param {String} method HTTP method value
   * @return {Boolean}
   */
  _computeIsPayloadRequest(method) {
    return ['get', 'head'].indexOf(method) === -1;
  }
  /**
   * Handles send button click.
   * Depending on authorization validity it either sends the
   * request or forces authorization and sends the request.
   */
  _sendHandler() {
    if (this._authInvalid) {
      this.authAndExecute();
    } else {
      this.execute();
    }
  }

  /**
   * To be called when the user want to execute the request but
   * authorization is invalid (missin values).
   * This function brings the auth panel to front and displays error toast
   *
   * TODO: There is a case when the user didn't requested OAuth2 token
   * but provided all the data. This function should check for this
   * condition and call authorization function automatically.
   */
  authAndExecute() {
    this.__requestAuthAwaiting = true;
    const panel = this._auth;
    let result;
    if (panel) {
      result = panel.forceAuthorization(false);
    }
    if (!result) {
      const toast = this.shadowRoot.querySelector('#authFormError');
      toast.opened = true;
    }
  }
  /**
   * Executes the request by dispatching `api-request` custom event.
   * The event must be handled by hosting application to ensure transport.
   * Use `advanced-rest-client/xhr-simple-request` component to add logic
   * that uses XHR as a transport.
   *
   * Hosting application also must reset state of `loadingRequest` property
   * once the response is ready. It also can dispatch `api-response`
   * custom event handled by this element to reset state. This is also
   * handled by `xhr-simple-request` component.
   */
  execute() {
    this._loadingRequest = true;
    const request = this.serializeRequest();
    const uuid = this.shadowRoot.querySelector('#uuid').generate();
    this._requestId = uuid;
    request.id = uuid;
    this._dispatch('api-request', request);
    this._sendGaEvent('request-execute', 'true');
  }
  /**
   * Sends the `abort-api-request` custom event to cancel the request.
   * Calling this method befor sending request may have unexpected
   * behavior because `requestId` is only set with `execute()` method.
   */
  abort() {
    this._dispatch('abort-api-request', {
      url: this.url,
      id: this.requestId
    });
    this._sendGaEvent('request-abort', 'true');
    this._loadingRequest = false;
    this._requestId = undefined;
  }
  /**
   * Event handler for abort click.
   */
  _abortRequest() {
    this.abort();
  }
  /**
   * Returns an object with the request properties.
   * The object contains:
   * - `method` (String)
   * - `url` (String)
   * - `headers` (String)
   * - `payload` (String)
   * - `auth` (Object)
   *
   * The `auth` property is optional and is only added to the request if
   * simple `authorization` header will not work. For example NTLM auth
   * method has to be made on a single socket connection (authorization
   * and the request) so it can't be made before the request.
   *
   * The `auth` object contains 2 properties:
   * - `type` (String) the authorization type - one of from the
   * `auth-methods` element
   * - `settings` (Object) Authorization parameters entered by the user.
   * It vary and depends on selected auth method.
   * For example in case of the NTLM it will be: `username`, `password` and
   * `domain`. See `advanced-rest-client/auth-methods` for model descriptions.
   *
   * @return {Object}
   */
  serializeRequest() {
    const result = {
      method: (this._httpMethod || 'get').toUpperCase(),
      url: this._url,
      headers: this._headers || '',
    };
    if (['GET', 'HEAD'].indexOf(result.method) === -1) {
      result.payload = this._payload;
    }

    if (this._securedBy) {
      const node = this._auth;
      const { settings=[] } = node;
      if (settings.length) {
        const params = node.createAuthParams();
        this._applyAuthorization(result, settings, params);
        const oa1 = this.shadowRoot.querySelector('oauth1-authorization');
        oa1.signRequest(result, settings);
      }
    }
    return result;
  }

  /**
   * A function that applies authorization parameters to the request object.
   *
   * @param {Object} request The request object
   * @param {Array<Object>} settings The authorization settings from the auth panel
   * @param {Object} authParams A parameters to apply to the request
   * @param {Object} authParams.headers A map of headers to apply to the request
   * @param {Object} authParams.params A map of query parameters to apply to the request
   * @param {Object} authParams.cookies A map of cookies to apply to the request
   */
  _applyAuthorization(request, settings, authParams) {
    request.auth = settings;
    const { headers, params } = authParams;
    this._applyQueryParams(request, params);
    this._applyHeaders(request, headers);
  }

  /**
   * Applies a map of query parameters to the request object.
   * @param {Object} request The request object
   * @param {Object} params A map of query parameters to apply to the request
   */
  _applyQueryParams(request, params) {
    const keys = Object.keys(params);
    if (!keys.length) {
      return;
    }
    const parser = new UrlParser(request.url);
    const sparams = parser.searchParams;
    for (let i = 0, len = keys.length; i < len; i++) {
      const name = keys[i];
      const value = params[name];
      const index = sparams.findIndex((item) => item[0] === name);
      if (index !== -1) {
        sparams.splice(index, 1);
      }
      sparams.push([name, value]);
    }
    parser.searchParams = sparams;
    request.url = parser.toString();
  }

  /**
   * Applies a map of headers to the request object.
   * @param {Object} request The request object
   * @param {Object} headers A map of headers to apply to the request
   */
  _applyHeaders(request, headers) {
    const keys = Object.keys(headers);
    if (!keys.length) {
      return;
    }
    if (request.headers === undefined) {
      request.headers = '';
    }
    const list = this.headersToJSON(request.headers);
    for (let i = 0, len = keys.length; i < len; i++) {
      const name = keys[i];
      const value = headers[name];
      const index = list.findIndex((item) => item.name === name);
      if (index !== -1) {
        list.splice(index, 1);
      }
      list.push({ name, value });
    }
    request.headers = this.headersToString(list);
  }

  /**
   * Handler for the `api-response` custom event.
   * Clears the loading state.
   *
   * @param {CustomEvent} e
   */
  _responseHandler(e) {
    if (!e.detail || (e.detail.id !== this.requestId)) {
      return;
    }
    this._loadingRequest = false;
  }
  /**
   * Handler for the `oauth2-redirect-uri-changed` custom event. Changes
   * the `redirectUri` property.
   * @param {CustomEvent} e
   */
  _authRedirectChangedHandler(e) {
    this.redirectUri = e.detail.value;
  }
  /**
   * Dispatches `url-value-changed` event when url value change.
   * @param {String} value
   */
  _urlChanged(value) {
    this._dispatch('url-value-changed', {
      value
    });
  }
  /**
   * Sets `invalid` and `aria-invalid` attributes on the element.
   * @param {Boolean} invalid Current state of ivalid state
   */
  _invalidChnaged(invalid) {
    if (invalid) {
      this.setAttribute('invalid', '');
      this.setAttribute('aria-invalid', 'true');
    } else {
      this.removeAttribute('invalid');
      this.removeAttribute('aria-invalid');
    }
  }

  get _sendLabel() {
    return this._authInvalid ? 'Authorize and send' : 'Send';
  }

  _apiChanged(e) {
    this.amf = e.detail.value;
  }

  _urlHandler(e) {
    this.url = e.detail.value;
  }

  async _endpointUriHandler(e) {
    await this.updateComplete;
    this._endpointUri = e.detail.value;
  }

  async _apiBaseUriHandler(e) {
    await this.updateComplete;
    this._apiBaseUri = e.detail.value;
  }

  async _pathModelHandler(e) {
    await this.updateComplete;
    this._pathModel = e.detail.value;
  }

  async _queryModelHandler(e) {
    await this.updateComplete;
    this._queryModel = e.detail.value;
  }

  async _contentTypeHandler(e) {
    await this.updateComplete;
    this._contentType = e.detail.value;
  }

  _authInvalidChanged(e) {
    this._authInvalid = e.detail.value;
    this._reValidate();
  }

  _paramsInvalidChanged(e) {
    this._paramsInvalid = e.detail.value;
    this._reValidate();
  }

  _headersInvalidChanged(e) {
    this._headersInvalid = e.detail.value;
    this._reValidate();
  }

  _urlInvalidChanged(e) {
    this._urlInvalid = e.detail.value;
    this._reValidate();
  }

  _headersHandler(e) {
    this._headers = e.detail.value;
  }

  _payloadHandler(e) {
    this._payload = e.detail.value;
  }

  async _reValidate() {
    await this.updateComplete;
    const { _authInvalid, _urlInvalid, _paramsInvalid, _headersInvalid } = this;
    const state = !!(_authInvalid || _urlInvalid || _headersInvalid || _paramsInvalid);
    this.invalid = state;
    this.requestUpdate();
  }

  get _hideParamsEditor() {
    if (this.allowCustom) {
      return false;
    }
    const { _pathModel, _queryModel } = this;
    return (!_pathModel || _pathModel.length === 0) && (!_queryModel || _queryModel.length === 0);
  }

  _authChanged(e) {
    const valid = e.target.validate();
    if (valid && this.__requestAuthAwaiting) {
      this.__requestAuthAwaiting = false;
      this.execute();
    }
    this._authInvalid = !valid;
    this._reValidate();
  }

  /**
   * Computes a current server value for selection made in the server selector.
   */
  _updateServer() {
    const { serverValue, serverType } = this;
    if (serverType !== 'server') {
      this.server = undefined;
    } else {
      this.server = this._findServerByValue(serverValue);
    }
  }

  /**
   * @param {String} value Server's base URI
   * @return {Object|undefined} An element associated with the base URI or
   * undefined if not found.
   */
  _findServerByValue(value) {
    const { servers = [] } = this;
    return servers.find((server) => this._getServerUri(server) === value);
  }

  /**
   * @param {Object} server Server definition.
   * @return {String|undefined} Value for server's base URI
   */
  _getServerUri(server) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.core.urlTemplate);
    return this._getValue(server, key);
  }

  /**
   * Updates the list of servers for current operation so a server for current
   * selection can be computed.
   * @param {ServerParameters=} [params={}]
   */
  _updateServers({ id, type, endpointId } = {}) {
    let methodId;
    if (type === 'method') {
      methodId = id;
    }
    if (type === 'endpoint') {
      endpointId = id;
    }
    this.servers = this._getServers({ endpointId, methodId });
  }

  /**
   * Handler for the `serverscountchanged` dispatched from the server selector.
   * @param {CustomEvent} e
   */
  _serverCountHandler(e) {
    const { value } = e.detail;
    this.serversCount = value;
  }

  /**
   * Handler for the `apiserverchanged` dispatched from the server selector.
   * @param {CustomEvent} e
   */
  _serverHandler(e) {
    const { value, type } = e.detail;
    this.serverType = type;
    this.serverValue = value;
  }

  /**
   * Computes available servers when a method is selected in the navigation.
   *
   * @param {CustomEvent} e
   */
  _handleNavigationChange(e) {
    const { selected: id, type, endpointId } = e.detail;
    if (type !== 'method') {
      return;
    }
    this._updateServers({ id, type, endpointId });
  }

  render() {
    const {
      styles,
    } = this;
    return html`<style>${styles}</style>
    ${this._awareTemplate()}
    ${this._oauthHandlersTemplate()}
    ${this._urlDataModelTemplate()}
    <div class="content">
      ${this._serverSelectorTemplate()}
      ${this._urlEditorTemplate()}
      ${this._urlLabelTemplate()}
      ${this._paramsEditorTemplate()}
      ${this._headersEditorTemplate()}
      ${this._bodyEditorTemplate()}
      ${this._authTemplate()}
      ${this._formActionsTemplate()}
      <paper-toast
        text="Authorization for this endpoint is required"
        id="authFormError"
        horizontal-align="right"
        horizontal-offset="12"></paper-toast>
      <uuid-generator id="uuid"></uuid-generator>
    </div>`;
  }

  _oauthHandlersTemplate() {
    const { eventsTarget } = this;
    return html`
    <oauth2-authorization .eventsTarget="${eventsTarget}"></oauth2-authorization>
    <oauth1-authorization .eventsTarget="${eventsTarget}" ignoreBeforeRequest></oauth1-authorization>`;
  }

  _awareTemplate() {
    const {
      aware,
    } = this;
    if (!aware) {
      return '';
    }
    return html`<raml-aware
      .scope="${aware}"
      @api-changed="${this._apiChanged}"></raml-aware>`;
  }

  _urlDataModelTemplate() {
    const {
      amf,
      effectiveBaseUri,
      selected,
      server,
      protocols,
      version,
    } = this;
    return html`<api-url-data-model
      @apibaseuri-changed="${this._apiBaseUriHandler}"
      @pathmodel-changed="${this._pathModelHandler}"
      @querymodel-changed="${this._queryModelHandler}"
      @endpointpath-changed="${this._endpointUriHandler}"
      .amf="${amf}"
      .apiUri="${effectiveBaseUri}"
      .selected="${selected}"
      .server="${server}"
      .protocols="${ifDefined(protocols)}"
      .version="${ifDefined(version)}"
    ></api-url-data-model>`;
  }

  _urlEditorTemplate() {
    const {
      noUrlEditor,
      _apiBaseUri,
      _endpointUri,
      _queryModel,
      _pathModel,
      eventsTarget,
      readOnly,
      disabled,
      outlined,
      compatibility,
    } = this;
    return html`<div class="url-editor" ?hidden="${noUrlEditor}">
      <api-url-editor
        @value-changed="${this._urlHandler}"
        @invalid-changed="${this._urlInvalidChanged}"
        ?required="${!noUrlEditor}"
        autovalidate
        .baseUri="${_apiBaseUri}"
        .endpointPath="${_endpointUri}"
        .queryModel="${_queryModel}"
        .pathModel="${_pathModel}"
        .eventsTarget="${eventsTarget}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
      ></api-url-editor>
    </div>`;
  }

  /**
   * @return {TemplateResult|string} Template for the request URL label.
   */
  _urlLabelTemplate() {
    const { urlLabel, _url } = this;
    if (!urlLabel) {
      return '';
    }
    return html`<div class="url-label" title="Current request URL">${_url}</div>`;
  }

  _paramsEditorTemplate() {
    const {
      _hideParamsEditor,
      noDocs,
      narrow,
      _queryModel,
      _pathModel,
      allowCustom,
      readOnly,
      disabled,
      outlined,
      compatibility,
    } = this;
    return html`<div class="editor-section" ?hidden="${_hideParamsEditor}">
      <api-url-params-editor
        @invalid-changed="${this._paramsInvalidChanged}"
        @urimodel-changed="${this._pathModelHandler}"
        @querymodel-changed="${this._queryModelHandler}"
        .uriModel="${_pathModel}"
        .queryModel="${_queryModel}"
        .noDocs="${noDocs}"
        ?narrow="${narrow}"
        ?allowcustom="${allowCustom}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
      ></api-url-params-editor>
    </div>`;
  }

  _headersEditorTemplate() {
    const {
      _apiHeaders,
      noDocs,
      narrow,
      eventsTarget,
      amf,
      allowCustom,
      readOnly,
      disabled,
      outlined,
      compatibility,
      _isPayloadRequest,
      allowDisableParams,
      allowHideOptional,
    } = this;
    return html`<div class="editor-section" ?hidden="${!_apiHeaders}">
      <div role="heading" aria-level="2" class="section-title">Headers</div>
      <api-headers-editor
        @content-type-changed="${this._contentTypeHandler}"
        @value-changed="${this._headersHandler}"
        @invalid-changed="${this._headersInvalidChanged}"
        .eventsTarget="${eventsTarget}"
        .amf="${amf}"
        .amfHeaders="${_apiHeaders}"
        .noDocs="${noDocs}"
        .isPayload="${_isPayloadRequest}"
        ?narrow="${narrow}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        ?allowcustom="${allowCustom}"
        ?allowDisableParams="${allowDisableParams}"
        ?allowHideOptional="${allowHideOptional}"
        autovalidate
        ></api-headers-editor>
    </div>`;
  }

  _bodyEditorTemplate() {
    if (!this._isPayloadRequest || !this._apiPayload) {
      return '';
    }
    const {
      _apiPayload,
      narrow,
      eventsTarget,
      amf,
      allowCustom,
      readOnly,
      disabled,
      outlined,
      compatibility,
      _contentType,
      allowDisableParams,
      allowHideOptional,
    } = this;

    return html`<div class="editor-section">
      <div role="heading" aria-level="2" class="section-title">Body</div>
      <api-body-editor
        @content-type-changed="${this._contentTypeHandler}"
        @value-changed="${this._payloadHandler}"
        .eventsTarget="${eventsTarget}"
        .amf="${amf}"
        .amfBody="${_apiPayload}"
        ?narrow="${narrow}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        .contentType="${_contentType}"
        ?allowcustom="${allowCustom}"
        ?allowDisableParams="${allowDisableParams}"
        ?allowHideOptional="${allowHideOptional}"
        linenumbers></api-body-editor>
    </div>`;
  }

  _authTemplate() {
    if (!this._securedBy) {
      return '';
    }
    const {
      amf,
      redirectUri,
      readOnly,
      disabled,
      outlined,
      compatibility,
      _securedBy,
    } = this;
    return html`<div class="editor-section">
      <div role="heading" aria-level="2" class="section-title">Credentials</div>
      <api-authorization
        .amf="${amf}"
        .security="${_securedBy}"
        .redirectUri="${redirectUri}"
        ?readOnly="${readOnly}"
        ?disabled="${disabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        @invalid-changed="${this._authInvalidChanged}"
        @change=${this._authChanged}
      ></api-authorization>
    </div>`;
  }

  _formActionsTemplate() {
    const {
      _loadingRequest,
      invalid,
    } = this;
    return html`<div class="action-bar">
      ${_loadingRequest ?
        this._abortButtonTemplate() :
        this._sendButtonTemplate()}
      ${invalid ? html`<span class="invalid-info">Fill in required parameters</span>` : ''}
      <paper-spinner alt="Loading request" .active="${_loadingRequest}"></paper-spinner>
    </div>`;
  }

  /**
   * Creates a template for the "abort" button.
   *
   * @return {TemplateResult}
   */
  _abortButtonTemplate() {
    const {
      compatibility,
    } = this;
    return html`<anypoint-button
      class="send-button abort"
      emphasis="high"
      ?compatibility="${compatibility}"
      @click="${this._abortRequest}">Abort</anypoint-button>`;
  }

  /**
   * Creates a template for the "send" or "auth and send" button.
   *
   * @return {TemplateResult}
   */
  _sendButtonTemplate() {
    const {
      compatibility,
    } = this;
    return html`<anypoint-button
      class="send-button"
      emphasis="high"
      ?compatibility="${compatibility}"
      @click="${this._sendHandler}">${this._sendLabel}</anypoint-button>`;
  }

  /**
   * @return {TemplateResult} A template for the server selector
   */
  _serverSelectorTemplate() {
    const {
      amf,
      serverType,
      serverValue,
      allowCustomBaseUri,
      outlined,
      compatibility,
      _serverSelectorHidden,
      selected,
    } = this;
    return html`
    <api-server-selector
      ?hidden="${_serverSelectorHidden}"
      ?allowCustom="${allowCustomBaseUri}"
      .amf="${amf}"
      .value="${serverValue}"
      .type="${serverType}"
      .selectedValue="${selected}"
      autoselect
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      @serverscountchanged="${this._serverCountHandler}"
      @apiserverchanged="${this._serverHandler}"
    >
      <slot name="custom-base-uri" slot="custom-base-uri"></slot>
    </api-server-selector>`;
  }
  /**
   * Dispatched when the user requests to send current request.
   *
   * This event can be cancelled.
   *
   * @event api-request
   * @param {String} url The request URL. Can be empty string.
   * @param {String} method HTTP method name. Can be empty.
   * @param {String} headers HTTP headers string. Can be empty.
   * @param {String|File|FormData} payload Message body. Can be undefined.
   * @param {?Array<Object>} auth Authorization settings from the auth panel.
   * May be `undefined`.
   * @param {String} id Generated UUID for the request. Each call of
   * `execute()` function regenerates the `id`.
   * @param {?Array<Object>} queryModel Query parameters data view model
   * @param {?Array<Object>} pathModel URI parameters data view model
   * @param {?Array<Object>} headersModel Headers data view model
   */
  /**
   * Fired when the user requests to abort current request.
   *
   * This event can be cancelled.
   *
   * @event abort-api-request
   * @param {String} url The request URL. Can be empty string. Also, it may be
   * different URL that the one used to send the request if the user changed
   * it in between. Use the `id` property to compare requests.
   * @param {String} id Generated UUID of the request with `send-request`
   * event.
   */

  /**
   * Dispatched when query model changed.
   *
   * @event request-query-model-changed
   * @param {Array<Object>} value List of current query parameters.
   * Each object contains `name`, `value` and `enabled` property.
   * If `enable` equals `false` (boolean) it means that the user disabled
   * this property in the editor.
   */
  /**
   * Dispatched when path variables model changed.
   *
   * @event request-path-model-changed
   * @param {Array<Object>} value List of current path parameters.
   * Each object contains `name`, `value` and `enabled` property.
   * Enabled property is here only for consistency with
   * `request-query-model-changed`. The UI does not offer turning this
   * properties off. It's always true
   */
  /**
   * Dispatched when request URL change
   * @event url-value-changed
   * @param {String} value New value of request URL
   */
}
