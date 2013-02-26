/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011-2012 (@ded @fat)
  * http://ender.jit.su
  * License MIT 
  */
(function (context, window, document) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // loosely based on CommonJS Modules spec v1.1.1
  // ============================================

  /**
   * @param  {string|*} identifier
   * @return {string}
   */
  function id (identifier) {// inlined @ minification
    return '$' + identifier 
  }

  var modules = {} // all current modules
    , safe = {} // safe internal access to "function" modules
    , old = context['$']
    , oldEnder = context['ender']
    , oldRequire = context['require']
    , oldProvide = context['provide']
    , blacklist = { 'noConflict': 1, '_VERSION': 1 }
    , kselect  = id('_select')
    , kclosure = id('_closure')

  /**
   * $.aug()
   * @param {Object|Function}   r      receiver
   * @param {Object|Function}   s      supplier
   * @param {(boolean|number)=} force  null|default => xfer all except blacklisted keys
   *                                   0|false => xfer only if r's val is null|undefined
   *                                   1|true  => xfer all regardless of values or keys
   */
  function aug(r, s, force) {
    for (var k in s)
      if (0 == force ? null == r[k] : 1 == force || 1 != blacklist[k])
        r[k] = s[k]
    return r
  }

  /**
   * require()
   * @param {string} name
   */
  function require(name) {
    // modules can be required via those from ender's provide() or from the `window`
    var module = modules[id(name)] || window[name]
    if ( !module ) throw new Error("Ender Error: Module '" + name + "' was not provided.")
    return module
  }
 
  /**
   * provide()
   * @param {string} name
   * @param {*}      what
   */
  function provide(name, what) {
    modules[name = id(name)] = what
    typeof what == 'function' && (safe[name] = what)
    return what
  }

  context['provide'] = provide
  context['require'] = require

  /**
   * simple default selector engine
   * @uses   caniuse.com/#feat=queryselector
   * @param  {string|Object}  s   CSS selector | DOM node
   * @param  {Object=}        r   optional DOM node to root query from
   * @return {Array|Object}
   */
  provide(kselect, function(s, r) {
    if (typeof s == 'string')
      return (r || document).querySelectorAll(s)
    if (s && s.nodeName)
      return [s]
    return []
  })

  /**
   * Call a func in a way that emulates the jQuery() ready closure,
   * but that fires immediately rather than checking the DOM state.
   * @param {Function}  fn
   */
  provide(kclosure, function(fn) {
    fn.call(document, ender)
  })

  /**
   * @param   {*}  o  is an item to count
   * @return  {number|false}
   */
  function count(o) {
    if (typeof o != 'object' || !o || o.nodeType || o === window)
      return false
    return typeof (o = o.length) == 'number' && o === o ? o : false
  }

  /**
   * @param  {*=}      item   selector|node|collection|callback|anything
   * @param  {Object=} root   node(s) from which to base selector queries
   * @return {Ender}
   */  
  function ender(item, root) {
    return new Ender(item, root)
  }
    
  /**
   * @constructor
   * @param  {*=}      item   selector|node|collection|callback|anything
   * @param  {Object=} root   node(s) from which to base selector queries
   */  
  function Ender(item, root) {
    var i
    this.length = 0 // Ensure that instance owns length

    if (typeof item == 'string')
      // Start @ strings so the result parlays into the other checks
      // The .selector prop only applies to strings
      item = ender._select(this.selector = item, root)

    if (null == item) 
      return this // Do not wrap null|undefined

    if (typeof item == 'function')
      ender._closure(item, root)

    // DOM node | scalar | not array-like
    else if (false === (i = count(item)))
      this[this.length++] = item

    // Array-like - Bitwise ensures integer length:
    else for (this.length = i = i > 0 ? i >> 0 : 0; i--;)
      this[i] = item[i]
  }
    
  // Allow $.fn and $.prototype to remain in sync
  // and make it so `$() instanceof $` is `true`
  // Re: github.com/ender-js/ender-js/pull/17
  ender['fn'] = ender.prototype = Ender.prototype = {}

  ender['fn']['$'] = ender // handy reference to self

  ender['_VERSION'] = '0.4.x'
  
  /**
   * $.ender()
   * @param {Object|Function}  s  supplier
   * @param {(boolean|*)=} chain 
   * @param {(boolean|*)=} force
   */
  function $_ender(s, chain, force) {
    // `s` = supplier
    // `r` = receiver
    var k, r = this
    if (!r || r === window)
      return
    if (!s)
      return r
    chain && (r = r['fn'] = r['fn'] || {})

    for (k in s)
      if (null != s[k]) // skip null|undefined
        if ('fn' === k && s[k] !== s) // go a level deeper on effins
          // 2nd check above prevents infinite loop if s[k] has ref to self
          $_ender.call(r, s[k], 1, force)
        else if (0 == force ? null == r[k] : 1 == force || 1 != blacklist[k])
          // The "force" logic is the same as described in $.aug()
          // Below `r[k] === r` prevents overwriting r's refs to self.
          // The "relay" check allows incoming properties to blacklist 
          // themself by having a .relay property equal to `false`
          r[k] === r || false === s[k]['relay'] || (r[k] = s[k])

    return this // for chaining or usage via .call()
  }
  ender['ender'] = $_ender
  
  
  /**
   * @param   {function(el, i, inst)} fn
   * @param   {Object}                opt_scope
   * @returns {Object|Ender}
   */
  ender['fn']['forEach'] = function (fn, opt_scope) {
    // opt out of native [].forEach so we can intentionally call our own
    // scope defaulting to the current item and be able to return self
    for (var i = 0, l = this.length; i < l; ++i)
        i in this && fn.call(opt_scope || this[i], this[i], i, this)
    return this // return self for chaining
  }

  // use callback to receive Ender's require & provide and remove them from global
  function noConflict (callback) {
    context['$'] = old
    if (callback) {
      context['provide'] = oldProvide
      context['require'] = oldRequire
      context['ender'] = oldEnder
      typeof callback == 'function' && callback(require, provide, this)
    }
    return this
  }
  noConflict['relay'] = false // signify that this should not be transferred
  ender['noConflict'] = noConflict

  typeof module != 'undefined' && module.exports && (module.exports = ender)
  // use subscript notation as extern for Closure compilation
  // developers.google.com/closure/compiler/docs/api-tutorial3
  context['ender'] = context['$'] = ender

}(this, window, document));