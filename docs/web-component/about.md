---
title: About
sidebar_position: 1
---

## Why use ?


爲什麼需要使用 Web Component ?

Web Component 是 Browser 的 Feature 之一，與其他的 Framework 或是 Library 不太一樣，是透過原生的瀏覽器去實現的。

也就是說無論任何的 Framework 都可以將其引入使用，例如 Angular、Vue、Word Press、Ruby、Laravel，都可以在前端使用 Web Component 而不需要爲了實現 Web Component 將前端重新建立。

:::caution
在 React 上會有一些無法適用，可以參考 [custom-elelment-everywhere](https://custom-elements-everywhere.com/) 查看 Framework 的適用性。

在最新的 React experimental 也已經 100% 適用，可能在下個版本後就能正常使用了。

目前主流瀏覽器大多支援 Web Component 除了 Safari，參考 [Can I Use](https://caniuse.com/?search=web%20components)，有需求使用的話仍然需要確認一下是否某些 feature 有支援。
:::

## HTML Template

語法與 Vue 的 Component 相同

```html
<template>
	<div>Hello</div>
</template>
```

也可以使用 slot 傳入 Component

```html
<template>
	<div>
		<slot></slot>
	</div>
</template>
```

代入名稱可以傳入多個 slot

```html
<template>
	<div>
		<slot name="body"></slot>
		<slot name="footer"></slot>
	</div>
</template>
```

## Custom Element

使用 `customElements.define([tag-name], [Class])` 定義 Element 名稱與屬性等。

```js
class CustomButton extends HTMLElement {
	static get observedAttributes() {
		return ["variant"]
	}

	constructor() {
		super()
	}
	// ... other js code
}

customElements.define('custom-button', CustomButton)
```

```html
<custom-button variant="primary">Submit</custom-button>
```

:::tip
**tag name** 必須是使用 `-` 來命名
- ~~MyButton~~ my-button
- ~~CustomBox~~ custom-box
- ~~ConfirmAlert~~ confirm-alert
:::

## Shadow DOM

Shadow DOM 是 Web Component 的特性之一，簡單來說就是將 HTML、CSS、JS 進行封裝，而不會影響其他的 Component。

其中 html `<input />` 就有實作 Shadow DOM

```html
<input type="date" />
<input type="password" />
```

打開 chrome dev 的設定，開啓 Shadow DOM

![](../../static/截圖%202023-01-26%20下午5.49.58.png)

可以看到封裝的 DOM 元素

![](../../static/截圖%202023-01-26%20下午5.51.20.png)

Shadow DOM 的使用範例

```js
class CustomButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({
			mode: 'open' | 'closed',
			delegatesFocus: true | false
		})
	}
}
```
