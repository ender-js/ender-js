/**
 * @fileoverview use this file to provide Closure externs to the compiler
 */

// Node
var module = {}
module.exports = {}
var exports = {}

// Requirejs & CommonJS
function define(string, def) {}
function provide(name, obj) {}
function require(name) {}
define.aug = {}
define.amd = {}

// Ender
var ender = function (s, r) {}
var $ = function (s, r) {}
