/**
 * @expose
 * @param {string} name
 * @param {*}      value
 */
ender.expose = function (name, value) {
  ender.expose.old[name] = window[name]
  window[name] = value
}

/**
 * @expose
 */
ender.expose.old = {}

/**
 * @expose
 * @param {boolean} all   restore only $ or all ender globals
 */
ender.noConflict = function (all) {
  window['$'] = ender.expose.old['$']
  if (all) for (var k in ender.expose.old) window[k] = ender.expose.old[k]
  return this
}

ender.expose('$', ender)
ender.expose('ender', ender); // uglify needs this semi-colon between concating files
