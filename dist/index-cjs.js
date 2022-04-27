var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.js
var xbone_exports = {};
__export(xbone_exports, {
  default: () => xbone_default
});
module.exports = __toCommonJS(xbone_exports);
var import_victor = __toESM(require("victor"));
var import_three = require("three");

// utils/anime/anime.js
var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: "normal",
  autoplay: true,
  timelineOffset: 0
};
var defaultTweenSettings = {
  duration: 1e3,
  delay: 0,
  endDelay: 0,
  easing: "easeOutElastic(1, .5)",
  round: 0
};
var validTransforms = ["translateX", "translateY", "translateZ", "rotate", "rotateX", "rotateY", "rotateZ", "scale", "scaleX", "scaleY", "scaleZ", "skew", "skewX", "skewY", "perspective", "matrix", "matrix3d"];
var cache = {
  CSS: {},
  springs: {}
};
function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
function stringContains(str, text) {
  return str.indexOf(text) > -1;
}
function applyArguments(func, args) {
  return func.apply(null, args);
}
var is = {
  arr: function(a) {
    return Array.isArray(a);
  },
  obj: function(a) {
    return stringContains(Object.prototype.toString.call(a), "Object");
  },
  pth: function(a) {
    return is.obj(a) && a.hasOwnProperty("totalLength");
  },
  svg: function(a) {
    return a;
  },
  inp: function(a) {
    return a;
  },
  dom: function(a) {
    return a.nodeType || is.svg(a);
  },
  str: function(a) {
    return typeof a === "string";
  },
  fnc: function(a) {
    return typeof a === "function";
  },
  und: function(a) {
    return typeof a === "undefined";
  },
  nil: function(a) {
    return is.und(a) || a === null;
  },
  hex: function(a) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
  },
  rgb: function(a) {
    return /^rgb/.test(a);
  },
  hsl: function(a) {
    return /^hsl/.test(a);
  },
  col: function(a) {
    return is.hex(a) || is.rgb(a) || is.hsl(a);
  },
  key: function(a) {
    return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== "targets" && a !== "keyframes";
  }
};
function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(",").map(function(p) {
    return parseFloat(p);
  }) : [];
}
function spring(string, duration) {
  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], 0.1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], 0.1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], 0.1, 100);
  var velocity = minMax(is.und(params[3]) ? 0 : params[3], 0.1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;
  function solver(t) {
    var progress = duration ? duration * t / 1e3 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) {
      return t;
    }
    return 1 - progress;
  }
  function getDuration() {
    var cached = cache.springs[string];
    if (cached) {
      return cached;
    }
    var frame = 1 / 6;
    var elapsed = 0;
    var rest = 0;
    while (true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) {
          break;
        }
      } else {
        rest = 0;
      }
    }
    var duration2 = elapsed * frame * 1e3;
    cache.springs[string] = duration2;
    return duration2;
  }
  return duration ? solver : getDuration;
}
function steps(steps2) {
  if (steps2 === void 0)
    steps2 = 10;
  return function(t) {
    return Math.ceil(minMax(t, 1e-6, 1) * steps2) * (1 / steps2);
  };
}
var bezier = function() {
  var kSplineTableSize = 11;
  var kSampleStepSize = 1 / (kSplineTableSize - 1);
  function A(aA1, aA2) {
    return 1 - 3 * aA2 + 3 * aA1;
  }
  function B(aA1, aA2) {
    return 3 * aA2 - 6 * aA1;
  }
  function C(aA1) {
    return 3 * aA1;
  }
  function calcBezier(aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }
  function getSlope(aT, aA1, aA2) {
    return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
  }
  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > 1e-7 && ++i < 10);
    return currentT;
  }
  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0) {
        return aGuessT;
      }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }
  function bezier2(mX1, mY1, mX2, mY2) {
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
      return;
    }
    var sampleValues = new Float32Array(kSplineTableSize);
    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }
    function getTForX(aX) {
      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;
      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }
      --currentSample;
      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);
      if (initialSlope >= 1e-3) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }
    }
    return function(x) {
      if (mX1 === mY1 && mX2 === mY2) {
        return x;
      }
      if (x === 0 || x === 1) {
        return x;
      }
      return calcBezier(getTForX(x), mY1, mY2);
    };
  }
  return bezier2;
}();
var penner = function() {
  var eases = { linear: function() {
    return function(t) {
      return t;
    };
  } };
  var functionEasings = {
    Sine: function() {
      return function(t) {
        return 1 - Math.cos(t * Math.PI / 2);
      };
    },
    Circ: function() {
      return function(t) {
        return 1 - Math.sqrt(1 - t * t);
      };
    },
    Back: function() {
      return function(t) {
        return t * t * (3 * t - 2);
      };
    },
    Bounce: function() {
      return function(t) {
        var pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {
        }
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
      };
    },
    Elastic: function(amplitude, period) {
      if (amplitude === void 0)
        amplitude = 1;
      if (period === void 0)
        period = 0.5;
      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, 0.1, 2);
      return function(t) {
        return t === 0 || t === 1 ? t : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - p / (Math.PI * 2) * Math.asin(1 / a)) * (Math.PI * 2) / p);
      };
    }
  };
  var baseEasings = ["Quad", "Cubic", "Quart", "Quint", "Expo"];
  baseEasings.forEach(function(name, i) {
    functionEasings[name] = function() {
      return function(t) {
        return Math.pow(t, i + 2);
      };
    };
  });
  Object.keys(functionEasings).forEach(function(name) {
    var easeIn = functionEasings[name];
    eases["easeIn" + name] = easeIn;
    eases["easeOut" + name] = function(a, b) {
      return function(t) {
        return 1 - easeIn(a, b)(1 - t);
      };
    };
    eases["easeInOut" + name] = function(a, b) {
      return function(t) {
        return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
      };
    };
    eases["easeOutIn" + name] = function(a, b) {
      return function(t) {
        return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
      };
    };
  });
  return eases;
}();
function parseEasings(easing, duration) {
  if (is.fnc(easing)) {
    return easing;
  }
  var name = easing.split("(")[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case "spring":
      return spring(easing, duration);
    case "cubicBezier":
      return applyArguments(bezier, args);
    case "steps":
      return applyArguments(steps, args);
    default:
      return applyArguments(ease, args);
  }
}
function selectString(str) {
  try {
    var nodes = [];
    return nodes;
  } catch (e) {
    return;
  }
}
function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}
function flattenArray(arr) {
  return arr.reduce(function(a, b) {
    return a.concat(is.arr(b) ? flattenArray(b) : b);
  }, []);
}
function toArray(o) {
  if (is.arr(o)) {
    return o;
  }
  if (is.str(o)) {
    o = selectString(o) || o;
  }
  return [o];
}
function arrayContains(arr, val) {
  return arr.some(function(a) {
    return a === val;
  });
}
function cloneObject(o) {
  var clone = {};
  for (var p in o) {
    clone[p] = o[p];
  }
  return clone;
}
function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) {
    o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  }
  return o;
}
function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) {
    o[p] = is.und(o1[p]) ? o2[p] : o1[p];
  }
  return o;
}
function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? "rgba(" + rgb[1] + ",1)" : rgbValue;
}
function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function(m, r2, g2, b2) {
    return r2 + r2 + g2 + g2 + b2 + b2;
  });
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return "rgba(" + r + "," + g + "," + b + ",1)";
}
function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p2, q2, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p2 + (q2 - p2) * 6 * t;
    }
    if (t < 1 / 2) {
      return q2;
    }
    if (t < 2 / 3) {
      return p2 + (q2 - p2) * (2 / 3 - t) * 6;
    }
    return p2;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
}
function colorToRgb(val) {
  if (is.rgb(val)) {
    return rgbToRgba(val);
  }
  if (is.hex(val)) {
    return hexToRgba(val);
  }
  if (is.hsl(val)) {
    return hslToRgba(val);
  }
}
function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) {
    return split[1];
  }
}
function getTransformUnit(propName) {
  if (stringContains(propName, "translate") || propName === "perspective") {
    return "px";
  }
  if (stringContains(propName, "rotate") || stringContains(propName, "skew")) {
    return "deg";
  }
}
function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) {
    return val;
  }
  return val(animatable.target, animatable.id, animatable.total);
}
function getAttribute(el, prop) {
  return el.getAttribute(prop);
}
function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, "deg", "rad", "turn"], valueUnit)) {
    return value;
  }
  var cached = cache.CSS[value + unit];
  if (!is.und(cached)) {
    return cached;
  }
  var baseline = 100;
  return;
}
function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || is.svg(el) && el[prop])) {
    return "attribute";
  }
  if (is.dom(el) && arrayContains(validTransforms, prop)) {
    return "transform";
  }
  if (el[prop] != null) {
    return "object";
  }
}
function getElementTransforms(el) {
  if (!is.dom(el)) {
    return;
  }
  var str = "";
  var reg = /(\w+)\(([^)]*)\)/g;
  var transforms = /* @__PURE__ */ new Map();
  var m;
  while (m = reg.exec(str)) {
    transforms.set(m[1], m[2]);
  }
  return transforms;
}
function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, "scale") ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms["last"] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}
function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case "transform":
      return getTransformValue(target, propName, animatable, unit);
    case "attribute":
      return getAttribute(target, propName);
    default:
      return target[propName] || 0;
  }
}
function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) {
    return to;
  }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ""));
  switch (operator[0][0]) {
    case "+":
      return x + y + u;
    case "-":
      return x - y + u;
    case "*":
      return x * y + u;
  }
}
function validateValue(val, unit) {
  if (is.col(val)) {
    return colorToRgb(val);
  }
  if (/\s/g.test(val)) {
    return val;
  }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) {
    return unitLess + unit;
  }
  return unitLess;
}
function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, "r");
}
function getRectLength(el) {
  return getAttribute(el, "width") * 2 + getAttribute(el, "height") * 2;
}
function getLineLength(el) {
  return getDistance({ x: getAttribute(el, "x1"), y: getAttribute(el, "y1") }, { x: getAttribute(el, "x2"), y: getAttribute(el, "y2") });
}
function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) {
      totalLength += getDistance(previousPos, currentPos);
    }
    previousPos = currentPos;
  }
  return totalLength;
}
function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}
function getTotalLength(el) {
  if (el.getTotalLength) {
    return el.getTotalLength();
  }
  switch (el.tagName.toLowerCase()) {
    case "circle":
      return getCircleLength(el);
    case "rect":
      return getRectLength(el);
    case "line":
      return getLineLength(el);
    case "polyline":
      return getPolylineLength(el);
    case "polygon":
      return getPolygonLength(el);
  }
}
function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute("stroke-dasharray", pathLength);
  return pathLength;
}
function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) {
      break;
    }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}
function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, "viewBox");
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(" ") : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width,
    h: height,
    vW: viewBox[2],
    vH: viewBox[3]
  };
}
function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function(property) {
    return {
      property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    };
  };
}
function getPathProgress(path, progress, isPathTargetInsideSVG) {
  function point(offset) {
    if (offset === void 0)
      offset = 0;
    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(1);
  var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
  var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
  switch (path.property) {
    case "x":
      return (p.x - svg.x) * scaleX;
    case "y":
      return (p.y - svg.y) * scaleY;
    case "angle":
      return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}
function decomposeValue(val, unit) {
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  var value = validateValue(is.pth(val) ? val.totalLength : val, unit) + "";
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: is.str(val) || unit ? value.split(rgx) : []
  };
}
function parseTargets(targets) {
  var targetsArray = targets ? flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets)) : [];
  return filterArray(targetsArray, function(item, pos, self) {
    return self.indexOf(item) === pos;
  });
}
function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function(t, i) {
    return { target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
  });
}
function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  if (/^spring/.test(settings.easing)) {
    settings.duration = spring(settings.easing);
  }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = l === 2 && !is.obj(prop[0]);
    if (!isFromTo) {
      if (!is.fnc(tweenSettings.duration)) {
        settings.duration = tweenSettings.duration / l;
      }
    } else {
      prop = { value: prop };
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function(v, i) {
    var obj = is.obj(v) && !is.pth(v) ? v : { value: v };
    if (is.und(obj.delay)) {
      obj.delay = !i ? tweenSettings.delay : 0;
    }
    if (is.und(obj.endDelay)) {
      obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
    }
    return obj;
  }).map(function(k) {
    return mergeObjects(k, settings);
  });
}
function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function(key) {
    return Object.keys(key);
  })), function(p) {
    return is.key(p);
  }).reduce(function(a, b) {
    if (a.indexOf(b) < 0) {
      a.push(b);
    }
    return a;
  }, []);
  var properties = {};
  var loop = function(i2) {
    var propName = propertyNames[i2];
    properties[propName] = keyframes.map(function(key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) {
            newKey.value = key[p];
          }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };
  for (var i = 0; i < propertyNames.length; i++)
    loop(i);
  return properties;
}
function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) {
    params = mergeObjects(flattenKeyframes(keyframes), params);
  }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}
function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function(v) {
        return getFunctionValue(v, animatable);
      });
      if (value.length === 1) {
        value = value[0];
      }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}
function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function(t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) {
      to = previousValue;
    }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) {
      tween.round = 1;
    }
    previousTween = tween;
    return tween;
  });
}
var setProgressValue = {
  css: function(t, p, v) {
    return t.style[p] = v;
  },
  attribute: function(t, p, v) {
    return t.setAttribute(p, v);
  },
  object: function(t, p, v) {
    return t[p] = v;
  },
  transform: function(t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = "";
      transforms.list.forEach(function(value, prop) {
        str += prop + "(" + value + ") ";
      });
      t.style.transform = str;
    }
  }
};
function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function(animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}
function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable,
      tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    };
  }
}
function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function(animatable) {
    return properties.map(function(prop) {
      return createAnimation(animatable, prop);
    });
  })), function(a) {
    return !is.und(a);
  });
}
function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function(anim) {
    return anim.timelineOffset ? anim.timelineOffset : 0;
  };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function(anim) {
    return getTlOffset(anim) + anim.duration;
  })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function(anim) {
    return getTlOffset(anim) + anim.delay;
  })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function(anim) {
    return getTlOffset(anim) + anim.duration - anim.endDelay;
  })) : tweenSettings.endDelay;
  return timings;
}
var instanceID = 0;
function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id,
    children: [],
    animatables,
    animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}
var activeInstances = [];
var engine = function() {
  var raf;
  function play() {
    if (!raf && (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) && activeInstances.length > 0) {
      raf = requestAnimationFrame(step);
    }
  }
  function step(t) {
    var activeInstancesLength = activeInstances.length;
    var i = 0;
    while (i < activeInstancesLength) {
      var activeInstance = activeInstances[i];
      if (!activeInstance.paused) {
        activeInstance.tick(t);
        i++;
      } else {
        activeInstances.splice(i, 1);
        activeInstancesLength--;
      }
    }
    raf = i > 0 ? requestAnimationFrame(step) : void 0;
  }
  function handleVisibilityChange() {
    if (!anime.suspendWhenDocumentHidden) {
      return;
    }
    if (isDocumentHidden()) {
      raf = cancelAnimationFrame(raf);
    } else {
      activeInstances.forEach(function(instance) {
        return instance._onDocumentVisibility();
      });
    }
    engine();
  }
  return play;
}();
function isDocumentHidden() {
  return;
}
function anime(params) {
  if (params === void 0)
    params = {};
  var startTime = 0, lastTime = 0, now = 0;
  var children, childrenLength = 0;
  var resolve = null;
  function makePromise(instance2) {
    var promise2 = new Promise(function(_resolve) {
      return resolve = _resolve;
    });
    instance2.finished = promise2;
    return promise2;
  }
  var instance = createNewInstance(params);
  var promise = makePromise(instance);
  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== "alternate") {
      instance.direction = direction !== "normal" ? "normal" : "reverse";
    }
    instance.reversed = !instance.reversed;
    children.forEach(function(child) {
      return child.reversed = instance.reversed;
    });
  }
  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }
  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }
  function seekChild(time, child) {
    if (child) {
      child.seek(time - child.timelineOffset);
    }
  }
  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) {
        seekChild(time, children[i]);
      }
    } else {
      for (var i$1 = childrenLength; i$1--; ) {
        seekChild(time, children[i$1]);
      }
    }
  }
  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      if (tweenLength) {
        tween = filterArray(tweens, function(t) {
          return insTime < t.end;
        })[0] || tween;
      }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = void 0;
      for (var n = 0; n < toNumbersLength; n++) {
        var value = void 0;
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + eased * (toNumber - fromNumber);
        } else {
          value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + " ";
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }
  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) {
      instance[cb](instance);
    }
  }
  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }
  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax(insTime / insDuration * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) {
      syncInstanceChildren(insTime);
    }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback("begin");
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback("loopBegin");
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if (insTime >= insEndDelay && instance.currentTime !== insDuration || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback("changeBegin");
      }
      setCallback("change");
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback("changeComplete");
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) {
      setCallback("update");
    }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback("loopComplete");
          setCallback("complete");
          if (!instance.passThrough) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback("loopComplete");
        instance.loopBegan = false;
        if (instance.direction === "alternate") {
          toggleInstanceDirection();
        }
      }
    }
  }
  instance.reset = function() {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === "reverse";
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--; ) {
      instance.children[i].reset();
    }
    if (instance.reversed && instance.loop !== true || direction === "alternate" && instance.loop === 1) {
      instance.remaining++;
    }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };
  instance._onDocumentVisibility = resetTime;
  instance.set = function(targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };
  instance.tick = function(t) {
    now = t;
    if (!startTime) {
      startTime = now;
    }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };
  instance.seek = function(time) {
    setInstanceProgress(adjustTime(time));
  };
  instance.pause = function() {
    instance.paused = true;
    resetTime();
  };
  instance.play = function() {
    if (!instance.paused) {
      return;
    }
    if (instance.completed) {
      instance.reset();
    }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    engine();
  };
  instance.reverse = function() {
    toggleInstanceDirection();
    instance.completed = instance.reversed ? false : true;
    resetTime();
  };
  instance.restart = function() {
    instance.reset();
    instance.play();
  };
  instance.remove = function(targets) {
    var targetsArray = parseTargets(targets);
    removeTargetsFromInstance(targetsArray, instance);
  };
  instance.reset();
  if (instance.autoplay) {
    instance.play();
  }
  return instance;
}
function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--; ) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}
function removeTargetsFromInstance(targetsArray, instance) {
  var animations = instance.animations;
  var children = instance.children;
  removeTargetsFromAnimations(targetsArray, animations);
  for (var c = children.length; c--; ) {
    var child = children[c];
    var childAnimations = child.animations;
    removeTargetsFromAnimations(targetsArray, childAnimations);
    if (!childAnimations.length && !child.children.length) {
      children.splice(c, 1);
    }
  }
  if (!animations.length && !children.length) {
    instance.pause();
  }
}
function removeTargetsFromActiveInstances(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--; ) {
    var instance = activeInstances[i];
    removeTargetsFromInstance(targetsArray, instance);
  }
}
function stagger(val, params) {
  if (params === void 0)
    params = {};
  var direction = params.direction || "normal";
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === "first";
  var fromCenter = fromIndex === "center";
  var fromLast = fromIndex === "last";
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function(el, i, t) {
    if (fromFirst) {
      fromIndex = 0;
    }
    if (fromCenter) {
      fromIndex = (t - 1) / 2;
    }
    if (fromLast) {
      fromIndex = t - 1;
    }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
          var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
          var toX = index % grid[0];
          var toY = Math.floor(index / grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === "x") {
            value = -distanceX;
          }
          if (axis === "y") {
            value = -distanceY;
          }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) {
        values = values.map(function(val3) {
          return easing(val3 / maxValue) * maxValue;
        });
      }
      if (direction === "reverse") {
        values = values.map(function(val3) {
          return axis ? val3 < 0 ? val3 * -1 : -val3 : Math.abs(maxValue - val3);
        });
      }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
  };
}
function timeline(params) {
  if (params === void 0)
    params = {};
  var tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) {
      activeInstances.splice(tlIndex, 1);
    }
    function passThrough(ins2) {
      ins2.passThrough = true;
    }
    for (var i = 0; i < children.length; i++) {
      passThrough(children[i]);
    }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) {
      tl.play();
    }
    return tl;
  };
  return tl;
}
anime.version = "3.2.1";
anime.speed = 1;
anime.suspendWhenDocumentHidden = true;
anime.running = activeInstances;
anime.remove = removeTargetsFromActiveInstances;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
var anime_default = anime;

// index.js
var Xbone = class {
  imgInfo_list = [];
  imgPoint_list = [];
  imgScale_list = [];
  grid_list = [];
  anime_gridList = [];
  keyframes = [];
  zeroOrg = {};
  scale = 1;
  loop = true;
  autoplay = true;
  clientScene = "web";
  relative_scale = 1;
  animeCall = null;
  scale_anime = [];
  position_anime = [];
  bone_anime = [];
  mainAnime = null;
  constructor(option) {
    this.ctx = option.ctx;
    this.clientScene = option.clientScene;
    this.animeCall = option.animeCall;
    this.xboneData = option.data;
    this.imgInfo_list = this.xboneData.imgInfo_list;
    this.imgPoint_list = this.xboneData.imgPoint_list;
    this.imgScale_list = this.xboneData.imgScale_list;
    this.grid_list = this.xboneData.grid_list;
    this.zeroOrg = this.xboneData.zeroOrg;
    this.keyframes = this.xboneData.keyframes;
    this.width = option.width;
    this.height = option.height;
    this.relative_scale = this.width / this.xboneData.build_canvas_size.width;
    this.init();
  }
  init() {
    this.xboneData.img_data.forEach((item, index) => {
      let img = new Image();
      let img_width = this.imgInfo_list[index].width;
      let img_height = this.imgInfo_list[index].height;
      if (this.clientScene == "ohos") {
        if (item.base64Data.length > 0) {
          img.src = item.base64Data;
          img.onload = () => {
            this.imgInfo_list[index].imageData = img;
            this.imgInfo_list[index].imageData.width = img_width;
            this.imgInfo_list[index].imageData.height = img_height;
          };
        } else {
          img.src = item.uri;
          img.onload = () => {
            this.imgInfo_list[index].imageData = img;
            this.imgInfo_list[index].imageData.width = img_width;
            this.imgInfo_list[index].imageData.height = img_height;
          };
        }
        if (this.grid_list[index] != null) {
          this.gridDataRelative(index);
        } else {
          this.drawImageItem(img, this.imgPoint_list[index], this.imgScale_list[index], img_width, img_height);
        }
      } else {
        img.src = item.base64Data;
        this.imgInfo_list[index].imageData = img;
        this.imgInfo_list[index].imageData.width = img_width;
        this.imgInfo_list[index].imageData.height = img_height;
        if (this.grid_list[index] != null) {
          this.gridDataRelative(index);
        } else {
          this.drawImageItem(img, this.imgPoint_list[index], this.imgScale_list[index], img_width, img_height);
        }
      }
    });
    let attr_list = [];
    let scale_keyframe_list = [];
    let imgPoint_keyframe_list = [];
    let griding_keyframe_list = [];
    this.keyframes.forEach((item) => {
      let attr_item = {
        value: item.time * 100,
        keytime: item.time,
        duration: item.time
      };
      if (attr_list.length > 0) {
        let new_time = attr_item.keytime - attr_list[attr_list.length - 1].keytime;
        attr_item.duration = new_time;
        attr_list.push(attr_item);
      } else {
        attr_list.push(attr_item);
      }
      let scale_keyframe_item = {
        scaleList: item.canvasData.scaleList,
        keytime: item.time,
        duration: item.time
      };
      if (scale_keyframe_list.length > 0) {
        let new_time = scale_keyframe_item.keytime - scale_keyframe_list[scale_keyframe_list.length - 1].keytime;
        scale_keyframe_item.duration = new_time;
        scale_keyframe_list.push(scale_keyframe_item);
      } else {
        scale_keyframe_list.push(scale_keyframe_item);
      }
      let imgPoint_keyframe_item = {
        imgPointList: item.canvasData.imgPointList,
        keytime: item.time,
        duration: item.time
      };
      if (imgPoint_keyframe_list.length > 0) {
        let new_time = imgPoint_keyframe_item.keytime - imgPoint_keyframe_list[imgPoint_keyframe_list.length - 1].keytime;
        imgPoint_keyframe_item.duration = new_time;
        imgPoint_keyframe_list.push(imgPoint_keyframe_item);
      } else {
        imgPoint_keyframe_list.push(imgPoint_keyframe_item);
      }
      let griding_keyframe_item = {
        gridingData: item.canvasData.gridingData,
        keytime: item.time,
        duration: item.time
      };
      if (griding_keyframe_list.length > 0) {
        let new_time = griding_keyframe_item.keytime - griding_keyframe_list[griding_keyframe_list.length - 1].keytime;
        griding_keyframe_item.duration = new_time;
        griding_keyframe_list.push(griding_keyframe_item);
      } else {
        griding_keyframe_list.push(griding_keyframe_item);
      }
    });
    if (this.keyframes.length > 0) {
      let griding_list = JSON.parse(JSON.stringify(this.keyframes[0].canvasData.gridingData));
      griding_list.forEach((griding, g_idx) => {
        if (griding != null) {
          let boneMoved_angle = griding.boneMoved_angle;
          let boneList = griding.boneList;
          boneMoved_angle.forEach((angle, b_idx) => {
            let bone_obj = {
              angle,
              x1: boneList[b_idx].x1,
              y1: boneList[b_idx].y1,
              x2: boneList[b_idx].x2,
              y2: boneList[b_idx].y2,
              x3: boneList[b_idx].x3,
              y3: boneList[b_idx].y3
            };
            let keyframes = [];
            griding_keyframe_list.forEach((item) => {
              let keyframe = {
                angle: item.gridingData[g_idx].boneMoved_angle[b_idx],
                x1: item.gridingData[g_idx].boneList[b_idx].x1,
                y1: item.gridingData[g_idx].boneList[b_idx].y1,
                x2: item.gridingData[g_idx].boneList[b_idx].x2,
                y2: item.gridingData[g_idx].boneList[b_idx].y2,
                x3: item.gridingData[g_idx].boneList[b_idx].x3,
                y3: item.gridingData[g_idx].boneList[b_idx].y3,
                duration: item.duration
              };
              keyframes.push(keyframe);
            });
            let griding_anime = new anime_default({
              targets: bone_obj,
              keyframes,
              easing: "linear",
              loop: this.loop,
              autoplay: this.autoplay,
              update: () => {
                griding_list[g_idx] = this.setBoneMoved_angle(griding_list[g_idx], g_idx, b_idx, bone_obj.angle);
                this.anime_gridList = griding_list;
              }
            });
            this.bone_anime.push(griding_anime);
          });
        }
      });
      let scale_list = JSON.parse(JSON.stringify(this.keyframes[0].canvasData.scaleList));
      this.scale_anime = [];
      scale_list.forEach((scale, index) => {
        let scale_obj = {
          value: scale
        };
        let keyframs = [];
        scale_keyframe_list.forEach((item) => {
          let keyframe = {
            value: item.scaleList[index],
            duration: item.duration
          };
          keyframs.push(keyframe);
        });
        let scale_anime = new anime_default({
          targets: scale_obj,
          value: keyframs,
          easing: "linear",
          loop: this.loop,
          autoplay: this.autoplay,
          update: () => {
            scale_list[index] = scale_obj.value;
            this.setScaleList(scale_list);
          }
        });
        this.scale_anime.push(scale_anime);
      });
      let imgPoint_list = JSON.parse(JSON.stringify(this.keyframes[0].canvasData.imgPointList));
      this.position_anime = [];
      imgPoint_list.forEach((imgPoint, index) => {
        let imgPoint_obj = {
          x: imgPoint.x,
          y: imgPoint.y
        };
        let keyframs = [];
        imgPoint_keyframe_list.forEach((item) => {
          let keyframe = {
            x: item.imgPointList[index].x,
            y: item.imgPointList[index].y,
            duration: item.duration
          };
          keyframs.push(keyframe);
        });
        let imgPoint_anime = new anime_default({
          targets: imgPoint_obj,
          keyframes: keyframs,
          easing: "linear",
          loop: this.loop,
          autoplay: this.autoplay,
          update: () => {
            imgPoint_list[index].x = imgPoint_obj.x + this.zeroOrg.x;
            imgPoint_list[index].y = imgPoint_obj.y + this.zeroOrg.y;
            this.setImgPointList(imgPoint_list);
          }
        });
        this.position_anime.push(imgPoint_anime);
      });
      let mainAnimeCall = {
        call: 0
      };
      this.mainAnime = new anime_default({
        targets: mainAnimeCall,
        call: attr_list,
        easing: "linear",
        loop: this.loop,
        autoplay: this.autoplay,
        update: () => {
          this.animeCall(this.anime_gridList);
        },
        complete: () => {
        }
      });
    }
  }
  play() {
    this.mainAnime.play();
    this.scale_anime.forEach((item) => {
      item.play();
    });
    this.position_anime.forEach((item) => {
      item.play();
    });
    this.bone_anime.forEach((item) => {
      item.play();
    });
  }
  pause() {
    this.mainAnime.pause();
    this.scale_anime.forEach((item) => {
      item.pause();
    });
    this.position_anime.forEach((item) => {
      item.pause();
    });
    this.bone_anime.forEach((item) => {
      item.pause();
    });
  }
  animeClear() {
    this.scale_anime = [];
    this.position_anime = [];
    this.bone_anime = [];
  }
  checkBoneAnime() {
    return this.bone_anime;
  }
  getAnimeGridList() {
    return this.anime_gridList;
  }
  reloadImgDraw(griding_list = []) {
    this.ctx.save();
    this.clearCanvas();
    this.imgInfo_list.forEach((item, index) => {
      let img = item.imageData;
      let img_width = item.width;
      let img_height = item.height;
      if (this.grid_list[index] != null) {
        if (griding_list.length == 0) {
          this.gridDataRelative(index);
        } else {
          this.gridDataRelative(index, griding_list[index]);
        }
      } else {
        this.drawImageItem(img, this.imgPoint_list[index], this.imgScale_list[index], img_width, img_height);
      }
    });
    this.ctx.restore();
  }
  drawImageItem(img, imgPoint, imgScale, img_width = null, img_height = null) {
    let imgpoint = { x: imgPoint.x - this.zeroOrg.x, y: imgPoint.y - this.zeroOrg.y };
    let imgWidth = img_width || img.width;
    let imgHeight = img_height || img.height;
    this.ctx.drawImage(img, imgpoint.x * this.relative_scale, imgpoint.y * this.relative_scale, imgWidth * this.relative_scale * this.scale * imgScale, imgHeight * this.relative_scale * this.scale * imgScale);
  }
  gridDataRelative(index, griding_info = null) {
    let img = this.imgInfo_list[index].imageData;
    let info = this.grid_list[index];
    if (griding_info != null) {
      info = griding_info;
    }
    let gridingPoint = info.gridingPoint;
    let triangleList = this.grid_list[index].triangleList;
    let img_point = info.img_point;
    let img_width = info.img_width;
    let boneList = info.boneList;
    let bone_weight = info.bone_weight;
    let boneMoved_angle = info.boneMoved_angle;
    let imgPoint = this.imgPoint_list[index];
    let reload_point = { x: imgPoint.x - this.zeroOrg.x, y: imgPoint.y - this.zeroOrg.y };
    reload_point = new import_victor.default(reload_point.x * this.relative_scale, reload_point.y * this.relative_scale);
    let reload_img_width = this.imgInfo_list[index].width * this.imgScale_list[index] * this.relative_scale * this.scale;
    let reload_img_height = this.imgInfo_list[index].height * this.imgScale_list[index] * this.relative_scale * this.scale;
    let relative_scale = reload_img_width / img_width;
    let relative_point = reload_point;
    let relative_img_point_move = new import_victor.default(relative_point.x - img_point.x * relative_scale, relative_point.y - img_point.y * relative_scale);
    let boneList_relative = [];
    boneList.forEach((bone) => {
      let temp_bone = [null, null, null];
      temp_bone[0] = new import_victor.default(bone[0].x * relative_scale + relative_img_point_move.x, bone[0].y * relative_scale + relative_img_point_move.y);
      temp_bone[1] = new import_victor.default(bone[1].x * relative_scale + relative_img_point_move.x, bone[1].y * relative_scale + relative_img_point_move.y);
      temp_bone[2] = new import_victor.default(bone[2].x * relative_scale + relative_img_point_move.x, bone[2].y * relative_scale + relative_img_point_move.y);
      boneList_relative.push(temp_bone);
    });
    let gridingPoint_relative = [];
    gridingPoint.forEach((point) => {
      let temp_point = new import_victor.default(point.x * relative_scale, point.y * relative_scale);
      gridingPoint_relative.push(temp_point);
    });
    let relative_info = {
      img,
      img_point: relative_point,
      img_width: reload_img_width,
      img_height: reload_img_height,
      gridingPoint: gridingPoint_relative,
      bone_weight,
      boneList: boneList_relative,
      boneMoved_angle,
      triangleList
    };
    this.drawGridItem(relative_info);
  }
  drawGridItem(info) {
    let img = info.img;
    let img_point = info.img_point;
    let gridingPoint = info.gridingPoint;
    let triangleList = info.triangleList;
    let img_width = info.img_width;
    let img_height = info.img_height;
    let boneList = info.boneList;
    let bone_weight = info.bone_weight;
    let angle = info.boneMoved_angle;
    let def_mesh = [];
    this.ctx.save();
    this.ctx.translate(img_point.x, img_point.y);
    boneList.forEach((bone, b_idx) => {
      let bone_belong_point = [];
      let transformList = null;
      triangleList.forEach((triangle) => {
        let temp_pointList = triangle;
        let point1 = gridingPoint[temp_pointList[0]];
        let point2 = gridingPoint[temp_pointList[1]];
        let point3 = gridingPoint[temp_pointList[2]];
        let weight1 = bone_weight[temp_pointList[0]];
        let weight2 = bone_weight[temp_pointList[1]];
        let weight3 = bone_weight[temp_pointList[2]];
        let new_t = [point1, point2, point3];
        let old_t = [point1, point2, point3];
        let replacePoint1 = point1;
        let replacePoint2 = point2;
        let replacePoint3 = point3;
        if (weight1 == weight2 && weight2 == weight3 && weight1 == weight3 && weight3 == b_idx) {
          bone_belong_point.push([point1, point2, point3]);
          replacePoint1 = this.getParentBoneRotatePoint(point1, boneList, weight1, img_point, angle);
          replacePoint2 = this.getParentBoneRotatePoint(point2, boneList, weight2, img_point, angle);
          replacePoint3 = this.getParentBoneRotatePoint(point3, boneList, weight3, img_point, angle);
          new_t = [replacePoint1, replacePoint2, replacePoint3];
          let getTransform = this.getTransformMatrix(old_t, new_t);
          if (getTransform != null && transformList == null) {
            transformList = getTransform;
          }
        } else {
          let def_mesh_Point1 = this.getParentBoneRotatePoint(point1, boneList, weight1, img_point, angle);
          let def_mesh_Point2 = this.getParentBoneRotatePoint(point2, boneList, weight2, img_point, angle);
          let def_mesh_Point3 = this.getParentBoneRotatePoint(point3, boneList, weight3, img_point, angle);
          let def_new_t = [def_mesh_Point1, def_mesh_Point2, def_mesh_Point3];
          let def_transformList2 = this.getTransformMatrix(old_t, def_new_t);
          let def_mesh_item = {
            new_t: [def_mesh_Point1, def_mesh_Point2, def_mesh_Point3],
            transformList: def_transformList2
          };
          def_mesh.push(def_mesh_item);
        }
      });
      if (def_mesh.length == 0) {
        this.ctx.save();
        this.ctx.transform(transformList[0][0], transformList[0][1], transformList[1][0], transformList[1][1], transformList[2][0], transformList[2][1]);
        this.ctx.drawImage(img, 0, 0, img_width, img_height);
        this.ctx.restore();
      }
    });
    this.ctx.restore();
    let def_transformList = null;
    this.ctx.save();
    this.ctx.translate(img_point.x, img_point.y);
    def_mesh.forEach((mesh) => {
      this.ctx.beginPath();
      let new_t = mesh.new_t;
      this.ctx.moveTo(new_t[0].x, new_t[0].y);
      this.ctx.lineTo(new_t[1].x, new_t[1].y);
      this.ctx.lineTo(new_t[2].x, new_t[2].y);
      this.ctx.closePath();
      def_transformList = mesh.transformList;
      this.ctx.save();
      this.ctx.clip();
      if (def_transformList != null) {
        this.ctx.transform(def_transformList[0][0], def_transformList[0][1], def_transformList[1][0], def_transformList[1][1], def_transformList[2][0], def_transformList[2][1]);
      }
      this.ctx.drawImage(img, 0, 0, img_width, img_height);
      this.ctx.restore();
      if (this.clientScene == "web") {
        this.ctx.save();
        this.ctx.clip();
        if (def_transformList != null) {
          this.ctx.transform(def_transformList[0][0], def_transformList[0][1], def_transformList[1][0], def_transformList[1][1], def_transformList[2][0], def_transformList[2][1]);
        }
        this.ctx.drawImage(img, 0, 0, img_width, img_height);
        this.ctx.restore();
        this.ctx.save();
        this.ctx.clip();
        if (def_transformList != null) {
          this.ctx.transform(def_transformList[0][0], def_transformList[0][1], def_transformList[1][0], def_transformList[1][1], def_transformList[2][0], def_transformList[2][1]);
        }
        this.ctx.drawImage(img, 0, 0, img_width, img_height);
        this.ctx.restore();
      }
    });
    this.ctx.restore();
  }
  getParentBoneRotatePoint(point, boneList, b_idx, img_point, angleList) {
    let bone = boneList[0];
    let root_angle = angleList[0];
    let root_bone_rotate_point = this.replaceRotatePoint(root_angle, bone, point, img_point);
    let retrun_point = root_bone_rotate_point;
    for (let i = 1; i <= b_idx; i++) {
      let bone2 = boneList[i];
      bone2 = [new import_victor.default(bone2[0].x, bone2[0].y), new import_victor.default(bone2[1].x, bone2[1].y), new import_victor.default(bone2[2].x, bone2[2].y)];
      let point2 = retrun_point;
      let init_angle = 0;
      let angle = angleList[i];
      let new_point = this.replaceRotatePoint(angle + init_angle, bone2, point2, img_point);
      new_point = new import_victor.default(new_point.x, new_point.y);
      img_point = new import_victor.default(img_point.x, img_point.y);
      retrun_point = new_point;
    }
    return retrun_point;
  }
  replaceRotatePoint(angle, bone, point, img_point) {
    let orgP = new import_victor.default(bone[1].x, bone[1].y);
    let newP = new import_victor.default(point.x, point.y);
    let relativeP = newP.subtract(orgP.subtract(img_point));
    let newP_rotate = relativeP.rotate(-angle * Math.PI / 180);
    let newP_rotate_add = newP_rotate.add(orgP);
    return newP_rotate_add;
  }
  getTransformMatrix(old_t, new_t) {
    let matrixFrom = null;
    let matrixTo = null;
    let matrixTransform = new import_three.Matrix3();
    let itemList = null;
    matrixFrom = new import_three.Matrix3();
    matrixFrom.set(old_t[0].x, old_t[0].y, 1, old_t[1].x, old_t[1].y, 1, old_t[2].x, old_t[2].y, 1);
    matrixTo = new import_three.Matrix3();
    matrixTo.set(new_t[0].x, new_t[0].y, 1, new_t[1].x, new_t[1].y, 1, new_t[2].x, new_t[2].y, 1);
    matrixTransform = matrixTransform.multiplyMatrices(matrixFrom.invert(), matrixTo);
    if (matrixTransform == null) {
      return null;
    }
    itemList = this.getItemList(matrixTransform.elements, 3, 3);
    return itemList;
  }
  getItemList(numList, m, n) {
    if (!(m && n && m * n === numList.length)) {
      console.error("Matrix Error");
    }
    let i, j, itemList, subItemList;
    itemList = new Array(m);
    for (i = 0; i < m; i++) {
      subItemList = new Array(n);
      for (j = 0; j < n; j++) {
        subItemList[j] = numList[j * m + i].toFixed(3);
      }
      itemList[i] = subItemList;
    }
    return itemList;
  }
  setImgPointList(imgPointList) {
    this.imgPoint_list = imgPointList;
  }
  setScaleList(scale_list) {
    this.imgScale_list = scale_list;
  }
  setGrid_list(grid_list) {
    this.grid_list = grid_list;
  }
  setBoneMoved_angle(info, index, boneIndex, angle) {
    let boneList = info.boneList;
    let boneMoved_angle = info.boneMoved_angle;
    let initialBoneList = info.initialBoneList;
    let initBone = JSON.parse(initialBoneList[boneIndex]);
    initBone = [new import_victor.default(initBone[0].x, initBone[0].y), new import_victor.default(initBone[1].x, initBone[1].y), new import_victor.default(initBone[2].x, initBone[2].y)];
    let img_point = info.img_point;
    let initBone_angle = info.initBone_angle;
    let init_angle = initBone_angle[boneIndex];
    let rotateBone = boneList[boneIndex];
    rotateBone = [new import_victor.default(rotateBone[0].x, rotateBone[0].y), new import_victor.default(rotateBone[1].x, rotateBone[1].y), new import_victor.default(rotateBone[2].x, rotateBone[2].y)];
    if (boneIndex > 0) {
      let pre_bone = boneList[boneIndex - 1];
      pre_bone = [new import_victor.default(pre_bone[0].x, pre_bone[0].y), new import_victor.default(pre_bone[1].x, pre_bone[1].y), new import_victor.default(pre_bone[2].x, pre_bone[2].y)];
      let offset_move = pre_bone[0].clone().subtract(initBone[1]);
      let new_point2 = initBone[0].clone().add(offset_move);
      for (let i = 0; i < boneIndex; i++) {
        let angle2 = boneMoved_angle[i];
        let bone = boneList[i];
        new_point2 = this.replaceRotateBonePoint(angle2, bone, new_point2, img_point);
      }
      rotateBone[0] = new_point2;
      init_angle = this.getTwoPointAngle(rotateBone);
    }
    let orgPoint = rotateBone[1];
    if (boneIndex > 0) {
      orgPoint = boneList[boneIndex - 1][0];
    }
    let dl = rotateBone[0].distance(orgPoint);
    let new_point = this.getPointByOffsetAndAngle(orgPoint, dl, angle + init_angle, 1);
    rotateBone[0] = new_point;
    info.boneList[boneIndex] = rotateBone;
    info = this.subBoneLinkAge(info, boneIndex);
    boneMoved_angle[boneIndex] = angle;
    info.boneMoved_angle = boneMoved_angle;
    return info;
  }
  getPointByOffsetAndAngle(point, offset, angle, dl) {
    return {
      x: point.x + offset * dl * Math.sin(angle * Math.PI / 180),
      y: point.y + offset * dl * Math.cos(angle * Math.PI / 180)
    };
  }
  subBoneLinkAge(info, boneIndex) {
    let img_point = info.img_point;
    let rotateBone = info.boneList[boneIndex];
    rotateBone = [new import_victor.default(rotateBone[0].x, rotateBone[0].y), new import_victor.default(rotateBone[1].x, rotateBone[1].y), new import_victor.default(rotateBone[2].x, rotateBone[2].y)];
    let initBone_angle = info.initBone_angle;
    let boneList = info.boneList;
    boneList.forEach((bone, b_idx) => {
      if (b_idx > boneIndex) {
        let pre_bone = boneList[b_idx - 1];
        pre_bone = [new import_victor.default(pre_bone[0].x, pre_bone[0].y), new import_victor.default(pre_bone[1].x, pre_bone[1].y), new import_victor.default(pre_bone[2].x, pre_bone[2].y)];
        bone = [new import_victor.default(bone[0].x, bone[0].y), new import_victor.default(bone[1].x, bone[1].y), new import_victor.default(bone[2].x, bone[2].y)];
        let angle = this.getRotateByMouseMove(pre_bone[1], bone[1], pre_bone[0]);
        let new_point_1 = this.replaceRotateBonePoint(angle, rotateBone, bone[1], img_point);
        bone[1] = new import_victor.default(new_point_1.x, new_point_1.y);
        let new_point_0 = this.replaceRotateBonePoint(angle, rotateBone, bone[0], img_point);
        bone[0] = new import_victor.default(new_point_0.x, new_point_0.y);
        let init_angle = initBone_angle[b_idx];
        init_angle = this.getTwoPointAngle(bone);
        initBone_angle[b_idx] = init_angle;
        boneList[b_idx] = bone;
      }
    });
    info.boneList = boneList;
    return info;
  }
  getRotateByMouseMove(orgP, startP, endP) {
    const lengthAB = Math.sqrt(this.diffPow(orgP.x, startP.x) + this.diffPow(orgP.y, startP.y));
    const lengthAC = Math.sqrt(this.diffPow(orgP.x, endP.x) + this.diffPow(orgP.y, endP.y));
    const lengthBC = Math.sqrt(this.diffPow(startP.x, endP.x) + this.diffPow(startP.y, endP.y));
    if (lengthAB === 0 || lengthAC === 0 || lengthBC === 0) {
      return 0;
    }
    const cosA = (this.pow(lengthAB) + this.pow(lengthAC) - lengthBC * lengthBC) / (2 * lengthAB * lengthAC);
    const angleA = Math.acos(cosA) * 180 / Math.PI;
    if ((startP.x - orgP.x) * (endP.y - orgP.y) - (endP.x - orgP.x) * (startP.y - orgP.y) > 0) {
      return -angleA;
    }
    return angleA;
  }
  pow(x) {
    return x * x;
  }
  diffPow(x, y) {
    return (x - y) * (x - y);
  }
  replaceRotateBonePoint(angle, bone, point, img_point) {
    let orgP = new import_victor.default(bone[1].x, bone[1].y);
    orgP = orgP.subtract(img_point);
    point = JSON.stringify(point);
    point = JSON.parse(point);
    let newP = new import_victor.default(point.x, point.y);
    newP = newP.subtract(img_point);
    let relativeP = newP.subtract(orgP);
    let newP_rotate = relativeP.rotate(-angle * Math.PI / 360);
    let newP_rotate_add = newP_rotate.add(orgP);
    newP_rotate_add.add(img_point);
    return newP_rotate_add;
  }
  getTwoPointAngle(bone) {
    bone = [new import_victor.default(bone[0].x, bone[0].y), new import_victor.default(bone[1].x, bone[1].y), new import_victor.default(bone[2].x, bone[2].y)];
    let dl = bone[0].distance(bone[1]);
    let temp_point = this.getPointByOffsetAndAngle(bone[1], dl, 0, 1);
    let angle = this.getRotateByMouseMove(bone[1], temp_point, bone[0]);
    return angle;
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width + 10, this.height + 10);
  }
};
var xbone_default = Xbone;
