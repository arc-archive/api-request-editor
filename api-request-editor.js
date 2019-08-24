import { html, css, LitElement } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import formStyles from '@api-components/api-form-mixin/api-form-styles.js';
import '@api-components/api-url-data-model/api-url-data-model.js';
import '@api-components/api-url-editor/api-url-editor.js';
import '@api-components/api-url-params-editor/api-url-params-editor.js';
import '@advanced-rest-client/authorization-panel/authorization-panel.js';
import '@api-components/api-headers-editor/api-headers-editor.js';
import '@api-components/api-body-editor/api-body-editor.js';
import '@api-components/raml-aware/raml-aware.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/uuid-generator/uuid-generator.js';
/**
 * `api-request-editor`
 *
 * @customElement
 * @demo demo/index.html
 * @appliesMixin EventsTargetMixin
 * @appliesMixin AmfHelperMixin
 * @memberof ApiElements
 */
class ApiRequestEditor extends AmfHelperMixin(EventsTargetMixin(LitElement)) {
  static get styles() {
    return [
      formStyles,
      css`:host {
        display: block;
      }

      .content {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .content > * {
        margin: 0;
      }

      [hidden] {
        display: none !important;
      }

      .panel-warning {
        width: 16px;
        height: 16px;
        margin-left: 4px;
        color: var(--error-color, #FF7043);
      }

      .invalid-info {
        color: var(--error-color);
        margin-left: 12px;
      }

      paper-spinner {
        margin-right: 8px;
      }

      .action-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-top: 8px;
      }

      .url-editor {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      api-url-editor {
        flex: 1;
      }

      :host([narrow]) .content {
        display: flex;
        flex-direction: columns;
      }

      :host([narrow]) api-url-editor {
        width: auto;
      }`
    ];
  }

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
       * Computed method declaration in the AMF model.
       */
      _methodModel: { type: Object },
      /**
       * Hides the URL editor from the view.
       * The editor is still in the DOM and the `urlInvalid` property still will be set.
       */
      noUrlEditor: { type: Boolean },
      /**
       * A base URI for the API. To be set if RAML spec is missing `baseUri`
       * declaration and this produces invalid URL input. This information
       * is passed to the URL editor that prefixes the URL with `baseUri` value
       * if passed URL is a relative URL.
       */
      baseUri: { type: String },
      /**
       * Computed from AMF model for the metod HTTP method name.
       *
       * @type {String}
       */
      _httpMethod: { type: String },
      /**
       * Headers for the request.
       *
       * @type {String|undefined}
       */
      _headers: { type: String },
      /**
       * Body for the request. The type of the body depends on
       * defined in the API media type.
       *
       * @type {String|FormData|File}
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
       *
       * @type {String|undefined}
       */
      _contentType: { type: String },
      /**
       * Computed value of security scheme from selected method.
       *
       * @type {Array<Object>}
       */
      _securedBy: { type: Array },
      /**
       * Computed list of headers in the AMF model
       *
       * @type {Array<Object>}
       */
      _apiHeaders: { type: Array },
      /**
       * Defined by the API payload data.
       *
       * @type {Array<Object>|undefined}
       */
      _apiPayload: { type: Array },
      /**
       * Computed value if the method can carry a payload.
       */
      _isPayloadRequest: { type: Boolean },
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       */
      redirectUri: { type: String },
      /**
       * Inheritet from the authorization panel state if authorization
       * data is valid.
       */
      _authInvalid: { type: Boolean },
      /**
       * If set it will renders the view in the narrow layout.
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * Flag set when the request is being made.
       */
      _loadingRequest: { type: Boolean },
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
      // Selected by the user auth method (if any)
      _authMethod: { type: String },
      // Current authorization settings.
      _authSettings: { type: Object },
      /**
       * Generated request ID when the request is sent. This value is reported
       * in send and abort events
       */
      _requestId: { type: String },
      /**
       * Request query parameters view model
       * @type {Array<Object>}
       */
      _queryModel: { type: Array },
      /**
       * Request path parameters view model
       * @type {Array<Object>}
       */
      _pathModel: { type: Array },
      /**
       * Computed when URL params editor is invalid.
       */
      _paramsInvalid: { type: Boolean },
      /**
       * Computed when headers editor is invalid.
       */
      headersInvalid: { type: Boolean },
      /**
       * Prohibits rendering of the documentation (the icon and the
       * description).
       */
      noDocs: { type: Boolean },
      /**
       * Computed value, true if any of the editors has invalid state.
       */
      invalid: {
        type: Boolean,
        notify: true,
        observer: '_invalidChnaged',
        computed:
        '_computeInvalid(urlInvalid, paramsInvalid, headersInvalid, authValid, authNotRequired)'
      },
      /**
       * Validity state of the URL editor
       */
      _urlInvalid: { type: Boolean },
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
       * Enables Anypoint legacy styling
       */
      legacy: { type: Boolean, reflect: true },
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
      _endpointUri: { type: String },
      _apiBaseUri: { type: String }
    };
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    /* istanbul ignore if */
    if (old === value) {
      return false;
    }
    this._selected = value;
    this.requestUpdate('selected', old);
    this._selectedChanged();
  }

  get amf() {
    return this._amf;
  }

  set amf(value) {
    const old = this._amf;
    /* istanbul ignore if */
    if (old === value) {
      return false;
    }
    this._amf = value;
    this._selectedChanged();
  }

  get url() {
    return this._url;
  }

  set url(value) {
    const old = this._url;
    /* istanbul ignore if */
    if (old === value) {
      return false;
    }
    this._url = value;
    this._urlChanged(value);
  }

  get methodModel() {
    return this._methodModel;
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

  static get observers() {
    return [
      '_pathModelChanged(pathModel.*)',
      '_queryModelChanged(queryModel.*)'
    ];
  }
  /**
   * @constructor
   */
  constructor() {
    super();
    this._authSettingsChanged = this._authSettingsChanged.bind(this);
    this._responseHandler = this._responseHandler.bind(this);
    this._authRedirectChangedHandler = this._authRedirectChangedHandler.bind(this);
  }

  _attachListeners(node) {
    this.addEventListener('authorization-settings-changed', this._authSettingsChanged);
    window.addEventListener('api-response', this._responseHandler);
    node.addEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
  }

  _detachListeners(node) {
    this.removeEventListener('authorization-settings-changed', this._authSettingsChanged);
    window.removeEventListener('api-response', this._responseHandler);
    node.removeEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
  }
  /**
   * Dispatches bubbling and composed custom event.
   * By default the event is cancelable until `cancelable` property is set to false.
   * @param {String} type Event type
   * @param {?any} detail A detail to set
   * @param {?Boolean} cancelable When false the event is not cancelable.
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
   * @param {String} label Event label
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
    this.url = '';
    this.headers = '';
    this.payload = '';
    const node = this.shadowRoot.querySelector('authorization-panel');
    if (node) {
      node.clear();
    }
    this._dispatch('request-clear-state');
    this._sendGaEvent('Clear request');
  }

  _selectedChanged() {
    const { amf, selected } = this;
    if (!amf || !selected) {
      return;
    }
    const model = this._methodModel = this._computeMethodAmfModel(amf, selected);
    if (!model) {
      return;
    }
    const method = this._httpMethod = this._getValue(model, this.ns.w3.hydra.core + 'method');
    this._isPayloadRequest = this._computeIsPayloadRequest(method);
    this._securedBy = this._computeSecuredBy(model);
    this._apiHeaders = this. _computeHeaders(model);
    this._apiPayload = this._computeApiPayload(model);
  }

  _computeMethodAmfModel(model, selected) {
    if (!model || !selected) {
      return;
    }
    if (model instanceof Array) {
      model = model[0];
    }
    if (this._hasType(model, this.ns.raml.vocabularies.document + 'Document')) {
      const webApi = this._computeWebApi(model);
      return this._computeMethodModel(webApi, selected);
    }
    const key = this._getAmfKey(this.ns.w3.hydra.supportedOperation);
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
    const key = this._getAmfKey(this.ns.raml.vocabularies.security + 'security');
    let data = model[key];
    if (data && !(data instanceof Array)) {
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
    const key = this._getAmfKey(this.ns.raml.vocabularies.http + 'header');
    let headers = expects[key];
    if (headers && !(headers instanceof Array)) {
      headers = [headers];
    }
    return headers;
  }
  /**
   * Computes if authorization for the endpoint is set.
   *
   * @param {Object} model Operation model.
   * @return {Boolean}
   */
  _computeNoAuth(model) {
    return !(model && model[0]);
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
    const key = this._getAmfKey(this.ns.raml.vocabularies.http + 'payload');
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
   * Updates tabs selection when `authNotRequired` property change.
   * It changes selection to the next tab if there's no authorization
   * and current selected editor is authorization.
   *
   * @param {Boolean} value Current value for `authNotRequired`
   */
  _noAuthChanged(value) {
    if (!value && this.selectedTab === 2) {
      this.selectedTab = 0;
    } else if (value && this.selectedTab === 0) {
      this.selectedTab = 1;
    }
    this._refreshTabs();
    this._sendGaEvent('no-auth-changed', String(value));
  }
  /**
   * Handles send button click.
   * Depending on authorization validity it either sends the
   * request or forces authorization and sends the request.
   */
  _sendHandler() {
    if (this.authValid) {
      this.execute();
    } else {
      this.authAndExecute();
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
    const panel = this.shadowRoot.querySelector('authorization-panel');
    let result;
    if (panel) {
      result = panel.forceTokenAuthorization();
    }
    if (!result) {
      if (this.selectedTab !== 0) {
        this.selectedTab = 0;
      }
      this.$.authFormError.opened = true;
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
    this.loadingRequest = true;
    const request = this.serializeRequest();
    const uuid = this.shadowRoot.querySelector('uuid').generate();
    this.requestId = uuid;
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
    this.loadingRequest = false;
    this.requestId = undefined;
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
      payload: this._payload,
      queryModel: this._queryModel,
      pathModel: this._pathModel,
      headersModel: this.shadowRoot.querySelector('api-headers-editor').viewModel
    };
    if (this.authMethod && this.authSettings) {
      result.auth = this.authSettings;
      result.authType = this.authMethod;
    }
    return result;
  }
  /**
   * Handler for the `authorization-settings-changed` dispatched by
   * authorization panel. Sets auth settings and executes the request if
   * any pending if valid.
   *
   * @param {CustomEvent} e
   */
  _authSettingsChanged(e) {
    this.authMethod = e.detail.type;
    this.authSettings = e.detail.settings;
    if (e.detail.valid && this.__requestAuthAwaiting) {
      this.__requestAuthAwaiting = false;
      this.execute();
    }
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
    this.loadingRequest = false;
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
   * Handler for path model change
   * @param {Object} record Polymer's change record
   */
  _pathModelChanged(record) {
    const model = record.base;
    const path = record.path;
    if (!model || !path) {
      return;
    }
    if (path === 'pathModel' || (/^pathModel\.\d+\.(name|value|schema\.enabled)$/).test(path)) {
      this._notifyModelChanged('path', model);
    }
  }
  /**
   * Handler for query model change
   * @param {Object} record Polymer's change record
   */
  _queryModelChanged(record) {
    const model = record.base;
    const path = record.path;
    if (!model || !path) {
      return;
    }
    if (path === 'queryModel' || path === 'queryModel.length' ||
      (/^queryModel\.\d+\.(name|value|schema\.enabled)$/).test(path)) {
      this._notifyModelChanged('query', model);
    }
  }
  /**
   * Dispatches model change event
   * @param {String} type Model name
   * @param {Array} model Current model value.
   */
  _notifyModelChanged(type, model) {
    const result = [];
    if (model) {
      model.forEach((item) => {
        if (!item.name) {
          return;
        }
        result.push({
          name: item.name,
          value: item.value,
          enabled: item.schema.enabled
        });
      });
    }
    this._dispatch('request-' + type + '-model-changed', {
      value: result
    });
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
   * Computes value if `invalid` property.
   * @param {Boolean} urlInvalid
   * @param {Boolean} paramsInvalid
   * @param {Boolean} headersInvalid
   * @param {Boolean} authValid
   * @param {Boolean} authNotRequired
   * @return {Boolean}
   */
  _computeInvalid(urlInvalid, paramsInvalid, headersInvalid, authValid, authNotRequired) {
    if (urlInvalid || paramsInvalid || headersInvalid) {
      return true;
    }
    return authNotRequired === false && authValid === false;
  }
  /**
   * Sets `invalid` and `aria-invalid` attributes on the element.
   * @param {Boolean} invalid Current state of ivalid state
   */
  _invalidChnaged(invalid) {
    if (invalid) {
      this.setAttribute('invalid', true);
      this.setAttribute('aria-invalid', true);
    } else {
      this.removeAttribute('invalid');
      this.removeAttribute('aria-invalid');
    }
  }
  /**
   * Computes label for the send button.
   * If authorization state is ivalid then label is different.
   * @param {Boolean} authValid [description]
   * @return {String}
   */
  _computeSendLabel(authValid) {
    return authValid ? 'Send' : 'Authorize and send';
  }
  /**
   * Computes value to disable send button when the form is invalid.
   * THe button is active when auth is the only invalid state
   * @param {Boolean} urlInvalid
   * @param {Boolean} paramsInvalid
   * @param {Boolean} headersInvalid
   * @return {Boolean}
   */
  _computeSendDisabled(urlInvalid, paramsInvalid, headersInvalid) {
    if (urlInvalid || paramsInvalid || headersInvalid) {
      return true;
    }
    return false;
  }

  _apiChanged(e) {
    this.amf = e.detail.value;
  }

  _urlInvalidChanged(e) {
    this._urlInvalid = e.detail.value;
  }

  _urlHandler(e) {
    console.log('url', e.detail.value);
    this.url = e.detail.value;
  }

  async _endpointUriHandler(e) {
    await this.updateComplete;
    console.log('_endpointUri', e.detail.value);
    this._endpointUri = e.detail.value;
  }

  async _apiBaseUriHandler(e) {
    await this.updateComplete;
    console.log('_apiBaseUri', e.detail.value);
    this._apiBaseUri = e.detail.value;
  }

  async _pathModelHandler(e) {
    await this.updateComplete;
    console.log('_pathModel', e.detail.value);
    this._pathModel = e.detail.value;
  }

  async _queryModelHandler(e) {
    await this.updateComplete;
    console.log('_queryModel', e.detail.value);
    this._queryModel = e.detail.value;
  }

  _contentTypeHandler(e) {
    console.log('_contentType', e.detail.value);
    this._contentType = e.detail.value;
  }

  _authInvalidChanged(e) {
    console.log('_authInvalid', e.detail.value);
    this._authInvalid = e.detail.value;
  }

  _paramsInvalidChanged(e) {
    this._paramsInvalid = e.detail.value;
  }

  _headersInvalidChanged(e) {
    this._headersInvalid = e.detail.value;
  }

  _headersHandler(e) {
    this._headers = e.detail.value;
  }

  _payloadHandler(e) {
    this._payload = e.detail.value;
  }

  render() {
    const {
      aware,
      amf,
      baseUri,
      selected,
      server,
      protocols,
      version,
      noUrlEditor,
      eventsTarget,
      redirectUri,
      noDocs,
      narrow,
      allowCustom,
      allowDisableParams,
      allowHideOptional,
      readOnly,
      disabled,
      legacy,
      outlined,
      invalid,

      _endpointUri,
      _apiBaseUri,
      _pathModel,
      _queryModel,
      _securedBy,
      _apiHeaders,
      _isPayloadRequest,
      _apiPayload,
      _loadingRequest,
      _contentType
    } = this;
    console.log('render::_isPayloadRequest', _isPayloadRequest);
    return html`
    ${aware ? html`<raml-aware
      .scope="${aware}"
      @api-changed-"${this._apiChanged}"></raml-aware>` : ''}

    <api-url-data-model
      .amf="${amf}"
      .baseUri="${baseUri}"
      .selected="${selected}"
      .server="${ifDefined(server)}"
      .protocols="${ifDefined(protocols)}"
      .version="${ifDefined(version)}"
      @apibaseuri-changed="${this._apiBaseUriHandler}"
      @pathmodel-changed="${this._pathModelHandler}"
      @querymodel-changed="${this._queryModelHandler}"
      @endpointpath-changed="${this._endpointUriHandler}"></api-url-data-model>

    <div class="content">
      <div class="url-editor" ?hidden="${noUrlEditor}">
      <api-url-editor
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
        ?legacy="${legacy}"
        @value-changed="${this._urlHandler}"
        @invalid-changed="${this._urlInvalidChanged}"></api-url-editor>
      </div>

      <api-url-params-editor
        ?hidden="${!_pathModel && !_queryModel}"
        .uriModel="${_pathModel}"
        .queryModel="${_queryModel}"
        .noDocs="${noDocs}"
        ?narrow="${narrow}"
        ?allowcustom="${allowCustom}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?legacy="${legacy}"
        @invalid-changed="${this._paramsInvalidChanged}"
        @urimodel-changed="${this._pathModelHandler}"
        @querymodel-changed="${this._queryModelHandler}"></api-url-params-editor>

      <api-headers-editor
        ?hidden="${!_apiHeaders}"
        .eventsTarget="${eventsTarget}"
        .amf="${amf}"
        .amfHeaders="${_apiHeaders}"
        .noDocs="${noDocs}"
        .isPayload="${_isPayloadRequest}"
        ?narrow="${narrow}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?legacy="${legacy}"
        ?allowcustom="${allowCustom}"
        ?allowDisableParams="${allowDisableParams}"
        ?allowHideOptional="${allowHideOptional}"
        autovalidate
        @contenttype-changed="${this._contentTypeHandler}"
        @value-changed="${this._headersHandler}"
        @invalid-changed="${this._headersInvalidChanged}"></api-headers-editor>

      ${_isPayloadRequest ? html`<api-body-editor
        .eventsTarget="${eventsTarget}"
        .amf="${amf}"
        .amfBody="${_apiPayload}"
        ?narrow="${narrow}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?legacy="${legacy}"
        .contentType="${_contentType}"
        @value-changed="${this._payloadHandler}"
        ?allowcustom="${allowCustom}"
        ?allowDisableParams="${allowDisableParams}"
        ?allowHideOptional="${allowHideOptional}"></api-body-editor>` : ''}

      ${_securedBy ? html`<authorization-panel
        .amf="${amf}"
        .eventsTarget="${eventsTarget}"
        .securedBy="${_securedBy}"
        .redirectUri="${redirectUri}"
        .noDocs="${noDocs}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        ?outlined="${outlined}"
        ?legacy="${legacy}"
        @invalid-changed="${this._authInvalidChanged}"
      ></authorization-panel>` : undefined}

      <div class="action-bar">
        ${_loadingRequest ?
          html`<anypoint-button
            class="send-button abort"
            @click="${this._abortRequest}">Abort</anypoint-button>` :
          html`<anypoint-button class="send-button" @click="${this._sendHandler}">Send</anypoint-button>`}
        ${invalid ? html`<span class="invalid-info">Fill in required parameters</span>` : ''}
        <paper-spinner alt="Loading request" .active="${_loadingRequest}"></paper-spinner>
      </div>

      <paper-toast
        text="Authorization for this endpoint is required"
        id="authFormError"
        horizontal-align="right" horizontal-offset="12"></paper-toast>
      <uuid-generator id="uuid"></uuid-generator>
    </div>
    `;
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
   * @param {?Object} auth Authorization settings from the auth panel.
   * May be `undefined`.
   * @param {?String} authType Name of the authorization methods. One of
   * `advanced-rest-client/auth-methods`.
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
window.customElements.define('api-request-editor', ApiRequestEditor);
