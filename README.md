[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-request-editor.svg)](https://www.npmjs.com/package/@api-components/api-request-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-request-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/api-request-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/api-request-editor)

## &lt;api-request-editor&gt;

A HTTP request editor that builds the UI based on AMF model.

**See breaking changes and list of required dependencies at the bottom of this document**

```html
<api-request-editor
  narrow
  base-uri="http://api.domain.com"
  selected="amf://id"
  aware="amf-raml-aware"
  allow-custom
  allow-disable-params
  allow-hide-optional
  redirect-uri="https://auth.domain.com/oauth2/callback"
  selected-tab="0"
  content-type="application/json"></api-request-editor>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

The component creates the UI for editing HTTP request. It contains:

-   URL editor
-   Headers editor
-   Path/query parameters editor
-   Payload (body) editor
-   Authorization editor

After setting AMF model on the lement (via `amfModel` property) you can use the `selected` property to point to a HTTP method in the model to render. The value id the `@id` property of the AMF ld+json model for a Supported Operation shape.

When the user press "send" button an `api-request` custom event is dispatched from the component with request details (see below). The application hosting the element must handle the event and make a HTTP request.
API components ecosystem provides `@advanced-rest-client/xhr-simple-request` component that handles the event and makes XHR request to the endpoint. Note that with this method CORS applies.

The event has the `id` property that identifies the request. It can be used to identify request/response events later on in the async environment.

### api-request event

Dispatched when the user requests to send current request.

Properties set on the detail object:

-   url `String` The request URL. Can be empty string.
-   method `String`  HTTP method name. Can be empty.
-   headers `String` HTTP headers string. Can be empty.
-   payload `String|File|FormData` Message body. Can be undefined.
-   auth `Object` Optional, authorization settings from the auth panel.
-   authType `String` Name of the authorization methods. One of `advanced-rest-client/auth-methods`.
-   id `String` Generated UUID for the request. Each call of the `execute()` function regenerates the `id`.

### Installation
```
npm install --save @api-components/api-request-editor
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-request-editor/api-request-editor.js';
    </script>
  </head>
  <body>
    <api-request-editor></api-request-editor>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-request-editor/api-request-editor.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <api-request-editor></api-request-editor>
    `;
  }

  _authChanged(e) {
    console.log(e.detail);
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/api-request-editor
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```

## Breaking Changes in v3

Due to completely different dependencies import algorithm the CodeMirror and it's dependencies has to
be included to the web application manually, outside the component.

Web Compoennts are ES6 modules and libraries like CodeMirror are not adjusted to
new spec. Therefore importing the library inside the component won't make it work
(no reference is created).

All the dependencies described below are installed with the package.

**Code Mirror support**

CodeMirror + JSON linter (body editor) + headers hints and syntax (headers editor) + basic syntax (body editor).

```html
<script src="../../../jsonlint/lib/jsonlint.js"></script>
<script src="../../../codemirror/lib/codemirror.js"></script>
<script src="../../../codemirror/addon/mode/loadmode.js"></script>
<script src="../../../codemirror/mode/meta.js"></script>
<script src="../../../codemirror/mode/javascript/javascript.js"></script>
<script src="../../../codemirror/mode/xml/xml.js"></script>
<script src="../../../codemirror/mode/htmlmixed/htmlmixed.js"></script>
<script src="../../../codemirror/addon/lint/lint.js"></script>
<script src="../../../codemirror/addon/lint/json-lint.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/headers-addon.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/show-hint.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/hint-http-headers.js"></script>
```

CodeMirror's modes location. May be skipped if all possible modes are already included into the app.

```html
<script>
/* global CodeMirror */
CodeMirror.modeURL = '../../../codemirror/mode/%N/%N.js';
</script>
```

**Dependencies for OAuth1 and Digest authorization methods.**

```html
<script src="../../../cryptojslib/components/core.js"></script>
<script src="../../../cryptojslib/rollups/sha1.js"></script>
<script src="../../../cryptojslib/components/enc-base64-min.js"></script>
<script src="../../../cryptojslib/rollups/md5.js"></script>
<script src="../../../cryptojslib/rollups/hmac-sha1.js"></script>
<script src="../../../jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```
