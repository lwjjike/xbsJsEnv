# 小博士补环境Node框架

global移除，使用window替代，全局对象为window对象，全局作用域this指向window对象，window原型链补齐，module、require、fs、path、__filename以及__dirname等全局对象的使用请通过xbs对象来进行访问，示例如下:
```javascript
var { add } = xbs.require("./test.js");

console.log(xbs.__filename, xbs.__dirname);

xbs.module.exports = {
    a: 1
}
```

### 运行
直接运行，调试可使用`--inspect-brk`参数，示例如下:
```bash
node --inspect-brk app.js
```

### 1.全局对象拦截器
自动拦截全局对象的属性和方法的访问和赋值操作。
```javascript
globalThis.xbs.globalGetter = function (target, property){
    console.log("globalGetter", property);
};
globalThis.xbs.globalSetter = function (target, property, value) {
    console.log("globalSetter", property, value);
}
```

### 2. 创建拦截器对象
```javascript
var a = xbs.createInterceptor({
    getter(target, property) {
        console.log("对象:",target,"获取属性:",property,"值:", target[property]);
    },
    setter(target, property, value) {
        console.log("对象:", target,"设置属性:", property,"值:", value);
        return {
            intercept: true,
            value: value
        }
    },
})
a.xxx = 123;
a.xxx;
```

### 3. 创建不可检测对象
```javascript
var abc = xbs.createUndetectable(function () {
    return "ok"
}, {
    getter(target, property) {
        console.log("对象:",target,"获取属性:",property,"值:", target[property]);
    },
    setter(target, property, value) {
        console.log("对象:", target,"设置属性:", property,"值:", value);
        return {
            intercept: true,
            value: value
        }
    },
    query(target, property) {
        console.log("对象:", target, "属性:", property, "调用了getOwnPropertyDescriptor")
    },
    deleter(target, property) {
        console.log("对象:", target,"删除属性:", property);
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

### 4. 创建本地构造函数或普通函数
```javascript
var HTMLDocument = xbs.createFunction("HTMLDocument", 4, function () {
    // ...
}, {
    isConstructor: true,
    isReadOnlyPrototype: true
});
```

### 5. 创建本地对象
* **参数1**: 通过原型构造出来的示例对象配置

| 参数          | 说明                                        |
| ----------------------- | ------------------------------------------------------------- |
| isImmutableProto               | 设置是否为不可变原型对象                       |

* **参数2**: 原型构造函数配置

| 参数          | 说明                                        |
| ----------------------- | ------------------------------------------------------------- |
| name               | 原型构造函数名                       |
| length              | 原型构造函数参数长度             |
| isReadOnlyPrototype | 原型对象是否只读     |
| constructor             | 原型构造函数具体实现 |

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

### 6. 创建访问器(getter/setter)
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

### 7. 创建私有属性
通过xbs对象设置的私有属性，在js层是无法遍历到的
```javascript
var a = {};
// 设置私有属性
xbs.setPrivate(a, "a", 123);
// 获取私有属性
console.log(xbs.getPrivate(a, "a"));
// 删除私有属性
xbs.deletePrivate(a, "a");
```

### 说明
1. 已补齐全局对象整个原型链
2. 补齐node内置对象的toString保护
3. 错误堆栈检测关键行已移除
4. 已内置navigator、history和screen对象
5. navigator对象上的userAgent属性值已更改，其他属性也已添加
6. history和History对象已添加
7. screen和Screen对象已添加
8. NetworkInformation和ScreenOrientation对象已添加

## 表格内容

- [小博士补环境Node框架](#小博士补环境node框架)
    - [运行](#运行)
    - [1.全局对象拦截器](#1全局对象拦截器)
    - [2. 创建拦截器对象](#2-创建拦截器对象)
    - [3. 创建不可检测对象](#3-创建不可检测对象)
    - [4. 创建本地构造函数或普通函数](#4-创建本地构造函数或普通函数)
    - [5. 创建本地对象](#5-创建本地对象)
    - [6. 创建访问器(getter/setter)](#6-创建访问器gettersetter)
    - [7. 创建私有属性](#7-创建私有属性)
    - [说明](#说明)
  - [表格内容](#表格内容)
  
