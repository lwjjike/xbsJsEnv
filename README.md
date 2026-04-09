# 小博士补环境 Node 框架

这是一个面向 Node.js 的补环境框架。框架移除了 `global`，统一使用 `window` 作为全局对象，全局作用域中的 `this` 也指向 `window`。同时，项目补齐了 `window` 原型链，并将 `module`、`require`、`fs`、`path`、`__filename`、`__dirname` 等能力统一挂载到 `xbs` 对象上进行访问。

## 快速开始

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
  - [2. 创建拦截器对象](#2-创建拦截器对象)
  - [3. 创建不可检测对象](#3-创建不可检测对象)
  - [4. 创建本地构造函数或普通函数](#4-创建本地构造函数或普通函数)
  - [5. 创建本地对象](#5-创建本地对象)
  - [6. 创建访问器（getter/setter）](#6-创建访问器gettersetter)
  - [7. 创建私有属性](#7-创建私有属性)
  - [8. 指纹属性补齐](#8-指纹属性补齐)
  - [9. HTML 构造函数与原型链补齐](#9-html-构造函数与原型链补齐)
  - [10. 修改指纹信息](#10-修改指纹信息)
  - [11. 原型链批量创建与拦截配置](#11-原型链批量创建与拦截配置)
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

## 1. 全局对象拦截器

自动拦截全局对象的属性和方法的访问与赋值操作。

```javascript
globalThis.xbs.globalGetter = function (target, targetName, property) {
    console.log("globalGetter", targetName, property);
};

globalThis.xbs.globalSetter = function (target, targetName, property, value) {
    console.log("globalSetter", targetName, property, value);
}
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
