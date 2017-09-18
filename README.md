# postcss-target-email

Adds `@client` media queries to allow you to target different email clients.

### Installation

```sh
npm install postcss-target-email --save
```

### Usage

```js
postcss([ require('postcss-target-email')({ comment: false, bodyClass: '.body' }) ])
// do your processing here 🎉
```

Or use it in some other [PostCSS way](https://github.com/postcss/postcss#usage).

### Options

#### `comment`
**Default:** `false`

Use this option to define whether or not to add documenting comments above CSS.


#### `bodyClass`
**Default:** `.body`

Use this option to set the class on your body. This is required to properly target your CSS.


### Example

If you want to style all links on Gmail and Yahoo be colored orange you would write the following:

```css
@client gmail, yahoo {
  a {
    color: orange;
  }
}
```

You will get this result:

```css
/**
 * Targeting gmail
 */
u + .body a {
  color: orange;
}

/**
 * Targeting yahoo
 */
@media screen yahoo {
  a {
    color: orange;
  }
}
```

### Supported Clients

At the moment this package supports targeting the following clients.
* `aol`
* `yahoo`
* `gmail`
* `outlook-com`
* `thunderbird`
* `samsung`
* `lotusnotes8`
* `webkit` (not really a client, but quite helpful)

### Sources

This package is entirely dependent on the amazing work of people in the email community.

* [Yahoo](https://www.htmlemailcheck.com/knowledge-base/target-yahoo-mail-using-css-media-query/)
* [AOL](https://www.emailonacid.com/blog/article/email-development/css-targeting-for-aol-mail)
* [Gmail](http://freshinbox.com/blog/targeting-new-gmail-css/)
* [Outlook.com, Thunderbird, WebKit, Lotus Notes 8, Samsung](http://tabletrtd.com/email-client-targeting/)

### Related
* [colornames to hex](https://github.com/avigoldman/postcss-colornames-to-hex)
* [format hex colors](https://github.com/avigoldman/postcss-hex-format)
