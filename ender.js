/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build underscore coffee-script --includeLib
  * =============================================================
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , loaders = {}
    , old     = context.$
    , _path   

  // Implements some basic path operations for
  // helping requiring relative modules.
  // =========================================
  _path = {
      separator: '/'
    , join: function(a, b) { return a && b ? a + _path.separator + b : (a || b) }
    , normalize: function(dir) {
      var names = dir.split(_path.separator)
      var path = []  
      for (var i = 0, l = names.length; i < l; i++) {
        var name = names[i]
        if (name === '' && path.length > 0) {
          // dont include it on path 
        } else if (name === '.') {
          // dont include it on path
        } else if (name == '..') {
          path.pop() 
        } else {
          path.push(name)
        }
      }
      return path.join(_path.separator)
    }
    , dirname: function(name){
      var names = _path.normalize(name).split(_path.separator)
      var path = names.slice(0, names.length - 1)
      return path.length == 0 ? "." : path.join(_path.separator)
    }
    , basename: function(name) {
      var names = _path.normalize(name).split(_path.separator)
      return names[names.length - 1]
    }
  }

  // export _path as the '/path' module.
  loaders['/path'] = function() { return _path }

  function require (identifier) {
    identifier = _path.normalize(identifier)
    
    // modules can be required from ender's build system, or found on
    // the window
    var module = (identifier[0] === '/' && modules[identifier]) ||
                 modules['$' + identifier] || (typeof window != 'undefined' && window[identifier])
    
    if (!module) {
      var loader = (identifier[0] === '/' && loaders[identifier]) || loaders['$'+identifier]
      if (!loader) throw new Error("Requested module '" + identifier + "' has not been defined.")

      if (loader.moduleName && modules['$'+loader.moduleName]) return modules['$'+loader.moduleName]
      if (loader.modulePath && modules['/'+loader.modulePath]) return modules['/'+loader.modulePath]
      
      requirer = loader.modulePath ? require.relative(loader.modulePath, loader.moduleName) : require
      module = loader(requirer)
    }
    
    return module
  }

  require.def = function(name, path, loader) {
    loader.moduleName = name
    loader.modulePath = path
    if (name) loaders['$'+name] = loader
    loaders['/'+path] = loader
  }

  require.relative = function(path, name) {
    relative = function(identifier) {
      if(/^\./.test(identifier)) {
        identifier = _path.join(path, identifier)
      }
      return require( identifier )
    }
    relative.ender = ender
    relative.dirname =  _path.dirname(path)
    relative.filename = path
    relative.provide = function(exports) {
      if (name) provide(name, exports)
      provide('/'+path, exports)
      return exports
    }
    return relative
  }

  function provide (name, what) {
    if (name[0] === '/' || name[0] === '$') { modules[name] = what }
    else { modules['$' + name] = what }
    return what
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'undefined') {
      els = []
    } else if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else {
      els = isFinite(s.length) ? s : [s]
    }
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  ender._VERSION = '0.3.7'

  aug(ender, {
      fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        if (typeof s == 'string') return (r || document).querySelectorAll(s)
        if (s.nodeName) return [ s ]
        return s
      }
  })

  aug(boosh, {
      forEach: function (fn, scope, i, l) {
        // opt out of native forEach so we can intentionally call our own scope
        // defaulting to the current item and be able to return self
        for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
        // return self for chaining
        return this
      }
    , $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
