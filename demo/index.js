import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@api-components/api-navigation/api-navigation.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '../api-request-editor.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ComponentDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this._componentName = 'api-request-editor';

    this.initObservableProperties([
      'outlined',
      'legacy',
      'readOnly',
      'disabled',
      'narrow',
      'selectedAmfId',
      'allowCustom',
      'allowHideOptional',
      'allowDisableParams',
      'noDocs',
      'noUrlEditor',
      'responseBody'
    ]);
    this.allowCustom = false;
    this.allowHideOptional = true;
    this.allowDisableParams = true;

    this.demoStates = ['Filled', 'Outlined', 'Legacy'];
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._responseReady = this._responseReady.bind(this);
    this._apiRequestHandler = this._apiRequestHandler.bind(this);
    this.redirectUri = location.origin +
      '/node_modules/@advanced-rest-client/oauth-authorization/oauth-popup.html';
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.outlined = false;
        this.legacy = false;
        break;
      case 1:
        this.outlined = true;
        this.legacy = false;
        break;
      case 2:
        this.outlined = false;
        this.legacy = true;
        break;
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _authSettingsChanged(e) {
    const value = e.detail;
    this.authSettings = value;
    this.authSettingsValue = value ? JSON.stringify(value, null, 2) : '';
  }

  get helper() {
    if (!this.__helper) {
      this.__helper = document.getElementById('helper');
    }
    return this.__helper;
  }

  _navChanged(e) {
    this.selectedAmfId = undefined;
    this.responseBody = undefined;
    const { selected, type } = e.detail;
    if (type === 'method') {
      this.selectedAmfId = selected;
      this.hasData = true;
    } else {
      this.hasData = false;
    }
  }

  _apiListTemplate() {
    return [
      ['google-drive-api', 'Google Drive'],
      ['httpbin', 'httpbin.org'],
      ['demo-api', 'Demo API'],
      ['SE-12042', 'SE-12042: Default values issue'],
      ['SE-12224', 'SE-12224: Scope is not an array issues'],
      ['APIC-168', 'APIC-168: Custom scheme support']
    ].map(([file, label]) => html`
      <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
      <paper-item data-src="${file}.json">${label}</paper-item>
      `);
  }

  _responseReady(e) {
    const { isError, response } = e.detail;
    if (isError) {
      this.responseBody = 'Error in response';
    } else {
      this.responseBody = response.payload;
    }
  }

  _apiRequestHandler(e) {
    console.log(e.detail);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      outlined,
      legacy,
      readOnly,
      disabled,
      amf,
      narrow,
      redirectUri,
      allowCustom,
      allowHideOptional,
      allowDisableParams,
      selectedAmfId,
      noDocs,
      noUrlEditor,
      responseBody
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the OAuth2 authorization method element with various
        configuration options.
      </p>

      <section class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">

          <arc-interactive-demo
            .states="${demoStates}"
            @state-chanegd="${this._demoStateHandler}"
            ?dark="${darkThemeActive}"
          >

            <div slot="content">
              <api-request-editor
                .amf="${amf}"
                .selected="${selectedAmfId}"
                ?allowCustom="${allowCustom}"
                ?allowHideOptional="${allowHideOptional}"
                ?allowDisableParams="${allowDisableParams}"
                ?narrow="${narrow}"
                ?outlined="${outlined}"
                ?legacy="${legacy}"
                ?readOnly="${readOnly}"
                ?disabled="${disabled}"
                ?noDocs="${noDocs}"
                ?noUrlEditor="${noUrlEditor}"
                .redirectUri="${redirectUri}"
                @api-request="${this._apiRequestHandler}"></api-request-editor>
              ${responseBody ? html`<h3>Latest response</h3>
              <output class="response-output" tabindex="0">${responseBody}</output>` : ''}
            </div>
            <label slot="options" id="mainOptionsLabel">Options</label>
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="readOnly"
              @change="${this._toggleMainOption}"
              >Read only</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="disabled"
              @change="${this._toggleMainOption}"
              >Disabled</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="allowCustom"
              .checked="${allowCustom}"
              @change="${this._toggleMainOption}"
              >Allow custom</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="allowHideOptional"
              .checked="${allowHideOptional}"
              @change="${this._toggleMainOption}"
              >Allow hide optional</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="allowDisableParams"
              .checked="${allowDisableParams}"
              @change="${this._toggleMainOption}"
              >Allow disable params</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="narrow"
              @change="${this._toggleMainOption}"
              >Narrow view</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="noDocs"
              @change="${this._toggleMainOption}"
              >No docs</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="noUrlEditor"
              @change="${this._toggleMainOption}"
              >No url editor</anypoint-checkbox
            >
          </arc-interactive-demo>
        </div>
      </section>
    </section>`;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          A web component to render accessible request data editor based on AMF model.
        </p>
        <p>
          This component implements Material Design styles.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>API request editor comes with 3 predefied styles:</p>
        <ul>
          <li><b>Filled</b> (default)</li>
          <li><b>Outlined</b> - Material desing outlined inputs, use <code>outlined</code> property</li>
          <li>
            <b>Legacy</b> - To provide compatibility with legacy Anypoint design, use
            <code>legacy</code> property
          </li>
        </ul>

        <h3>Handling request event</h3>
        <p>
          The element do not perform a request. It dispatches <code>api-request</code> custom event with
          request object on the detail property of the event. The hosting application should handle this event
          and perform the request. When the response is ready the application should dispatch <code>api-response</code>
          property with the same <code>id</code> value from the request object. The element clears its state when
          the event is handled.
        </p>

        <h3>AMF model selection</h3>
        <p>
          The element handles selected shape computation after <code>selected</code> property is set.
          The property should be set to AMF supportedOperation node's <code>@id</code> value.
        </p>
        <p>
          Use
          <a href="https://github.com/advanced-rest-client/api-navigation">
            api-navigation
          </a>
          element to provide the user with accessible navigation through the AMF model.
        </p>

        <h3>Override base URI</h3>
        <p>
          Sometimes you may need to override APIs base URI. The element provides <code>baseUri</code>
          property that can be set to replace API's base URI to some other value.
        </p>

        <h3>Allowing custom properties</h3>
        <p>
          By default the editor only renders form controls to the ones defined in the API spec file.
          When model for URI/query parameters, headers, or body is not present then the corresponding editor
          is not rendered. Also, when the editors are rendered there's no option for the user
          to defined a parameter that is not defined in the API specification.
        </p>

        <p>
          To allow the user to add custom properties in the editors use <code>allowCustom</code>
          property. It will force query parameters editor to appear when hidden and the editors
          renders "add" button in their forms.
        </p>

        <h3>Partial model support</h3>
        <p>
          Partial model is generated by the AMF service (by MuleSoft) to reduce data transfer size
          and to reach the performance budget when initializing applications like API Console.<br/>
          Partial model contains data that are only required to generate view for current API selection.
        </p>

        <p>
          The element renders the model that is given to it. However, partial model may be missing
          information about server, protocols, and API version which are required to properly
          compute URL value.
        </p>

        <p>
          Note, this can be ignored when setting <code>baseUri</code> as this overrides any API
          model value.
        </p>

        <p>
          Pass corresponding model values to <code>server</code>, <code>protocols</code>, and <code>version</code>
          properties when expecting partial AMF model.
        </p>

        <h3>OAuth 2</h3>
        <p>
          You need to set <code>redirectUri</code> property to a OAuth 2 redirect popup location.
          Otherwise authorization won't be initialized.
        </p>

        <h3>Validation</h3>
        <p>
          The element sets <code>invalid</code> attribute when the editor contains invalid data.
          You can use it to style the element for invalid input.
        </p>

        <p>
          * When all forms are reported valid but OAuth 2 has no access token value the element
          still reports it as valid. When the user try to press the send button it will try to
          force authorization on currently selected authorization panel before making the request.
        </p>
      </section>`;
  }

  _render() {
    const { amf } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>
      <oauth2-authorization></oauth2-authorization>
      <oauth1-authorization></oauth1-authorization>
      <xhr-simple-request @api-response="${this._responseReady}"></xhr-simple-request>

      <div role="main">
        <h2 class="centered main">API request editor</h2>
        ${this._demoTemplate()}
        ${this._introductionTemplate()}
        ${this._usageTemplate()}
      </div>
      `, document.querySelector('#demo'));
  }
}
const instance = new ComponentDemo();
instance.render();
window.demo = instance;
