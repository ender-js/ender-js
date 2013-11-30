/**
 * @param {string} name
 * @param {*}      value
 */
ender['expose'] = function (key, value) {
  ender.expose.old[key] = window[key]
  window[key] = value
}

ender.expose.old = {}

/**
 * @param {boolean} fn
 * To unclaim the global $, use no args. To unclaim *all* ender globals,
 * use `true`
 */
ender['noConflict'] = function (all) {
  window['$'] = ender.expose.old['$']
  if (all) for (var k in ender.expose.old) window[k] = ender.expose.old[k]
  return this
}

ender.expose('$', ender)
ender.expose('ender', ender)
