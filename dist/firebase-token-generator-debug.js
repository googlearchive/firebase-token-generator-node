var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.global.CLOSURE_DEFINES;
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && opt_object !== undefined) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if(!COMPILED) {
    if(goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name]
    }
  }
  goog.exportPath_(name, value)
};
goog.DEBUG = true;
goog.define("goog.LOCALE", "en");
goog.define("goog.TRUSTED_SITE", true);
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
goog.forwardDeclare = function(name) {
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && goog.isDefAndNotNull(goog.getObjectByName(name))
  };
  goog.implicitNamespaces_ = {}
}
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.define("goog.ENABLE_DEBUG_LOADER", true);
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if(ctor.instance_) {
      return ctor.instance_
    }
    if(goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor
    }
    return ctor.instance_ = new ctor
  }
};
goog.instantiatedSingletons_ = [];
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
if(goog.DEPENDENCIES_ENABLED) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if(doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if(isDeps) {
          return false
        }else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call(value);
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.hasUid = function(obj) {
  return!!obj[goog.UID_PROPERTY_]
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments)
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.getMsgWithFallback = function(a, b) {
  return a
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
  childCtor.base = function(me, methodName, var_args) {
    var args = Array.prototype.slice.call(arguments, 2);
    return parentCtor.prototype[methodName].apply(me, args)
  }
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(goog.DEBUG) {
    if(!caller) {
      throw Error("arguments.caller not defined.  goog.base() expects not " + "to be running in strict mode. See " + "http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    }
  }
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("fb.tokengenerator.constants");
var NODE_CLIENT = false;
goog.provide("goog.json");
goog.provide("goog.json.Replacer");
goog.provide("goog.json.Reviver");
goog.provide("goog.json.Serializer");
goog.define("goog.json.USE_NATIVE_JSON", false);
goog.json.isValid_ = function(s) {
  if(/^\s*$/.test(s)) {
    return false
  }
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe = /"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;
  return remainderRe.test(s.replace(backslashesRe, "@").replace(simpleValuesRe, "]").replace(openBracketsRe, ""))
};
goog.json.parse = goog.json.USE_NATIVE_JSON ? goog.global["JSON"]["parse"] : function(s) {
  var o = String(s);
  if(goog.json.isValid_(o)) {
    try {
      return eval("(" + o + ")")
    }catch(ex) {
    }
  }
  throw Error("Invalid JSON string: " + o);
};
goog.json.unsafeParse = goog.json.USE_NATIVE_JSON ? goog.global["JSON"]["parse"] : function(s) {
  return eval("(" + s + ")")
};
goog.json.Replacer;
goog.json.Reviver;
goog.json.serialize = goog.json.USE_NATIVE_JSON ? goog.global["JSON"]["stringify"] : function(object, opt_replacer) {
  return(new goog.json.Serializer(opt_replacer)).serialize(object)
};
goog.json.Serializer = function(opt_replacer) {
  this.replacer_ = opt_replacer
};
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serialize_(object, sb);
  return sb.join("")
};
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch(typeof object) {
    case "string":
      this.serializeString_(object, sb);
      break;
    case "number":
      this.serializeNumber_(object, sb);
      break;
    case "boolean":
      sb.push(object);
      break;
    case "undefined":
      sb.push("null");
      break;
    case "object":
      if(object == null) {
        sb.push("null");
        break
      }
      if(goog.isArray(object)) {
        this.serializeArray(object, sb);
        break
      }
      this.serializeObject_(object, sb);
      break;
    case "function":
      break;
    default:
      throw Error("Unknown type: " + typeof object);
  }
};
goog.json.Serializer.charToJsonCharCache_ = {'"':'\\"', "\\":"\\\\", "/":"\\/", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\u000b"};
goog.json.Serializer.charsToReplace_ = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    if(c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c]
    }
    var cc = c.charCodeAt(0);
    var rv = "\\u";
    if(cc < 16) {
      rv += "000"
    }else {
      if(cc < 256) {
        rv += "00"
      }else {
        if(cc < 4096) {
          rv += "0"
        }
      }
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16)
  }), '"')
};
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : "null")
};
goog.json.Serializer.prototype.serializeArray = function(arr, sb) {
  var l = arr.length;
  sb.push("[");
  var sep = "";
  for(var i = 0;i < l;i++) {
    sb.push(sep);
    var value = arr[i];
    this.serialize_(this.replacer_ ? this.replacer_.call(arr, String(i), value) : value, sb);
    sep = ","
  }
  sb.push("]")
};
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push("{");
  var sep = "";
  for(var key in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      if(typeof value != "function") {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(":");
        this.serialize_(this.replacer_ ? this.replacer_.call(obj, key, value) : value, sb);
        sep = ","
      }
    }
  }
  sb.push("}")
};
goog.provide("fb.tokengenerator.json");
goog.require("goog.json");
fb.tokengenerator.json.parse = function(str) {
  if(typeof JSON !== "undefined" && goog.isDef(JSON.parse)) {
    return JSON.parse(str)
  }else {
    return goog.json.parse(str)
  }
};
fb.tokengenerator.json.stringify = function(data) {
  if(typeof JSON !== "undefined" && goog.isDef(JSON.stringify)) {
    return JSON.stringify(data)
  }else {
    return goog.json.serialize(data)
  }
};
goog.provide("fb.tokengenerator.utf8");
fb.tokengenerator.utf8.stringToByteArray = function(str) {
  var out = [], p = 0;
  for(var i = 0;i < str.length;i++) {
    var c = str.charCodeAt(i);
    if(c >= 55296 && c <= 56319) {
      var high = c - 55296;
      i++;
      fb.core.util.assert(i < str.length, "Surrogate pair missing trail surrogate.");
      var low = str.charCodeAt(i) - 56320;
      c = 65536 + (high << 10) + low
    }
    if(c < 128) {
      out[p++] = c
    }else {
      if(c < 2048) {
        out[p++] = c >> 6 | 192;
        out[p++] = c & 63 | 128
      }else {
        if(c < 65536) {
          out[p++] = c >> 12 | 224;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128
        }else {
          out[p++] = c >> 18 | 240;
          out[p++] = c >> 12 & 63 | 128;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128
        }
      }
    }
  }
  return out
};
fb.tokengenerator.utf8.stringLength = function(str) {
  var p = 0;
  for(var i = 0;i < str.length;i++) {
    var c = str.charCodeAt(i);
    if(c < 128) {
      p++
    }else {
      if(c < 2048) {
        p += 2
      }else {
        if(c >= 55296 && c <= 56319) {
          p += 4;
          i++
        }else {
          p += 3
        }
      }
    }
  }
  return p
};
goog.provide("CryptoJS");
CryptoJS = function(h, i) {
  var e = {}, f = e.lib = {}, l = f.Base = function() {
    function a() {
    }
    return{extend:function(j) {
      a.prototype = this;
      var d = new a;
      j && d.mixIn(j);
      d.$super = this;
      return d
    }, create:function() {
      var a = this.extend();
      a.init.apply(a, arguments);
      return a
    }, init:function() {
    }, mixIn:function(a) {
      for(var d in a) {
        a.hasOwnProperty(d) && (this[d] = a[d])
      }
      a.hasOwnProperty("toString") && (this.toString = a.toString)
    }, clone:function() {
      return this.$super.extend(this)
    }}
  }(), k = f.WordArray = l.extend({init:function(a, j) {
    a = this.words = a || [];
    this.sigBytes = j != i ? j : 4 * a.length
  }, toString:function(a) {
    return(a || m).stringify(this)
  }, concat:function(a) {
    var j = this.words, d = a.words, c = this.sigBytes, a = a.sigBytes;
    this.clamp();
    if(c % 4) {
      for(var b = 0;b < a;b++) {
        j[c + b >>> 2] |= (d[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((c + b) % 4)
      }
    }else {
      if(65535 < d.length) {
        for(b = 0;b < a;b += 4) {
          j[c + b >>> 2] = d[b >>> 2]
        }
      }else {
        j.push.apply(j, d)
      }
    }
    this.sigBytes += a;
    return this
  }, clamp:function() {
    var a = this.words, b = this.sigBytes;
    a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4);
    a.length = h.ceil(b / 4)
  }, clone:function() {
    var a = l.clone.call(this);
    a.words = this.words.slice(0);
    return a
  }, random:function(a) {
    for(var b = [], d = 0;d < a;d += 4) {
      b.push(4294967296 * h.random() | 0)
    }
    return k.create(b, a)
  }}), o = e.enc = {}, m = o.Hex = {stringify:function(a) {
    for(var b = a.words, a = a.sigBytes, d = [], c = 0;c < a;c++) {
      var e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255;
      d.push((e >>> 4).toString(16));
      d.push((e & 15).toString(16))
    }
    return d.join("")
  }, parse:function(a) {
    for(var b = a.length, d = [], c = 0;c < b;c += 2) {
      d[c >>> 3] |= parseInt(a.substr(c, 2), 16) << 24 - 4 * (c % 8)
    }
    return k.create(d, b / 2)
  }}, q = o.Latin1 = {stringify:function(a) {
    for(var b = a.words, a = a.sigBytes, d = [], c = 0;c < a;c++) {
      d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255))
    }
    return d.join("")
  }, parse:function(a) {
    for(var b = a.length, d = [], c = 0;c < b;c++) {
      d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4)
    }
    return k.create(d, b)
  }}, r = o.Utf8 = {stringify:function(a) {
    try {
      return decodeURIComponent(escape(q.stringify(a)))
    }catch(b) {
      throw Error("Malformed UTF-8 data");
    }
  }, parse:function(a) {
    return q.parse(unescape(encodeURIComponent(a)))
  }}, b = f.BufferedBlockAlgorithm = l.extend({reset:function() {
    this._data = k.create();
    this._nDataBytes = 0
  }, _append:function(a) {
    "string" == typeof a && (a = r.parse(a));
    this._data.concat(a);
    this._nDataBytes += a.sigBytes
  }, _process:function(a) {
    var b = this._data, d = b.words, c = b.sigBytes, e = this.blockSize, g = c / (4 * e), g = a ? h.ceil(g) : h.max((g | 0) - this._minBufferSize, 0), a = g * e, c = h.min(4 * a, c);
    if(a) {
      for(var f = 0;f < a;f += e) {
        this._doProcessBlock(d, f)
      }
      f = d.splice(0, a);
      b.sigBytes -= c
    }
    return k.create(f, c)
  }, clone:function() {
    var a = l.clone.call(this);
    a._data = this._data.clone();
    return a
  }, _minBufferSize:0});
  f.Hasher = b.extend({init:function() {
    this.reset()
  }, reset:function() {
    b.reset.call(this);
    this._doReset()
  }, update:function(a) {
    this._append(a);
    this._process();
    return this
  }, finalize:function(a) {
    a && this._append(a);
    this._doFinalize();
    return this._hash
  }, clone:function() {
    var a = b.clone.call(this);
    a._hash = this._hash.clone();
    return a
  }, blockSize:16, _createHelper:function(a) {
    return function(b, d) {
      return a.create(d).finalize(b)
    }
  }, _createHmacHelper:function(a) {
    return function(b, d) {
      return g.HMAC.create(a, d).finalize(b)
    }
  }});
  var g = e.algo = {};
  return e
}(Math);
(function(h) {
  var i = CryptoJS, e = i.lib, f = e.WordArray, e = e.Hasher, l = i.algo, k = [], o = [];
  (function() {
    function e(a) {
      for(var b = h.sqrt(a), d = 2;d <= b;d++) {
        if(!(a % d)) {
          return!1
        }
      }
      return!0
    }
    function f(a) {
      return 4294967296 * (a - (a | 0)) | 0
    }
    for(var b = 2, g = 0;64 > g;) {
      e(b) && (8 > g && (k[g] = f(h.pow(b, 0.5))), o[g] = f(h.pow(b, 1 / 3)), g++), b++
    }
  })();
  var m = [], l = l.SHA256 = e.extend({_doReset:function() {
    this._hash = f.create(k.slice(0))
  }, _doProcessBlock:function(e, f) {
    for(var b = this._hash.words, g = b[0], a = b[1], j = b[2], d = b[3], c = b[4], h = b[5], l = b[6], k = b[7], n = 0;64 > n;n++) {
      if(16 > n) {
        m[n] = e[f + n] | 0
      }else {
        var i = m[n - 15], p = m[n - 2];
        m[n] = ((i << 25 | i >>> 7) ^ (i << 14 | i >>> 18) ^ i >>> 3) + m[n - 7] + ((p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10) + m[n - 16]
      }
      i = k + ((c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25)) + (c & h ^ ~c & l) + o[n] + m[n];
      p = ((g << 30 | g >>> 2) ^ (g << 19 | g >>> 13) ^ (g << 10 | g >>> 22)) + (g & a ^ g & j ^ a & j);
      k = l;
      l = h;
      h = c;
      c = d + i | 0;
      d = j;
      j = a;
      a = g;
      g = i + p | 0
    }
    b[0] = b[0] + g | 0;
    b[1] = b[1] + a | 0;
    b[2] = b[2] + j | 0;
    b[3] = b[3] + d | 0;
    b[4] = b[4] + c | 0;
    b[5] = b[5] + h | 0;
    b[6] = b[6] + l | 0;
    b[7] = b[7] + k | 0
  }, _doFinalize:function() {
    var e = this._data, f = e.words, b = 8 * this._nDataBytes, g = 8 * e.sigBytes;
    f[g >>> 5] |= 128 << 24 - g % 32;
    f[(g + 64 >>> 9 << 4) + 15] = b;
    e.sigBytes = 4 * f.length;
    this._process()
  }});
  i.SHA256 = e._createHelper(l);
  i.HmacSHA256 = e._createHmacHelper(l)
})(Math);
(function() {
  var h = CryptoJS, i = h.enc.Utf8;
  h.algo.HMAC = h.lib.Base.extend({init:function(e, f) {
    e = this._hasher = e.create();
    "string" == typeof f && (f = i.parse(f));
    var h = e.blockSize, k = 4 * h;
    f.sigBytes > k && (f = e.finalize(f));
    for(var o = this._oKey = f.clone(), m = this._iKey = f.clone(), q = o.words, r = m.words, b = 0;b < h;b++) {
      q[b] ^= 1549556828, r[b] ^= 909522486
    }
    o.sigBytes = m.sigBytes = k;
    this.reset()
  }, reset:function() {
    var e = this._hasher;
    e.reset();
    e.update(this._iKey)
  }, update:function(e) {
    this._hasher.update(e);
    return this
  }, finalize:function(e) {
    var f = this._hasher, e = f.finalize(e);
    f.reset();
    return f.finalize(this._oKey.clone().concat(e))
  }})
})();
goog.provide("fb.tokengenerator.validation");
fb.tokengenerator.validation.validateArgCount = function(fnName, minCount, maxCount, argCount) {
  var argError;
  if(argCount < minCount) {
    argError = "at least " + minCount
  }else {
    if(argCount > maxCount) {
      argError = maxCount === 0 ? "none" : "no more than " + maxCount
    }
  }
  if(argError) {
    var error = fnName + " failed: Was called with " + argCount + (argCount === 1 ? " argument." : " arguments.") + " Expects " + argError + ".";
    throw new Error(error);
  }
};
fb.tokengenerator.validation.errorPrefix_ = function(fnName, argumentNumber, optional) {
  var argName = "";
  switch(argumentNumber) {
    case 1:
      argName = optional ? "first" : "First";
      break;
    case 2:
      argName = optional ? "second" : "Second";
      break;
    case 3:
      argName = optional ? "third" : "Third";
      break;
    case 4:
      argName = optional ? "fourth" : "Fourth";
      break;
    default:
      fb.core.util.validation.assert(false, "errorPrefix_ called with argumentNumber > 4.  Need to update it?")
  }
  var error = fnName + " failed: ";
  error += argName + " argument ";
  return error
};
fb.tokengenerator.validation.validateSecret = function(fnName, argumentNumber, secret) {
  if(!goog.isString(secret)) {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + "must be a valid firebase namespace secret.");
  }
};
fb.tokengenerator.validation.validateCredentialData = function(fnName, argumentNumber, data, isAdminToken) {
  var isDataAnObject = typeof data === "object";
  if(data === null || !isDataAnObject) {
    if(!isDataAnObject && !isAdminToken) {
      throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + "must be a dictionary of token data.");
    }
  }else {
    if(data.uid === null || typeof data.uid !== "string") {
      if(!isAdminToken || typeof data.uid !== "undefined") {
        throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + 'must contain a "uid" key that must be a string.');
      }
    }else {
      if(data.uid.length > 256) {
        throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, false) + 'must contain a "uid" key that must not be longer than 256 bytes.');
      }
    }
  }
};
fb.tokengenerator.validation.validateCredentialOptions = function(fnName, argumentNumber, opt) {
  if(!goog.isDef(opt)) {
    return
  }
  if(opt === null || typeof opt !== "object") {
    throw new Error(fb.tokengenerator.validation.errorPrefix_(fnName, argumentNumber, true) + "must be a dictionary of token options.");
  }
};
fb.tokengenerator.validation.validateOption = function(prefix, optName, opt, expectedType, suffix) {
  if(typeof opt !== expectedType || expectedType === "number" && isNaN(opt)) {
    throw new Error(prefix + ' option "' + optName + '" must be ' + suffix + ", instead got " + opt);
  }
};
fb.tokengenerator.validation.validateGeneratedToken = function(token) {
  if(token.length > 1024) {
    throw new Error("Generated token must be less than 1024 bytes long");
  }
};
goog.provide("goog.dom.NodeType");
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error)
  }else {
    var stack = (new Error).stack;
    if(stack) {
      this.stack = stack
    }
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase()
};
goog.string.subs = function(str, var_args) {
  var splitParts = str.split("%s");
  var returnString = "";
  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while(subsArguments.length && splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift()
  }
  return returnString + splitParts.join("%s")
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str))
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;").replace(goog.string.singleQuoteRe_, "&#39;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    if(str.indexOf("'") != -1) {
      str = str.replace(goog.string.singleQuoteRe_, "&#39;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /"/g;
goog.string.singleQuoteRe_ = /'/g;
goog.string.allRe_ = /[&<>"']/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if(goog.string.contains(str, "&")) {
    return goog.string.unescapeEntitiesUsingDom_(str, document)
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div;
  if(opt_document) {
    div = opt_document.createElement("div")
  }else {
    div = document.createElement("div")
  }
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if(value) {
      return value
    }
    if(entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if(!isNaN(n)) {
        value = String.fromCharCode(n)
      }
    }
    if(!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1)
    }
    return seen[s] = value
  })
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars && str.length > chars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2])
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.isLowerCamelCase = function(str) {
  return/^[a-z]+([A-Z][a-z]*)*$/.test(str)
};
goog.string.isUpperCamelCase = function(str) {
  return/^([A-Z][a-z]*)+$/.test(str)
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  })
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase()
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  delimiters = delimiters ? "|[" + delimiters + "]+" : "";
  var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase()
  })
};
goog.string.parseInt = function(value) {
  if(isFinite(value)) {
    value = String(value)
  }
  if(goog.isString(value)) {
    return/^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10)
  }
  return NaN
};
goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];
  while(limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--
  }
  if(parts.length) {
    returnVal.push(parts.join(separator))
  }
  return returnVal
};
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.dom.NodeType");
goog.require("goog.string");
goog.define("goog.asserts.ENABLE_ASSERTS", goog.DEBUG);
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) || value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
  return value
};
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for(var key in Object.prototype) {
    goog.asserts.fail(key + " should not be enumerable in Object.prototype.")
  }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.define("goog.NATIVE_ARRAY_PROTOTYPES", goog.TRUSTED_SITE);
goog.define("goog.array.ASSUME_NATIVE_FUNCTIONS", false);
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.indexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.lastIndexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.forEach) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.filter) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.map) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.reduce) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  if(opt_obj) {
    f = goog.bind(f, opt_obj)
  }
  return goog.array.ARRAY_PROTOTYPE_.reduce.call(arr, f, val)
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.reduceRight) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  if(opt_obj) {
    f = goog.bind(f, opt_obj)
  }
  return goog.array.ARRAY_PROTOTYPE_.reduceRight.call(arr, f, val)
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.some) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || goog.array.ARRAY_PROTOTYPE_.every) ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if(f.call(opt_obj, element, index, arr)) {
      ++count
    }
  }, opt_obj);
  return count
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.toArray = function(object) {
  var length = object.length;
  if(length > 0) {
    var rv = new Array(length);
    for(var i = 0;i < length;i++) {
      rv[i] = object[i]
    }
    return rv
  }
  return[]
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && Object.prototype.hasOwnProperty.call(arr2, "callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  var returnArray = opt_rv || arr;
  var defaultHashFn = function(item) {
    return goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current
  };
  var hashFn = opt_hashFn || defaultHashFn;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = hashFn(current);
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  arr.sort(opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for(var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if(result != 0) {
      return result
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter, opt_obj) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter.call(opt_obj, value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element
  });
  return ret
};
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if(opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end
  }
  if(step * (end - start) < 0) {
    return[]
  }
  if(step > 0) {
    for(var i = start;i < end;i += step) {
      array.push(i)
    }
  }else {
    for(var i = start;i > end;i += step) {
      array.push(i)
    }
  }
  return array
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
  goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
  var removedItems = goog.array.ARRAY_PROTOTYPE_.splice.call(arr, fromIndex, 1);
  goog.array.ARRAY_PROTOTYPE_.splice.call(arr, toIndex, 0, removedItems[0])
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
goog.provide("goog.crypt");
goog.require("goog.array");
goog.require("goog.asserts");
goog.crypt.stringToByteArray = function(str) {
  var output = [], p = 0;
  for(var i = 0;i < str.length;i++) {
    var c = str.charCodeAt(i);
    while(c > 255) {
      output[p++] = c & 255;
      c >>= 8
    }
    output[p++] = c
  }
  return output
};
goog.crypt.byteArrayToString = function(array) {
  return String.fromCharCode.apply(null, array)
};
goog.crypt.byteArrayToHex = function(array) {
  return goog.array.map(array, function(numByte) {
    var hexByte = numByte.toString(16);
    return hexByte.length > 1 ? hexByte : "0" + hexByte
  }).join("")
};
goog.crypt.hexToByteArray = function(hexString) {
  goog.asserts.assert(hexString.length % 2 == 0, "Key string length must be multiple of 2");
  var arr = [];
  for(var i = 0;i < hexString.length;i += 2) {
    arr.push(parseInt(hexString.substring(i, i + 2), 16))
  }
  return arr
};
goog.crypt.stringToUtf8ByteArray = function(str) {
  str = str.replace(/\r\n/g, "\n");
  var out = [], p = 0;
  for(var i = 0;i < str.length;i++) {
    var c = str.charCodeAt(i);
    if(c < 128) {
      out[p++] = c
    }else {
      if(c < 2048) {
        out[p++] = c >> 6 | 192;
        out[p++] = c & 63 | 128
      }else {
        out[p++] = c >> 12 | 224;
        out[p++] = c >> 6 & 63 | 128;
        out[p++] = c & 63 | 128
      }
    }
  }
  return out
};
goog.crypt.utf8ByteArrayToString = function(bytes) {
  var out = [], pos = 0, c = 0;
  while(pos < bytes.length) {
    var c1 = bytes[pos++];
    if(c1 < 128) {
      out[c++] = String.fromCharCode(c1)
    }else {
      if(c1 > 191 && c1 < 224) {
        var c2 = bytes[pos++];
        out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63)
      }else {
        var c2 = bytes[pos++];
        var c3 = bytes[pos++];
        out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63)
      }
    }
  }
  return out.join("")
};
goog.crypt.xorByteArray = function(bytes1, bytes2) {
  goog.asserts.assert(bytes1.length == bytes2.length, "XOR array lengths must match");
  var result = [];
  for(var i = 0;i < bytes1.length;i++) {
    result.push(bytes1[i] ^ bytes2[i])
  }
  return result
};
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.define("goog.userAgent.ASSUME_IE", false);
goog.define("goog.userAgent.ASSUME_GECKO", false);
goog.define("goog.userAgent.ASSUME_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_MOBILE_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_OPERA", false);
goog.define("goog.userAgent.ASSUME_ANY_VERSION", false);
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"]
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if(!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = goog.string.startsWith(ua, "Opera");
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && (goog.string.contains(ua, "MSIE") || goog.string.contains(ua, "Trident"));
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && goog.string.contains(ua, "WebKit");
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && goog.string.contains(ua, "Mobile");
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && !goog.userAgent.detectedIe_ && navigator.product == "Gecko"
  }
};
if(!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.define("goog.userAgent.ASSUME_MAC", false);
goog.define("goog.userAgent.ASSUME_WINDOWS", false);
goog.define("goog.userAgent.ASSUME_LINUX", false);
goog.define("goog.userAgent.ASSUME_X11", false);
goog.define("goog.userAgent.ASSUME_ANDROID", false);
goog.define("goog.userAgent.ASSUME_IPHONE", false);
goog.define("goog.userAgent.ASSUME_IPAD", false);
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD;
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11");
  var ua = goog.userAgent.getUserAgentString();
  goog.userAgent.detectedAndroid_ = !!ua && goog.string.contains(ua, "Android");
  goog.userAgent.detectedIPhone_ = !!ua && goog.string.contains(ua, "iPhone");
  goog.userAgent.detectedIPad_ = !!ua && goog.string.contains(ua, "iPad")
};
if(!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.userAgent.detectedAndroid_;
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.userAgent.detectedIPhone_;
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.userAgent.detectedIPad_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if(goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion
  }else {
    if(goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/
    }else {
      if(goog.userAgent.IE) {
        re = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/
      }else {
        if(goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/
        }
      }
    }
    if(re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : ""
    }
  }
  if(goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if(docMode > parseFloat(version)) {
      return String(docMode)
    }
  }
  return version
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2)
};
goog.userAgent.isVersionOrHigherCache_ = {};
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionOrHigherCache_[version] || (goog.userAgent.isVersionOrHigherCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0)
};
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode
};
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
goog.userAgent.DOCUMENT_MODE = function() {
  var doc = goog.global["document"];
  if(!doc || !goog.userAgent.IE) {
    return undefined
  }
  var mode = goog.userAgent.getDocumentMode_();
  return mode || (doc["compatMode"] == "CSS1Compat" ? parseInt(goog.userAgent.VERSION, 10) : 5)
}();
goog.provide("goog.crypt.base64");
goog.require("goog.crypt");
goog.require("goog.userAgent");
goog.crypt.base64.byteToCharMap_ = null;
goog.crypt.base64.charToByteMap_ = null;
goog.crypt.base64.byteToCharMapWebSafe_ = null;
goog.crypt.base64.charToByteMapWebSafe_ = null;
goog.crypt.base64.ENCODED_VALS_BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "0123456789";
goog.crypt.base64.ENCODED_VALS = goog.crypt.base64.ENCODED_VALS_BASE + "+/=";
goog.crypt.base64.ENCODED_VALS_WEBSAFE = goog.crypt.base64.ENCODED_VALS_BASE + "-_.";
goog.crypt.base64.HAS_NATIVE_SUPPORT = goog.userAgent.GECKO || goog.userAgent.WEBKIT || goog.userAgent.OPERA || typeof goog.global.atob == "function";
goog.crypt.base64.encodeByteArray = function(input, opt_webSafe) {
  if(!goog.isArrayLike(input)) {
    throw Error("encodeByteArray takes an array as a parameter");
  }
  goog.crypt.base64.init_();
  var byteToCharMap = opt_webSafe ? goog.crypt.base64.byteToCharMapWebSafe_ : goog.crypt.base64.byteToCharMap_;
  var output = [];
  for(var i = 0;i < input.length;i += 3) {
    var byte1 = input[i];
    var haveByte2 = i + 1 < input.length;
    var byte2 = haveByte2 ? input[i + 1] : 0;
    var haveByte3 = i + 2 < input.length;
    var byte3 = haveByte3 ? input[i + 2] : 0;
    var outByte1 = byte1 >> 2;
    var outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
    var outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
    var outByte4 = byte3 & 63;
    if(!haveByte3) {
      outByte4 = 64;
      if(!haveByte2) {
        outByte3 = 64
      }
    }
    output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4])
  }
  return output.join("")
};
goog.crypt.base64.encodeString = function(input, opt_webSafe) {
  if(goog.crypt.base64.HAS_NATIVE_SUPPORT && !opt_webSafe) {
    return goog.global.btoa(input)
  }
  return goog.crypt.base64.encodeByteArray(goog.crypt.stringToByteArray(input), opt_webSafe)
};
goog.crypt.base64.decodeString = function(input, opt_webSafe) {
  if(goog.crypt.base64.HAS_NATIVE_SUPPORT && !opt_webSafe) {
    return goog.global.atob(input)
  }
  return goog.crypt.byteArrayToString(goog.crypt.base64.decodeStringToByteArray(input, opt_webSafe))
};
goog.crypt.base64.decodeStringToByteArray = function(input, opt_webSafe) {
  goog.crypt.base64.init_();
  var charToByteMap = opt_webSafe ? goog.crypt.base64.charToByteMapWebSafe_ : goog.crypt.base64.charToByteMap_;
  var output = [];
  for(var i = 0;i < input.length;) {
    var byte1 = charToByteMap[input.charAt(i++)];
    var haveByte2 = i < input.length;
    var byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
    ++i;
    var haveByte3 = i < input.length;
    var byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 0;
    ++i;
    var haveByte4 = i < input.length;
    var byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 0;
    ++i;
    if(byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
      throw Error();
    }
    var outByte1 = byte1 << 2 | byte2 >> 4;
    output.push(outByte1);
    if(byte3 != 64) {
      var outByte2 = byte2 << 4 & 240 | byte3 >> 2;
      output.push(outByte2);
      if(byte4 != 64) {
        var outByte3 = byte3 << 6 & 192 | byte4;
        output.push(outByte3)
      }
    }
  }
  return output
};
goog.crypt.base64.init_ = function() {
  if(!goog.crypt.base64.byteToCharMap_) {
    goog.crypt.base64.byteToCharMap_ = {};
    goog.crypt.base64.charToByteMap_ = {};
    goog.crypt.base64.byteToCharMapWebSafe_ = {};
    goog.crypt.base64.charToByteMapWebSafe_ = {};
    for(var i = 0;i < goog.crypt.base64.ENCODED_VALS.length;i++) {
      goog.crypt.base64.byteToCharMap_[i] = goog.crypt.base64.ENCODED_VALS.charAt(i);
      goog.crypt.base64.charToByteMap_[goog.crypt.base64.byteToCharMap_[i]] = i;
      goog.crypt.base64.byteToCharMapWebSafe_[i] = goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(i);
      goog.crypt.base64.charToByteMapWebSafe_[goog.crypt.base64.byteToCharMapWebSafe_[i]] = i
    }
  }
};
goog.provide("FirebaseTokenGenerator");
goog.require("CryptoJS");
goog.require("fb.tokengenerator.constants");
goog.require("fb.tokengenerator.json");
goog.require("fb.tokengenerator.utf8");
goog.require("fb.tokengenerator.validation");
goog.require("goog.crypt.base64");
var TOKEN_SEP = ".";
var TOKEN_VERSION = 0;
var FirebaseTokenGenerator = function(secret) {
  fb.tokengenerator.validation.validateArgCount("new FirebaseTokenGenerator", 1, 1, arguments.length);
  fb.tokengenerator.validation.validateSecret("new FirebaseTokenGenerator", 1, secret);
  this.mSecret = secret
};
FirebaseTokenGenerator.prototype.createToken = function(data, options) {
  var funcName = "FirebaseTokenGenerator.createToken";
  fb.tokengenerator.validation.validateArgCount(funcName, 1, 2, arguments.length);
  fb.tokengenerator.validation.validateCredentialOptions(funcName, 2, options);
  options = options || {};
  fb.tokengenerator.validation.validateCredentialData(funcName, 1, data, options["admin"] === true);
  if(FirebaseTokenGenerator.isEmptyObject_(data) && FirebaseTokenGenerator.isUselessOptionsObject_(options)) {
    throw new Error(funcName + ": data is empty and no options are set.  This token will have no effect on Firebase.");
  }
  var claims = this.createOptionsClaims(funcName, options);
  claims["v"] = TOKEN_VERSION;
  claims["d"] = data;
  if(!claims["iat"]) {
    claims["iat"] = Math.floor((new Date).getTime() / 1E3)
  }
  return this.createToken_(claims)
};
FirebaseTokenGenerator.prototype.createOptionsClaims = function(func_name, opts) {
  var claims = {};
  for(var o in opts) {
    switch(o) {
      case "expires":
      ;
      case "notBefore":
        var code = o === "notBefore" ? "nbf" : "exp";
        if(opts[o] instanceof Date) {
          claims[code] = Math.round(opts[o].getTime() / 1E3)
        }else {
          fb.tokengenerator.validation.validateOption(func_name, o, opts[o], "number", "a number");
          claims[code] = opts[o]
        }
        break;
      case "admin":
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], "boolean", "a boolean");
        claims["admin"] = opts[o];
        break;
      case "debug":
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], "boolean", "a boolean");
        claims["debug"] = opts[o];
        break;
      case "simulate":
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], "boolean", "a boolean");
        claims["simulate"] = opts[o];
        break;
      case "iat":
        fb.tokengenerator.validation.validateOption(func_name, o, opts[o], "number", "a number");
        claims["iat"] = opts[o];
        break;
      default:
        throw new Error(func_name + ': unrecognized "' + o + '" option');
    }
  }
  return claims
};
FirebaseTokenGenerator.prototype.createToken_ = function(claims) {
  var headerData = {"typ":"JWT", "alg":"HS256"};
  var encodedHeader = this.noPadWebsafeBase64Encode_(fb.tokengenerator.json.stringify(headerData));
  var encodedClaims = this.noPadWebsafeBase64Encode_(fb.tokengenerator.json.stringify(claims));
  var secureBits = encodedHeader + TOKEN_SEP + encodedClaims;
  var hashHex = CryptoJS.HmacSHA256(secureBits, this.mSecret).toString();
  var hashBytes = this.hexToBytes_(hashHex);
  var sig = goog.crypt.base64.encodeByteArray(hashBytes, true);
  sig = this.removeBase64Pad_(sig);
  var token = encodedHeader + TOKEN_SEP + encodedClaims + TOKEN_SEP + sig;
  fb.tokengenerator.validation.validateGeneratedToken(token);
  return token
};
FirebaseTokenGenerator.prototype.noPadWebsafeBase64Encode_ = function(str) {
  var utf8Bytes = fb.tokengenerator.utf8.stringToByteArray(str);
  var base64String = goog.crypt.base64.encodeByteArray(utf8Bytes, true);
  return this.removeBase64Pad_(base64String)
};
FirebaseTokenGenerator.prototype.removeBase64Pad_ = function(str) {
  var padStart = str.indexOf(".");
  if(padStart >= 0) {
    return str.substring(0, padStart)
  }else {
    return str
  }
};
FirebaseTokenGenerator.prototype.hexToBytes_ = function(hex) {
  for(var bytes = [], c = 0;c < hex.length;c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16))
  }
  return bytes
};
FirebaseTokenGenerator.isEmptyObject_ = function(obj) {
  if(typeof obj !== "object") {
    return false
  }
  if(obj === null) {
    return true
  }
  for(var key in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, key)) {
      return false
    }
  }
  return true
};
FirebaseTokenGenerator.isUselessOptionsObject_ = function(obj) {
  function containsUsefulKeys(obj) {
    var usefulKeys = ["admin", "debug", "simulate"];
    for(var i in usefulKeys) {
      var key = usefulKeys[i];
      if(Object.prototype.hasOwnProperty.call(obj, key)) {
        return true
      }
    }
    return false
  }
  return FirebaseTokenGenerator.isEmptyObject_(obj) || !containsUsefulKeys(obj)
};
if(NODE_CLIENT) {
  module["exports"] = FirebaseTokenGenerator
}
;
