/**
 * @param {string} name
 * @param {*}      value
 */
ender['export'] = function (key, value) {
  ender.export.old[key] = window[key]
  window[key] = value
}

ender.export.old = {}

/**
 * @param {boolean} fn
 * To unclaim the global $, use no args. To unclaim *all* ender globals,
 * use `true`
 */
ender['noConflict'] = function (all) {
  window['$'] = ender.export.old['$']
  if (all) for (var k in ender.export.old) window[k] = ender.export.old[k]
  return this
}

ender.export('$', ender)
ender.export('ender', ender)
