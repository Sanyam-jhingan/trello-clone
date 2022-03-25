(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};

},{}],3:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
(function (process){(function (){
const fs = require('fs')
const path = require('path')
const os = require('os')

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

// Parser src into an Object
function parse (src) {
  const obj = {}

  // Convert buffer to string
  let lines = src.toString()

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/mg, '\n')

  let match
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]

    // Default undefined or null to empty string
    let value = (match[2] || '')

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }

    // Add to object
    obj[key] = value
  }

  return obj
}

function _log (message) {
  console.log(`[dotenv][DEBUG] ${message}`)
}

function _resolveHome (envPath) {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

// Populates process.env from .env file
function config (options) {
  let dotenvPath = path.resolve(process.cwd(), '.env')
  let encoding = 'utf8'
  const debug = Boolean(options && options.debug)
  const override = Boolean(options && options.override)

  if (options) {
    if (options.path != null) {
      dotenvPath = _resolveHome(options.path)
    }
    if (options.encoding != null) {
      encoding = options.encoding
    }
  }

  try {
    // Specifying an encoding returns a string instead of a buffer
    const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }))

    Object.keys(parsed).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = parsed[key]
      } else {
        if (override === true) {
          process.env[key] = parsed[key]
        }

        if (debug) {
          if (override === true) {
            _log(`"${key}" is already defined in \`process.env\` and WAS overwritten`)
          } else {
            _log(`"${key}" is already defined in \`process.env\` and was NOT overwritten`)
          }
        }
      }
    })

    return { parsed }
  } catch (e) {
    if (debug) {
      _log(`Failed to load ${dotenvPath} ${e.message}`)
    }

    return { error: e }
  }
}

const DotenvModule = {
  config,
  parse
}

module.exports.config = DotenvModule.config
module.exports.parse = DotenvModule.parse
module.exports = DotenvModule

}).call(this)}).call(this,require('_process'))
},{"_process":4,"fs":1,"os":2,"path":3}],6:[function(require,module,exports){
(function (process){(function (){
require('dotenv').config()

boardID = process.env.BOARD_ID
apiKey = process.env.API_KEY
token = process.env.TOKEN

//const addListForm = document.querySelector(".add-list-form")
const addListInput = document.querySelector(".add-list-input")
//const revealInput = document.querySelector(".reveal-input")
const customLists = document.querySelector(".custom-lists")
//const cards = Array.from(document.querySelectorAll(".cards"))

sync()

async function sync() {
  await fetch(
    `https://api.trello.com/1/boards/${boardID}?lists=open&list_fields=name,closed,pos&cards=visible&card_fields=name,idList,pos&fields=lists,cards,name,id&key=${apiKey}&token=${token}`
  )
    .then(response => {
      console.log(
        `sync GET lists and cards Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(boardDetails => {
      console.log(boardDetails)
      renderLists(boardDetails)
    })
    .catch(err => console.log(err))
}

function renderLists(boardDetails) {
  customLists.innerHTML = ""
  boardDetails.lists.forEach(listItem => {
    const list = document.createElement("div")
    list.setAttribute("class", "list")
    list.setAttribute("data-key", listItem.id)
    list.innerHTML = `
  <div class="header-container">
    <div class="header">${listItem.name}</div>
    <button class="delete-btn">X</button>
  </div>
  <ul class="cards"></ul>
  <button class="reveal-card-input" type="button">+ Add a card</button>
  <form class="add-card-form">
    <textarea class="add-card" name="add-card" cols="33" rows="3" placeholder="Enter a title for this card..."></textarea>
    <div class="buttons">
      <button type="submit" class="input-btn">Add Card</button>
      <button class="delete-card-btn">X</button>
    </div>
  </form>`
    boardDetails.cards.forEach(cardItem => {
      if (list.getAttribute("data-key") === cardItem.idList) {
        let ul = list.firstElementChild.nextElementSibling
        let li = document.createElement("li")
        li.setAttribute("data-key", cardItem.id)
        li.setAttribute("position", cardItem.pos)
        li.classList.add("draggable")
        li.setAttribute("draggable", "true")
        let cardBtn = document.createElement("input")
        cardBtn.classList.add("card-btn")
        cardBtn.type = "text"
        cardBtn.value = cardItem.name
        cardBtn.setAttribute("readonly", "readonly")
        let editCardBtn = document.createElement("button")
        let editImage = document.createElement("img")
        editImage.classList.add("edit-card-btn")
        editImage.src = "./images/edit.svg"
        editImage.height = "15"
        let deleteCardBtn = document.createElement("button")
        deleteCardBtn.classList.add("del-card-btn")
        deleteCardBtn.innerText = "X"
        li.appendChild(cardBtn)
        li.appendChild(editCardBtn)
        editCardBtn.appendChild(editImage)
        li.appendChild(deleteCardBtn)
        ul.appendChild(li)
      }
    })
    customLists.appendChild(list)
  })
}

function addGlobalEventListener(type, selector, callback) {
  document.addEventListener(type, e => {
    if (e.target.matches(selector)) callback(e)
  })
}

addGlobalEventListener("click", ".reveal-input", e => reveal(e))
addGlobalEventListener("click", ".reveal-card-input", e => reveal(e))

function reveal(e) {
  e.target.style.display = "none"
  e.target.nextElementSibling.style.display = "flex"
  e.target.nextElementSibling.firstElementChild.value = ""
  e.target.nextElementSibling.firstElementChild.focus()
}

addGlobalEventListener("click", ".delete-list-btn", e => hide(e))
addGlobalEventListener("click", ".delete-card-btn", e => hide(e))

function hide(e) {
  e.preventDefault()
  e.target.parentElement.parentElement.style.display = "none"
  e.target.parentElement.parentElement.previousElementSibling.style.display =
    "block"
}

document.body.addEventListener("submit", e => {
  e.preventDefault()
  if (e.target.matches(".add-list-form")) addList(addListInput.value)
  if (e.target.matches(".add-card-form")) addCard(e.target)
})

async function addList(item) {
  if (item !== "") {
    await fetch(
      `https://api.trello.com/1/lists?name=${item}&idBoard=${boardID}&key=${apiKey}&token=${token}&pos=bottom`,
      {
        method: "POST",
      }
    )
      .then(response => {
        console.log(
          `addList POST Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(listData => console.log(listData))
      .catch(err => console.log(err))

    sync()
    addListInput.value = ""
  }
}

async function addCard(item) {
  let name = item.firstElementChild.value
  let idList = item.parentElement.getAttribute("data-key")
  if (name !== "") {
    await fetch(
      `https://api.trello.com/1/cards?idList=${idList}&name=${name}&key=${apiKey}&token=${token}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `addCard POST Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    sync()
    name = ""
  }
}

addGlobalEventListener("click", ".delete-btn", e => deleteList(e))

async function deleteList(e) {
  let listId = e.target.parentElement.parentElement.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/lists/${listId}/closed?value=true&key=${apiKey}&token=${token}`,
    {
      method: "PUT",
    }
  )
    .then(response => {
      console.log(
        `deleteList PUT Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(responseJson => console.log(responseJson))
    .catch(err => console.log(err))

  sync()
}

addGlobalEventListener("click", ".del-card-btn", e => deleteCard(e))

async function deleteCard(e) {
  let id = e.target.parentElement.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/cards/${id}?key=${apiKey}&token=${token}`,
    {
      method: "DELETE",
    }
  )
    .then(response => {
      console.log(
        `deleteCard DEL Response: ${response.status} ${response.statusText}`
      )
    })
    .catch(err => console.log(err))

  sync()
}

addGlobalEventListener("click", ".edit-card-btn", e => editCard(e))

async function editCard(e) {
  let input = e.target.parentElement.previousElementSibling
  let id = e.target.parentElement.parentElement.getAttribute("data-key")
  if (input.getAttribute("readonly")) {
    input.removeAttribute("readonly")
    input.focus()
    input.style.cursor = "text"
    input.style.border = "1px solid #0079bf"
  } else {
    input.setAttribute("readonly", "readonly")
    input.style.cursor = "pointer"
    input.style.border = "none"
    userEnteredValue = input.value
    await fetch(
      `https://api.trello.com/1/cards/${id}?name=${userEnteredValue}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `editCard PUT Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.log(err))

    sync()
  }
}

addGlobalEventListener("click", ".card-btn", e => cardDetails(e.target))

async function cardDetails(event) {
  let cardId = event.parentElement.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/cards/${cardId}?fields=name,desc,comments,description,idList,pos&actions=commentCard&key=${apiKey}&token=${token}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then(response => {
      console.log(
        `cardDetails GET Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(json => {
      console.log(json)
      renderModal(event, json)
    })
    .catch(err => console.log(err))
}

function renderModal(event, cardData) {
  let li = event.parentElement
  const div = document.createElement("div")
  div.classList.add("modal")
  div.innerHTML = `
        <div class="modal-content">
          <div class="heading-container">
            <div class="model-heading">${cardData.name}</div>
            <div class="close">X</div>
          </div>
          <div class="description-container">
            <div class="heading-wrapper">
              <div class="description-heading">Description</div>
              <button class="desc-edit">Edit</button>
            </div>
            <form class="add-desc-form">
            <textarea class="desc-input" placeholder="Add a detailed description..." cols="20" rows="3"></textarea>
            <div class="btn-wrapper">
              <button class="desc-save-btn" type="submit">Save</button>
              <button class="desc-close-btn">X</button>
            </div>
            </form>
          </div>
          <div class="activity-container">
            <div class="activity-heading">Activity</div>
            <form class="add-activity-form">
              <input type="text" class="activity-input" placeholder="Write a comment..."/>
              <button class="activity-save-btn" type="submit">Save</button>
            </form>
            <ul class="activity-list"></ul>
            </div>
        </div>`
  li.appendChild(div)
  let modal = event.parentElement.lastChild
  modal.style.display = "block"
  if (cardData.desc !== "") {
    let description =
      modal.firstElementChild.firstElementChild.nextElementSibling
        .firstElementChild.nextElementSibling.firstElementChild
    description.setAttribute("readonly", "readonly")
    description.style.border = "none"
    description.value = cardData.desc
    let editBtn =
      description.parentElement.previousElementSibling.lastElementChild
    editBtn.style.display = "block"
  }
  let activityList = modal.lastElementChild.lastElementChild.lastElementChild
  cardData.actions.forEach(action => {
    if (action.type === "commentCard") {
      let div = document.createElement("div")
      div.classList.add("commentor-name")
      div.innerText = action.memberCreator.fullName
      activityList.appendChild(div)
      let li = document.createElement("input")
      li.classList.add("activity-input")
      li.value = action.data.text
      li.setAttribute("data-key", action.id)
      li.setAttribute("readonly", "readonly")
      activityList.appendChild(li)
      let divBtns = document.createElement("div")
      divBtns.classList.add("comment-btns")
      let editBtn = document.createElement("button")
      editBtn.classList.add("edit-comment-btn")
      editBtn.innerText = "Edit"
      let deleteBtn = document.createElement("button")
      deleteBtn.classList.add("delete-comment-btn")
      deleteBtn.innerText = "Delete"
      divBtns.appendChild(editBtn)
      divBtns.appendChild(deleteBtn)
      activityList.appendChild(divBtns)
    }
  })
}

addGlobalEventListener("click", ".desc-edit", e => editDesc(e))

function editDesc(event) {
  let desc = event.target.parentElement.nextElementSibling.firstElementChild
  desc.removeAttribute("readonly")
  desc.style.border = "1px solid #0079bf"
  desc.focus()
  event.target.style.display = "none"
  let descButtons =
    event.target.parentElement.parentElement.lastElementChild.lastElementChild
  descButtons.style.display = "block"
}

addGlobalEventListener("click", ".desc-save-btn", e => saveDesc(e))

async function saveDesc(event) {
  event.preventDefault()
  let desc = event.target.parentElement.previousElementSibling
  let card =
    desc.parentElement.parentElement.parentElement.parentElement.parentElement
  let cardId = card.getAttribute("data-key")
  let descValue = desc.value
  await fetch(
    `https://api.trello.com/1/cards/${cardId}?desc=${descValue}&key=${apiKey}&token=${token}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then(response => {
      console.log(
        `saveDesc PUT Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(text => console.log(text))
    .catch(err => console.error(err))

  let modal = card.lastElementChild
  modal.remove()
  cardDetails(card.firstElementChild)
}

addGlobalEventListener("click", ".desc-close-btn", e => closeDesc(e))

function closeDesc(event) {
  let desc = event.target.parentElement.previousElementSibling
  let descButtons = event.target.parentElement
  descButtons.style.display = "none"
  if (desc.value !== "") {
    desc.setAttribute("readonly", "readonly")
    desc.style.border = "none"

    let editBtn =
      event.target.parentElement.parentElement.previousElementSibling
        .lastElementChild
    editBtn.style.display = "block"
  }
}

addGlobalEventListener("click", ".close", e => closeModel(e.target))
addGlobalEventListener("click", ".modal", e => closeModel(e.target))

function closeModel(event) {
  if (event.style.display === "block") {
    event.style.display = "none"
  } else {
    let modal = event.parentElement.parentElement.parentElement
    modal.style.display = "none"
  }
}

addGlobalEventListener("click", ".desc-input", e => revealButtons(e))

function revealButtons(event) {
  if (event.target.getAttribute("readonly") === null) {
    let descButtons = event.target.nextElementSibling
    descButtons.style.display = "flex"
  }
}

addGlobalEventListener("click", ".activity-save-btn", e => saveComment(e))

async function saveComment(event) {
  let model =
    event.target.parentElement.parentElement.parentElement.parentElement
  event.preventDefault()
  let comment = event.target.previousElementSibling.value
  let id = model.parentElement.getAttribute("data-key")
  if (comment !== "") {
    await fetch(
      `https://api.trello.com/1/cards/${id}/actions/comments?text=${comment}&key=${apiKey}&token=${token}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `saveComment POST Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    closeModel(model)
    cardDetails(model.parentElement.firstElementChild)
  }
}

addGlobalEventListener("click", ".edit-comment-btn", e => editComment(e))

function editComment(event) {
  event.preventDefault()
  let input = event.target.parentElement.previousElementSibling
  let comment = input.value
  let id =
    event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
      "data-key"
    )
  let actionId = input.getAttribute("data-key")

  if (input.getAttribute("readonly")) {
    event.target.innerText = "Save"
    input.removeAttribute("readonly")
    input.focus()
    input.style.cursor = "text"
    input.style.border = "1px solid #0079bf"
  } else {
    event.target.innerText = "Edit"
    input.setAttribute("readonly", "readonly")
    input.style.cursor = "pointer"
    input.style.border = "none"
    userEnteredValue = input.value
    if (comment !== "") {
      fetch(
        `https://api.trello.com/1/cards/${id}/actions/${actionId}/comments?text=${comment}&key=${apiKey}&token=${token}`,
        {
          method: "PUT",
        }
      )
        .then(response => {
          console.log(
            `editComment PUT Response: ${response.status} ${response.statusText}`
          )
          return response.json()
        })
        .then(text => console.log(text))
        .catch(err => console.error(err))
    }
  }
}

addGlobalEventListener("click", ".delete-comment-btn", e => deleteComment(e))

async function deleteComment(event) {
  event.preventDefault()
  let id =
    event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
      "data-key"
    )
  let actionId =
    event.target.parentElement.previousElementSibling.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/cards/${id}/actions/${actionId}/comments?key=${apiKey}&token=${token}`,
    {
      method: "DELETE",
    }
  )
    .then(response => {
      console.log(
        `deleteComment DEL Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(text => console.log(text))
    .catch(err => console.error(err))

  let model =
    event.target.parentElement.parentElement.parentElement.parentElement
      .parentElement
  closeModel(model)
  cardDetails(model.parentElement.firstElementChild)
}

addGlobalEventListener("dragstart", ".draggable", e => drag(e))

function drag(event) {
  event.target.classList.add("dragging")
}

addGlobalEventListener("dragend", ".draggable", e => dragEnd(e))

async function dragEnd(event) {
  event.target.classList.remove("dragging")
  const previousElement = event.target.previousElementSibling
  const currentElement = event.target
  const nextElement = event.target.nextElementSibling
  const currentElementId = event.target.getAttribute("data-key")
  const listId =
    currentElement.parentElement.parentElement.getAttribute("data-key")
  if (previousElement === null) {
    await fetch(
      `https://api.trello.com/1/cards/${currentElementId}?pos=top&idList=${listId}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `dragEnd PUT top Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    return sync()
  }
  if (nextElement === null) {
    await fetch(
      `https://api.trello.com/1/cards/${currentElementId}?pos=bottom&idList=${listId}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `dragEnd PUT bottom Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    sync()
  }
  if (previousElement !== null && nextElement !== null) {
    const previousPosition = parseInt(previousElement.getAttribute("position"))
    const nextPosition = parseInt(nextElement.getAttribute("position"))
    const currentPosition = (previousPosition + nextPosition) / 2
    await fetch(
      `https://api.trello.com/1/cards/${currentElementId}?pos=${currentPosition}&idList=${listId}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `dragEnd PUT middle Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    sync()
  }
}

addGlobalEventListener("dragover", ".cards", e => dragOver(e))

function dragOver(event) {
  event.preventDefault()
  let container = event.target
  let afterElement = getDragAfterElement(container, event.clientY)
  const draggable = document.querySelector(".dragging")
  if (afterElement == null) {
    container.appendChild(draggable)
  } else {
    container.insertBefore(draggable, afterElement)
  }
}

function getDragAfterElement(container, y) {
  let draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ]
  return draggableElements.reduce(
    (closest, child) => {
      let box = child.getBoundingClientRect()
      let offset = y - box.top - box.height / 2
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element
}

}).call(this)}).call(this,require('_process'))
},{"_process":4,"dotenv":5}]},{},[6]);
