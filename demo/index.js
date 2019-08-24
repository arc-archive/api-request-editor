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
      'noUrlEditor'
    ]);
    this.allowCustom = false;
    this.allowHideOptional = true;
    this.allowDisableParams = true;

    this.demoStates = ['Filled', 'Outlined', 'Legacy'];
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
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
    ].map(([file, label]) => html`
      <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
      <paper-item data-src="${file}.json">${label}</paper-item>
      `);
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
      noUrlEditor
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the OAuth2 authorization method element with various
        configuration options.
      </p>

      <section role="main" class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">

          <arc-interactive-demo
            .states="${demoStates}"
            @state-chanegd="${this._demoStateHandler}"
            ?dark="${darkThemeActive}"
          >

            <api-request-editor
              slot="content"
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
              .redirectUri="${redirectUri}"></api-request-editor>

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
          A web component to render accessible OAuth2 authorization form.
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
        <p>Anypoint dropdown menu comes with 3 predefied styles:</p>
        <ul>
          <li><b>Filled</b> (default)</li>
          <li><b>Outlined</b></li>
          <li>
            <b>Legacy</b> - To provide compatibility with legacy Anypoint design
          </li>
        </ul>
      </section>`;
  }

  _render() {
    const { amf } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>
      <oauth2-authorization></oauth2-authorization>
      <oauth1-authorization></oauth1-authorization>
      <xhr-simple-request></xhr-simple-request>

        ${this._demoTemplate()}
        ${this._introductionTemplate()}
        ${this._usageTemplate()}
      `, document.querySelector('#demo'));
  }
}
const instance = new ComponentDemo();
instance.render();
window.demo = instance;
