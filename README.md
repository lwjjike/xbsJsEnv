# 小博士补环境 Node 框架

这是一个面向 Node.js 的补环境框架。框架移除了 `global`，统一使用 `window` 作为全局对象，全局作用域中的 `this` 也指向 `window`。同时，项目补齐了 `window` 原型链，`fs` 和 `path` 已移动到 `xbs` 对象上。

对于文件名的处理规则：

- **以 `xbs` 开头的 `.js` 文件**：`module`、`require`、`__filename`、`__dirname` 等属性**不存在**于全局作用域
- **非 `xbs` 开头的 `.js` 文件**：仍保留 `module`、`require`、`__filename`、`__dirname` 等全局属性

## 快速开始

如需使用localStorage，请使用如下命令运行js文件：

```bash
# jd.db表示你要将生成的jd.db文件保存到本地路径哪儿
node.exe --experimental-webstorage --localstorage-file jd.db 目标js文件目录
```

基础使用示例如下：

```javascript
var { add } = xbs.require("./test.js");

console.log(xbs.__filename, xbs.__dirname);

xbs.module.exports = {
    a: 1
}
```

直接运行即可。调试时可使用 `--inspect-brk` 参数：

```bash
node --inspect-brk app.js
```

## 目录

- [小博士补环境 Node 框架](#小博士补环境-node-框架)
  - [快速开始](#快速开始)
  - [目录](#目录)
  - [API 概览](#api-概览)
  - [1. 全局对象拦截器](#1-全局对象拦截器)
    - [`xbs.globalGetter`](#xbsglobalgetter)
    - [`xbs.globalSetter`](#xbsglobalsetter)
    - [`xbs.globalQuery`](#xbsglobalquery)
    - [`xbs.globalDeleter`](#xbsglobaldeleter)
    - [`xbs.globalEnumerator`](#xbsglobalenumerator)
    - [`xbs.globalDefiner`](#xbsglobaldefiner)
    - [`xbs.globalDescriptor`](#xbsglobaldescriptor)
    - [`xbs.funcCallTrack`](#xbsfunccalltrack)
  - [2. 创建拦截器对象](#2-创建拦截器对象)
  - [3. 创建不可检测对象](#3-创建不可检测对象)
  - [4. 创建本地构造函数或普通函数](#4-创建本地构造函数或普通函数)
  - [5. 创建本地对象](#5-创建本地对象)
  - [6. 创建访问器（getter/setter）](#6-创建访问器gettersetter)
  - [7. 创建私有属性](#7-创建私有属性)
  - [8. 指纹属性补齐](#8-指纹属性补齐)
  - [9. HTML 构造函数与原型链补齐](#9-html-构造函数与原型链补齐)
  - [10. 修改指纹信息](#10-修改指纹信息)
    - [方法示例](#方法示例)
    - [`navigator` 配置项](#navigator-配置项)
    - [`location` 配置项](#location-配置项)
    - [`screen` 配置项](#screen-配置项)
  - [11. 原型链批量创建与拦截配置](#11-原型链批量创建与拦截配置)
  - [12. JSDOM 接入](#12-jsdom-接入)
    - [接入方式](#接入方式)
  - [13. Window 构造函数与属性补全](#13-window-构造函数与属性补全)
  - [14. XMLHttpRequest 支持](#14-xmlhttprequest-支持)
    - [属性](#属性)
    - [方法](#方法)
    - [事件](#事件)
  - [15. document.all 支持](#15-documentall-支持)
  - [16. HTMLCollection 与 NodeList](#16-htmlcollection-与-nodelist)
    - [HTMLCollection](#htmlcollection)
    - [NodeList](#nodelist)
  - [17. Canvas 与 WebGL](#17-canvas-与-webgl)
    - [WebGL 扩展支持](#webgl-扩展支持)
  - [18. 全局环境隔离](#18-全局环境隔离)
  - [19. 新增 API](#19-新增-api)
    - [`xbs.setMainJSDOM(jsdomInstance)`](#xbssetmainjsdomjsdominstance)
    - [`xbs.setWINMethod(className, methodName, fn)`](#xbssetwinmethodclassname-methodname-fn)
    - [`xbs.createDomTag(tagName)`](#xbscreatedomtagtagname)
    - [`xbs.setDOMMethod(className, methodName, fn)`](#xbssetdommethodclassname-methodname-fn)
    - [`xbs.createDocAll(document, callback)`](#xbscreatedocalldocument-callback)
    - [`xbs.setGlog(enable)`](#xbssetglogenable)
  - [说明](#说明)

## API 概览

当前 README 覆盖的能力主要包括：

| 模块              | 说明                                                        |
| ----------------- | ----------------------------------------------------------- |
| 全局拦截          | 拦截全局对象属性访问与赋值                                  |
| 对象拦截          | 创建可监听 getter/setter 的代理对象                         |
| 不可检测对象      | 构造更接近原生行为的对象或函数                              |
| 本地函数/对象创建 | 创建本地构造函数、实例对象与原型链                          |
| 访问器工具        | 创建具备原生特征的 getter/setter                            |
| 私有属性          | 为对象挂载 JS 层不可枚举的私有数据                          |
| 指纹补齐与修改    | 补齐并批量修改 `navigator`、`location`、`screen` 等指纹信息 |
| 原型链批量创建    | 批量创建构造函数、实例和继承关系，并支持拦截配置            |
| JSDOM 接入        | 通过 `@lwjjike/xbsdom` 接入完整的 DOM 环境                |
| Window/BOM 补全   | 补全 `window` 上所有构造函数、XHR、Canvas、WebGL 等        |
| DOM 集合支持      | 支持 `HTMLCollection`、`NodeList`、`document.all`          |
| 环境隔离          | 移除 `global`/`Buffer`/`process`，模拟浏览器环境            |
| 新增 API          | `createDomTag`、`setDOMMethod`、`setWINMethod` 等          |

## 1. 全局对象拦截器

自动拦截全局对象的属性访问、赋值、查询、删除、枚举、定义和描述符读取等操作。同时支持拦截 BOM/DOM 对象上的方法调用。

### `xbs.globalGetter`

在全局对象属性被读取时触发。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `target` | 目标对象实例 |
| `targetName` | 目标对象名称，如 `"window"`、`"XMLHttpRequest_instance"` |
| `property` | 被读取的属性名（`string` 或 `symbol`） |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无或 `undefined` | 不拦截，继续默认读取行为 |
| `{ intercept: true, value: any }` | 拦截并返回指定的 `value` |

```javascript
xbs.globalGetter = function (target, targetName, property) {
    if (targetName === "window" && !["document", "history", "location", "screen", "navigator"].includes(property)) {
        return;
    }
    console.log("globalGetter", targetName, property);
};
```

### `xbs.globalSetter`

在全局对象属性被赋值时触发。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `target` | 目标对象实例 |
| `targetName` | 目标对象名称 |
| `property` | 被赋值的属性名 |
| `value` | 待赋值的值 |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无或 `undefined` | 不拦截，继续默认赋值行为 |
| `{ intercept: true, value: any }` | 拦截并将属性设置为返回的 `value` |

```javascript
xbs.globalSetter = function (target, targetName, property, value) {
    console.log("globalSetter", targetName, property, value);
};
```

### `xbs.globalQuery`

在全局对象属性被查询（如 `in` 操作符或内部属性查询）时触发。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `target` | 目标对象实例 |
| `targetName` | 目标对象名称 |
| `property` | 被查询的属性名 |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无或 `undefined` | 不拦截，继续默认查询行为 |
| `{ intercept: true, value: { writable, enumerable, configurable } }` | 拦截并返回属性描述符 |

```javascript
xbs.globalQuery = function (target, targetName, property) {
    console.log("globalQuery", targetName, property);
};
```

### `xbs.globalDeleter`

在全局对象属性被 `delete` 删除时触发。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `target` | 目标对象实例 |
| `targetName` | 目标对象名称 |
| `property` | 被删除的属性名 |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无或 `undefined` | 不拦截，继续默认删除行为 |
| `{ intercept: true, value: boolean }` | 拦截并返回删除结果，`true` 表示删除成功 |

```javascript
xbs.globalDeleter = function (target, targetName, property) {
    console.log("globalDeleter", targetName, property);
};
```

### `xbs.globalEnumerator`

在全局对象的属性被枚举（如 `Object.keys`、`for...in`、`getOwnPropertyNames`）时触发。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `target` | 目标对象实例 |
| `targetName` | 目标对象名称 |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无或 `undefined` | 不拦截，继续默认枚举行为 |
| `{ intercept: true, value: string[] }` | 拦截并返回属性名数组 |

```javascript
xbs.globalEnumerator = function (target, targetName) {
    console.log("globalEnumerator", targetName);
};
```

### `xbs.globalDefiner`

在全局对象属性通过 `Object.defineProperty` 被定义时触发。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `target` | 目标对象实例 |
| `targetName` | 目标对象名称 |
| `property` | 被定义的属性名 |
| `descriptor` | 属性描述符对象，包含 `value`、`writable`、`enumerable`、`configurable`、`get`、`set` |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无或 `undefined` | 不拦截，继续默认定义行为 |
| `{ intercept: true, value: any }` | 拦截并完成属性定义 |

```javascript
xbs.globalDefiner = function (target, targetName, property, descriptor) {
    console.log("globalDefiner", targetName, property, descriptor);
};
```

### `xbs.globalDescriptor`

在 `Object.getOwnPropertyDescriptor` 被调用时触发。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `target` | 目标对象实例 |
| `targetName` | 目标对象名称 |
| `property` | 属性名 |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无或 `undefined` | 不拦截，继续默认行为 |
| `{ intercept: true, value: PropertyDescriptor }` | 拦截并返回属性描述符 |

```javascript
xbs.globalDescriptor = function (target, targetName, property) {
    console.log("globalDescriptor", targetName, property);
};
```

### `xbs.funcCallTrack`

在 BOM/DOM 对象的方法被调用时触发，用于拦截和记录方法调用。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `funcRef` | 方法引用标识，如 `"XMLHttpRequest.prototype.open"` |
| `funcCaller` | 调用者对象（`this` 值） |
| `funcSig` | 方法签名（通常为方法引用字符串） |
| `funcParams` | 参数数组（`Array`） |
| `funcReturn` | 方法返回值 |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无 | 该方法无返回值要求，仅用于观察和记录 |

```javascript
xbs.funcCallTrack = function (funcRef, funcCaller, funcSig, funcParams, funcReturn) {
    console.log("函数:", funcRef, "调用者:", funcCaller, "参数:", funcParams, "返回值:", funcReturn);
};
```

## 2. 创建拦截器对象

用于创建可拦截属性读取和设置行为的对象。

```javascript
var a = xbs.createInterceptor({
    getter(target, property) {
        console.log("对象:", target, "获取属性:", property, "值:", target[property]);
    },
    setter(target, property, value) {
        console.log("对象:", target, "设置属性:", property, "值:", value);
        return {
            intercept: true,
            value: value
        }
    },
})

a.xxx = 123;
a.xxx;
```

## 3. 创建不可检测对象

用于创建在行为上更接近原生对象的不可检测对象，可拦截常见对象操作。

```javascript
var abc = xbs.createUndetectable(function () {
    return "ok"
}, {
    getter(target, property) {
        console.log("对象:", target, "获取属性:", property, "值:", target[property]);
    },
    setter(target, property, value) {
        console.log("对象:", target, "设置属性:", property, "值:", value);
        return {
            intercept: true,
            value: value
        }
    },
    query(target, property) {
        console.log("对象:", target, "属性:", property, "调用了getOwnPropertyDescriptor")
    },
    deleter(target, property) {
        console.log("对象:", target, "删除属性:", property);
    },
    enumerator(target) {
        console.log("对象:", target, "调用了getOwnPropertyNames");
    },
    definer(target, property, descriptor) {
        console.log("对象:", target, "属性:", property, "属性描述符:", descriptor);
    },
    descriptor(target, property) {
        console.log("对象:", target, "属性:", property, "调用了getOwnPropertyDescriptor")
    }
})

console.log(abc(0))
console.log(typeof abc)
console.log(abc == null)
abc[0] = 123;
abc[0];
```

## 4. 创建本地构造函数或普通函数

用于创建具备名称、参数长度以及原型配置的本地函数或构造函数。

```javascript
var HTMLDocument = xbs.createFunction("HTMLDocument", 4, function () {
    // ...
}, {
    isConstructor: true,
    isReadOnlyPrototype: true
});
```

## 5. 创建本地对象

用于同时创建实例对象和其对应构造函数。

参数 1：通过原型构造出的实例对象配置

| 参数               | 说明                     |
| ------------------ | ------------------------ |
| `isImmutableProto` | 设置是否为不可变原型对象 |

参数 2：原型构造函数配置

| 参数                  | 说明                 |
| --------------------- | -------------------- |
| `name`                | 原型构造函数名       |
| `length`              | 原型构造函数参数长度 |
| `isReadOnlyPrototype` | 原型对象是否只读     |
| `constructor`         | 原型构造函数具体实现 |

```javascript
var { instance: document, constructor: HTMLDocument } = xbs.createObject({
    isImmutableProto: false
}, {
    name: "HTMLDocument",
    length: 0,
    isReadOnlyPrototype: true,
    constructor: function () { },
}, {
    getter: function (target, property) {
        console.log("getter", property);
    },
    setter: function (target, property, value) {
        console.log("setter", target.toString(), property, value);
    }
})
```

## 6. 创建访问器（getter/setter）

用于创建更接近原生表现形式的 getter 和 setter。

```javascript
var a = {};

Object.defineProperty(a, "abc", {
    get: xbs.createGetter("abc", function () {
        // ...
    }),
    set: xbs.createSetter("abc", function (value) {
        // ...
    })
})
```

## 7. 创建私有属性

通过 `xbs` 对象设置的私有属性，在 JavaScript 层无法被遍历到。

```javascript
var a = {};

// 设置私有属性
xbs.setPrivate(a, "a", 123);

// 获取私有属性
console.log(xbs.getPrivate(a, "a"));

// 删除私有属性
xbs.deletePrivate(a, "a");
```

## 8. 指纹属性补齐

已补齐 `navigator` 常见属性，当前支持的字段如下：

| 第 1 列     | 第 2 列      | 第 3 列       | 第 4 列      |
| ----------- | ------------ | ------------- | ------------ |
| `userAgent` | `platform`   | `appCodeName` | `appVersion` |
| `appName`   | `vendor`     | `language`    | `languages`  |
| `product`   | `productSub` | `plugins`     | `mimeTypes`  |

## 9. HTML 构造函数与原型链补齐

`window` 上已补齐常见 HTML 相关构造函数，并补齐对应原型链。这些构造函数和原型对象均可被 `globalGetter` 和 `globalSetter` 拦截。

当前已补齐的对象包括：

| 第 1 列                   | 第 2 列                   | 第 3 列                      | 第 4 列               |
| ------------------------- | ------------------------- | ---------------------------- | --------------------- |
| `HTMLVideoElement`        | `HTMLUnknownElement`      | `HTMLUListElement`           | `HTMLTrackElement`    |
| `HTMLTitleElement`        | `HTMLTimeElement`         | `HTMLTextAreaElement`        | `HTMLTemplateElement` |
| `HTMLTableSectionElement` | `HTMLTableRowElement`     | `HTMLTableElement`           | `HTMLTableColElement` |
| `HTMLTableCellElement`    | `HTMLTableCaptionElement` | `HTMLStyleElement`           | `HTMLSpanElement`     |
| `HTMLSourceElement`       | `HTMLSlotElement`         | `HTMLSelectedContentElement` | `HTMLSelectElement`   |
| `HTMLScriptElement`       | `HTMLQuoteElement`        | `HTMLProgressElement`        | `HTMLPreElement`      |
| `HTMLPictureElement`      | `HTMLParamElement`        | `HTMLParagraphElement`       | `HTMLOutputElement`   |
| `HTMLOptionsCollection`   | `HTMLOptionElement`       | `HTMLOptGroupElement`        | `HTMLObjectElement`   |
| `HTMLOListElement`        | `HTMLModElement`          | `HTMLMeterElement`           | `HTMLMetaElement`     |
| `HTMLMenuElement`         | `HTMLMediaElement`        | `HTMLMarqueeElement`         | `HTMLMapElement`      |
| `HTMLLinkElement`         | `HTMLLegendElement`       | `HTMLLabelElement`           | `HTMLLIElement`       |
| `HTMLInputElement`        | `HTMLImageElement`        | `HTMLIFrameElement`          | `HTMLHtmlElement`     |
| `HTMLHeadingElement`      | `HTMLHeadElement`         | `HTMLHRElement`              | `HTMLFrameSetElement` |
| `HTMLFrameElement`        | `HTMLFormElement`         | `HTMLFormControlsCollection` | `HTMLFontElement`     |
| `HTMLFieldSetElement`     | `HTMLEmbedElement`        | `HTMLElement`                | `HTMLDocument`        |
| `HTMLDivElement`          | `HTMLDirectoryElement`    | `HTMLDialogElement`          | `HTMLDetailsElement`  |
| `HTMLDataListElement`     | `HTMLDataElement`         | `HTMLDListElement`           | `HTMLCollection`      |
| `HTMLCanvasElement`       | `HTMLButtonElement`       | `HTMLBodyElement`            | `HTMLBaseElement`     |
| `HTMLBRElement`           | `HTMLAudioElement`        | `HTMLAreaElement`            | `HTMLAnchorElement`   |
| `HTMLAllCollection`       | `HTMLFencedFrameElement`  | `HTMLGeolocationElement`     | `MimeTypeArray`       |
| `MimeType`                | `Plugin`                  | `PluginArray`                |                       |

## 10. 修改指纹信息

可通过 `xbs.setFingerPrint` 批量修改 `navigator`、`location` 和 `screen` 上的指纹字段：

### 方法示例

```javascript
xbs.setFingerPrint({
    navigator: {
        userAgent: "xbs-userAgent",
        platform: "xbs-platform",
        appCodeName: "xbs-appCodeName",
        appVersion: "xbs-appVersion",
        appName: "xbs-appName",
        vendor: "xbs-vendor",
        language: "xbs-language",
        languages: "xbs-languages",
        product: "xbs-product",
        productSub: "xbs-productSub",
        plugins: "xbs-plugins",
        mimeTypes: "xbs-mimeTypes"
    },
    location: {
        href: "xbs-href",
        pathname: "xbs-pathname",
        search: "xbs-search",
        hash: "xbs-hash",
        origin: "xbs-origin",
        protocol: "xbs-protocol",
        host: "xbs-host",
        hostname: "xbs-hostname",
        port: "xbs-port"
    },
    screen: {
        availHeight: "xbs-availHeight",
        availLeft: "xbs-availLeft",
        availTop: "xbs-availTop",
        availWidth: "xbs-availWidth",
        colorDepth: "xbs-colorDepth",
        height: "xbs-height",
        isExtended: "xbs-isExtended",
        pixelDepth: "xbs-pixelDepth",
        width: "xbs-width"
    }
})
```

### `navigator` 配置项

| 字段 | 说明 |
| --- | --- |
| `userAgent` | 浏览器用户代理字符串 |
| `platform` | 运行平台标识 |
| `appCodeName` | 浏览器内部代号 |
| `appVersion` | 浏览器版本信息 |
| `appName` | 浏览器名称 |
| `vendor` | 浏览器厂商标识 |
| `language` | 当前首选语言 |
| `languages` | 当前语言列表 |
| `product` | 浏览器产品标识 |
| `productSub` | 产品子版本标识 |
| `plugins` | 插件集合 |
| `mimeTypes` | MIME 类型集合 |

### `location` 配置项

| 字段 | 说明 |
| --- | --- |
| `href` | 完整页面地址 |
| `pathname` | 路径部分 |
| `search` | 查询参数部分 |
| `hash` | 哈希部分 |
| `origin` | 源地址 |
| `protocol` | 协议部分 |
| `host` | 主机名与端口 |
| `hostname` | 主机名 |
| `port` | 端口号 |

### `screen` 配置项

| 字段 | 说明 |
| --- | --- |
| `availHeight` | 可用屏幕高度 |
| `availLeft` | 可用区域左侧偏移 |
| `availTop` | 可用区域顶部偏移 |
| `availWidth` | 可用屏幕宽度 |
| `colorDepth` | 颜色深度 |
| `height` | 屏幕高度 |
| `isExtended` | 是否为扩展屏幕 |
| `pixelDepth` | 像素深度 |
| `width` | 屏幕宽度 |

## 11. 原型链批量创建与拦截配置

`xbs.createProtoChains` 支持批量创建原型链，并可分别控制实例对象和原型对象是否启用拦截。

配置项说明：

| 参数                       | 说明                                    |
| -------------------------- | --------------------------------------- |
| `name`                     | 当前构造函数名称                        |
| `length`                   | 构造函数的参数长度                      |
| `constructor`              | 构造函数具体实现                        |
| `isReadOnlyPrototype`      | 是否将原型对象设为只读                  |
| `isImmutableProto`         | 是否将构造函数的 `prototype` 设为不可变 |
| `isImmutableInstanceProto` | 是否将实例对象的原型链设为不可变        |
| `parent`                   | 当前构造函数继承的父级构造函数名称      |
| `isCreateInstance`         | 是否在创建原型链时同时创建实例对象      |
| `instanceName`             | 创建实例对象后返回结果中的实例名称      |
| `enableInstanceIntercept`  | 是否拦截实例对象                        |
| `enablePrototypeIntercept` | 是否拦截原型对象                        |

```javascript
var { HTMLDivElement, HTMLElement, div } = xbs.createProtoChains([
    {
        name: "HTMLDivElement",
        length: 0,
        constructor: function () {
            console.log("HTMLDivElement constructor");
        },
        isReadOnlyPrototype: true,
        isImmutableProto: true,
        isImmutableInstanceProto: true,
        parent: "HTMLElement",
        isCreateInstance: true,
        instanceName: "div",
        enableInstanceIntercept: true,
        enablePrototypeIntercept: true
    },
    {
        name: "HTMLElement",
        length: 0,
        constructor: function () {
            console.log("HTMLElement constructor");
        },
        isReadOnlyPrototype: true,
        isImmutableProto: true,
        isImmutableInstanceProto: true,
        enablePrototypeIntercept: true
    }
])
```

## 12. JSDOM 接入

框架建议使用 `@lwjjike/xbsdom` 作为 JSDOM 实现，相比标准 JSDOM 具有更少的检测点，并内置了 WebGL 支持。

### 接入方式

```javascript
var { JSDOM } = require("@lwjjike/xbsdom");

xbs.setMainJSDOM(new JSDOM("<html><head></head><body></body></html>", {
    url: "https://www.jd.com"
}));
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `html` | `string` | 是 | 页面的初始 HTML 字符串 |
| `options.url` | `string` | 否 | 当前页面的 URL，影响 `location` 和跨域判断 |

接入后，`window` 和 `document` 对象将自动替换为 JSDOM 提供的实例，框架会同步绑定 backing 对象以确保 C++ 层与 JS 层的 DOM 操作互通。

## 13. Window 构造函数与属性补全

框架已补全 `window` 上所有常见的 BOM/DOM 构造函数及其原型链上的属性和方法。包括但不限于：

- **BOM 对象**：`XMLHttpRequest`、`Navigator`、`Location`、`Screen`、`History`
- **DOM 构造函数**：`Document`、`Element`、`Node`、`Event`、`HTMLElement` 及所有 HTML 标签构造函数
- **集合类型**：`NodeList`、`HTMLCollection`、`DOMTokenList`
- **其他**：`CanvasRenderingContext2D`、`WebGLRenderingContext`、`MimeTypeArray`、`PluginArray`

所有构造函数和原型对象均支持通过 `globalGetter` / `globalSetter` 进行拦截。

## 14. XMLHttpRequest 支持

`XMLHttpRequest` 的完整生命周期已由框架接管，底层请求由 JSDOM 的 `XMLHttpRequest` 实现处理，框架通过 C++ 层转发调用并支持 `funcCallTrack` 拦截。

### 属性

| 属性 | 说明 |
| --- | --- |
| `readyState` | 请求的当前阶段：`0` UNSENT、`1` OPENED、`2` HEADERS_RECEIVED、`3` LOADING、`4` DONE |
| `status` | HTTP 响应状态码，如 `200`、`404`、`500` |
| `statusText` | HTTP 状态文本，如 `"OK"`、`"Not Found"` |
| `responseText` | 返回的文本数据 |
| `responseXML` | 若响应内容为 XML，返回解析后的 `Document` 对象 |
| `timeout` | 请求超时时间（毫秒） |
| `withCredentials` | 是否携带跨域凭证（Cookie、授权头） |

### 方法

| 方法 | 说明 |
| --- | --- |
| `open(method, url)` | 初始化一个请求，指定 HTTP 方法和请求地址 |
| `send(body)` | 发送请求，`body` 可为 `string`、`FormData`、`Blob` 等 |
| `setRequestHeader(header, value)` | 设置请求头 |
| `getResponseHeader(header)` | 获取指定响应头的值 |
| `getAllResponseHeaders()` | 获取所有响应头，以字符串形式返回 |
| `abort()` | 终止当前请求 |

### 事件

| 事件 | 说明 |
| --- | --- |
| `onreadystatechange` | `readyState` 属性变化时触发 |
| `onload` | 请求成功完成时触发 |
| `onerror` | 请求发生网络错误时触发 |
| `ontimeout` | 请求超时时触发 |

## 15. document.all 支持

`document.all` 是 HTML 文档中的特殊集合，具有以下特性：

- 可通过索引访问元素：`document.all[0]`
- 可通过 `id` 或 `name` 访问元素：`document.all["myId"]`
- `typeof document.all === "undefined"`（兼容旧浏览器检测）
- 支持 `length` 属性

框架在 `Document.prototype` 上挂载了 `all` 的 getter，返回 `HTMLAllCollection` 实例，并自动同步文档中的元素。

## 16. HTMLCollection 与 NodeList

已补全以下集合类型的属性和方法：

### HTMLCollection

- `length`：集合中元素的数量
- `item(index)`：按索引获取元素
- `namedItem(name)`：按 `id` 或 `name` 获取元素
- 支持数字索引访问：`collection[0]`

### NodeList

- `length`：节点列表的长度
- `item(index)`：按索引获取节点
- `entries()`、`keys()`、`values()`、`forEach()`
- 支持数字索引访问：`nodeList[0]`

## 17. Canvas 与 WebGL

框架已补齐 `HTMLCanvasElement`、`CanvasRenderingContext2D` 和 `WebGLRenderingContext` 的相关 API。

### WebGL 扩展支持

可通过 `xbs.setWINMethod` 自定义 `WebGLRenderingContext` 的方法，例如返回特定的扩展列表：

```javascript
xbs.setWINMethod("WebGLRenderingContext", "getSupportedExtensions", function () {
    return ["WEBGL_debug_renderer_info", "EXT_texture_filter_anisotropic", /* ... */];
});
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `className` | `string` | 是 | 目标类名，如 `"WebGLRenderingContext"` |
| `methodName` | `string` | 是 | 方法名，如 `"getSupportedExtensions"` |
| `fn` | `Function` | 是 | 替代方法的具体实现 |

## 18. 全局环境隔离

为使运行环境更接近真实浏览器，需要在脚本中手动移除 Node.js 特有的全局对象：

```javascript
delete global;
delete Buffer;
delete process;
```

`fs` 和 `path` 已挂载到 `xbs` 对象上：

| 对象 | 访问方式 |
| --- | --- |
| `fs` | `xbs.fs` |
| `path` | `xbs.path` |

对于 `require`、`module`、`exports`、`__filename`、`__dirname` 的处理规则：

| 文件类型 | 行为 |
| --- | --- |
| **以 `xbs` 开头的 `.js` 文件** | `require`、`module`、`exports`、`__filename`、`__dirname`**不存在**于全局作用域 |
| **非 `xbs` 开头的 `.js` 文件** | 仍保留 `require`、`module`、`exports`、`__filename`、`__dirname` 等全局属性 |

第三方库若依赖 `global` 或 `Buffer`，建议在加载前自行通过 `require` 引入，或修改源码引用 `window` 替代 `global`。

## 19. 新增 API

### `xbs.setMainJSDOM(jsdomInstance)`

设置主 JSDOM 实例，将 JSDOM 的 `window` 和 `document` 与框架的 backing 系统绑定。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `jsdomInstance` | 主 JSDOM 实例，由 `@lwjjike/xbsdom` 创建（必填） |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无 | 该方法无返回值 |

```javascript
var { JSDOM } = require("@lwjjike/xbsdom");
xbs.setMainJSDOM(new JSDOM("", { url: "https://www.jd.com" }));
```

### `xbs.setWINMethod(className, methodName, fn)`

设置 BOM 对象（如 `WebGLRenderingContext`、`XMLHttpRequest` 等）原型上的方法实现。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `className` | 构造函数名称，如 `"WebGLRenderingContext"`（必填） |
| `methodName` | 方法名称，如 `"getSupportedExtensions"`（必填） |
| `fn` | 替代方法的具体实现函数（必填） |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无 | 该方法无返回值 |

```javascript
xbs.setWINMethod("WebGLRenderingContext", "getSupportedExtensions", function () {
    return ["WEBGL_debug_renderer_info"];
});
```

### `xbs.createDomTag(tagName)`

根据标签名创建对应的 DOM 元素实例。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `tagName` | HTML 标签名，如 `"div"`、`"span"`、`"canvas"`（必填） |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| `Object` | 对应标签类型的 DOM 实例对象，如 `HTMLDivElement` |

```javascript
var div = xbs.createDomTag("div");
var canvas = xbs.createDomTag("canvas");
```

### `xbs.setDOMMethod(className, methodName, fn)`

修改 DOM 对象（如 `Element`、`Node`、`Document` 等）原型上的方法实现。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `className` | 构造函数名称，如 `"Element"`、`"Document"`（必填） |
| `methodName` | 方法名称（必填） |
| `fn` | 替代方法的具体实现函数（必填） |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无 | 该方法无返回值 |

```javascript
xbs.setDOMMethod("Element", "getAttribute", function (name) {
    // 自定义 getAttribute 逻辑
    return this._attributes[name];
});
```

### `xbs.createDocAll(document, callback)`

创建 `document.all` 对象（`HTMLAllCollection` 实例）。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `document` | 目标文档对象（必填） |
| `callback` | 回调函数，当前实现中用于校验（必填） |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| `HTMLAllCollection` | 包含文档中所有元素的集合对象 |

```javascript
var docAll = xbs.createDocAll(document, function () {});
```

### `xbs.setGlog(enable)`

设置全局日志开关。开启后，框架内部的属性访问和方法调用将触发 `globalGetter` / `globalSetter` 和 `funcCallTrack`。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `enable` | 是否开启日志，`true` 开启，`false` 关闭（必填） |

返回值说明：

| 返回值 | 说明 |
| --- | --- |
| 无 | 该方法无返回值 |

```javascript
xbs.setGlog(false);  // 关闭日志
console.log("敏感操作");
xbs.setGlog(true);   // 恢复日志
```

## 说明

1. 已补齐全局对象整个原型链
2. 补齐 Node 内置对象的 `toString` 保护
3. 错误堆栈检测关键行已移除
4. 已内置 `navigator`、`history` 和 `screen` 对象
5. `navigator` 对象上的 `userAgent` 属性值已更改，其他属性也已添加
6. `history` 和 `History` 对象已添加
7. `screen` 和 `Screen` 对象已添加
8. `NetworkInformation` 和 `ScreenOrientation` 对象已添加
9. 已补齐 `navigator` 常见指纹属性
10. 已补齐常见 HTML 构造函数及其原型链
11. 已支持通过 `xbs.setFingerPrint` 批量修改指纹信息
12. `createProtoChains` 已支持实例对象与原型对象拦截配置
13. 已支持通过 `@lwjjike/xbsdom` 接入完整的 JSDOM 环境
14. 已补全 `XMLHttpRequest` 的完整生命周期和属性方法
15. 已支持 `document.all` 的完整特性（含 `typeof` 伪装）
16. 已补全 `HTMLCollection` 和 `NodeList` 的属性和方法
17. 已支持 `Canvas` 和 `WebGL` 相关 API
18. 已提供 `createDomTag`、`setDOMMethod`、`createDocAll`、`setGlog`、`setWINMethod` 等辅助 API
