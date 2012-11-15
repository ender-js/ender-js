/*!
  * Ender: open module JavaScript framework (client-lib)
  * http://enderjs.com
  * License MIT
  */

/**
 * main Ender return object
 * @constructor
 * @param {Array|Node|string} s a CSS selector or DOM node(s)
 * @param {Array.|Node} r a root node(s)
 */
function Ender(s, r) {
  var elements
    , i

  this.selector = s
  // string || node || nodelist || window
  if (typeof s == 'undefined') {
    elements = []
    this.selector = ''
  } else if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
    elements = ender._select(s, r)
  } else {
    elements = isFinite(s.length) ? s : [s]
  }
  this.length = elements.length
  for (i = this.length; i--;) this[i] = elements[i]
}

/**
 * @param {function(el, i, inst)} fn
 * @param {Object} opt_scope
 * @returns {Ender}
 */
Ender.prototype['forEach'] = function (fn, opt_scope) {
  var i, l
  // opt out of native forEach so we can intentionally call our own scope
  // defaulting to the current item and be able to return self
  for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(opt_scope || this[i], this[i], i, this)
  // return self for chaining
  return this
}

Ender.prototype.$ = ender // handy reference to self


function ender(s, r) {
  return new Ender(s, r)
}

ender.fn = Ender.prototype // for easy compat to jQuery plugins

ender.ender = function (o, chain) {
  var o2 = (chain ? Ender.prototype : ender)
  for (var k in o) k != 'noConflict' && k != '_VERSION' && (o2[k] = o[k])
  return o2
}

ender._select = function (s, r) {
  if (typeof s == 'string') return (r || document).querySelectorAll(s)
  if (s.nodeName) return [s]
  return s
}

$ = ender
