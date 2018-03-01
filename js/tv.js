
/**
 *
 * @author yx
 * @type {{init: tgo.init, $focus: Array, getFocusIndex: tgo.getFocusIndex, searchFocus: tgo.searchFocus, focusMove: tgo.focusMove, $keyEvent: {up: tgo.$keyEvent.up, down: tgo.$keyEvent.down, left: tgo.$keyEvent.left, right: tgo.$keyEvent.right, ok: tgo.$keyEvent.ok, back: tgo.$keyEvent.back, beforeKeyEventEnter: tgo.$keyEvent.beforeKeyEventEnter, keyLock: boolean}, keyEventInit: tgo.keyEventInit}}
 */
/**
 *  拓展api
 * @param {function} callback
 */
Array.prototype.each = function (callback) {
    for (var i = 0; i < this.length; i++) {
        var breaks = callback(this[i], i);
        if (breaks === false) {
            break;
        }
    }
};
Array.prototype.filters = function (F) {
    var arr = [];
    if (typeof F === 'function') {
        this.each(function (obj) {
            if (F(obj)) {
                arr.push(obj);
            }
        });
    }
    return arr;
}
if (!window.JSON) {
    window.JSON = {
        parse: function (str) {
            if (typeof str === 'string') {
                eval("var obj = " + str);
                return obj;
            }
        },
        stringify: function (json) {
            var str = '';
            switch (typeof json) {
                case 'object':
                    for (var key in json) {
                        if (typeof json[key] === 'function') {
                            continue;
                        }
                        if (!(json instanceof Array)) {
                            str += '"' + key + '"' + ':';
                        }
                        str += this.stringify(json[key]) + ',';
                    }
                    str = str.substring(0, str.length - 1);
                    if (json instanceof Array) {
                        str = '[' + str + ']';
                    } else {
                        str = '{' + str + '}';
                    }
                    break;
                case 'string':
                    str = '"' + json + '"';
                    break;
                case 'function':
                    break;
                default:
                    str = json;
                    break;
            }
            if (Function.prototype.bind) {
                return ('' + str).replace(/[\n]/g, "");
            } else {
                return str;
            }
        }
    }
}

var tgo = {
    /**
     *    初始化所有焦点、按键
     */
    init: function (options) {
        // if(typeof Object.defineProperty !== 'undefined'){
        //    Object.defineProperty(tgo.$keyEvent,'ok',{
        //        set : function (val) {
        //            document.onclick = val;
        //            this.value = val;
        //        },
        //        get : function () {
        //            return this.value
        //        }
        //    });
        // }
        this.keyEventInit();
        if (options && options.focusElement) {
            tgo.focusElement = options.focusElement;
        }
        if (options && options.miss) {
            tgo.miss = options.miss;
        }
        if (options && options.allFocus) {
            this.allFocus = options.allFocus;
            if (typeof options.focusElement != 'undefined') {
                for (var i = 0; i < this.allFocus.length; i++) {
                    var obj = this.allFocus[i];
                    options.focusElement(obj)
                }
            }
        } else {
            this.allFocus = tgo.searchFocus();
        }
        this.currentFocus = this.allFocus[0];
    },
    $focus: [],
    getFocusIndex: function (ele) {
        for (var i = 0; i < this.allFocus.length; i++) {
            if (this.allFocus[i] === ele) {
                return i;
            }
        }
    },
    searchFocus: function () {
        try {
            var arr = [];
            var ele = document.getElementsByTagName("body")[0];
            forFocus(arr, ele);
            return arr;

            function forFocus(arr, ele) {
                if (ele.children) {
                    for (var i = 0; i < ele.children.length; i++) {
                        if (ele.children[i] && ele.children[i].className) {
                            if (ele.children[i].className.indexOf("focus") > -1) {
                                var isRepeat = false;
                                for (var j = 0; j < arr.length; j++) {
                                    if (arr[j] === ele.children[i]) {
                                        isRepeat = true;
                                        break;
                                    }
                                }
                                if (!isRepeat) {
                                    arr.push(ele.children[i]);
                                    if (tgo.focusElement) {
                                        tgo.focusElement(ele.children[i])
                                    }
                                }
                            }
                        }
                        if (ele.children[i] && ele.children[i].children) {
                            if (ele.children[i].children.length > 0) {
                                forFocus(arr, ele.children[i]);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            alert(JSON.stringify(e))
        }
    },
    //误差范围
    miss: 0,
    /**
     * 焦点计算
     */
    focusMove: function (options) {
        try {
            /**
             *  如果含有自定义焦点
             */
            for (var i = 0; i < this.$focus.length; i++) {
                var res = false;
                if (typeof this.$focus[i].element === 'object') {
                    if (this.$focus[i].element instanceof TGOFOCUS || this.$focus[i].element instanceof Array) {
                        Array.prototype.each.call(this.$focus[i].element, function (obj) {
                            if (obj === tgo.currentFocus) {
                                res = true;
                                return false;
                            }
                        });
                    } else {
                        (this.$focus[i].element === this.currentFocus) && (res = true);
                    }
                } else if (this.$focus[i].element == "*") {
                    res = true;
                }
                if (res) {
                    var dire;
                    if (options.direction == 'add') {
                        if (options.axis == 'x') {
                            dire = this.$focus[i].direction.right;
                            if (typeof this.$focus[i].direction.right === 'function') {
                                dire = this.$focus[i].direction.right();
                            }
                        } else if (options.axis == 'y') {
                            dire = this.$focus[i].direction.bottom;
                            if (typeof this.$focus[i].direction.bottom === 'function') {
                                dire = this.$focus[i].direction.bottom();
                            }
                        }
                    } else if (options.direction == 'reduce') {
                        if (options.axis == 'x') {
                            dire = this.$focus[i].direction.left;
                            if (typeof this.$focus[i].direction.left === 'function') {
                                dire = this.$focus[i].direction.left();
                            }
                        } else if (options.axis == 'y') {
                            dire = this.$focus[i].direction.top;
                            if (typeof this.$focus[i].direction.top === 'function') {
                                dire = this.$focus[i].direction.top();
                            }
                        }
                    }
                    if (dire === false) {
                        return tgo.currentFocus;
                    }
                    if (dire) {
                        if (dire instanceof TGOFOCUS || dire instanceof Array) {
                            return dire[0]
                        } else {
                            return dire
                        }
                    }
                }
            }
            var children = tgo.allFocus;
            var x1 = getOffsetLeftByBody(tgo.currentFocus);
            var x2 = getOffsetLeftByBody(tgo.currentFocus) + getOffsetWidthByBody(tgo.currentFocus);
            var y1 = getOffsetTopByBody(tgo.currentFocus);
            var y2 = getOffsetTopByBody(tgo.currentFocus) + getOffsetHeightByBody(tgo.currentFocus);
            var tempArr = [];
            for (var i = 0; i < children.length; i++) {
                if (isHidden(children[i])) {
                    continue;
                }
                switch (options.axis) {
                    case 'x':
                        if (options.direction == 'add') {
                            if (getOffsetLeftByBody(children[i]) >= x2 - tgo.miss) {
                                tempArr.push(children[i]);
                            }
                        } else if (options.direction == 'reduce') {
                            if (getOffsetLeftByBody(children[i]) + getOffsetWidthByBody(children[i]) <= x1 + tgo.miss) {
                                tempArr.push(children[i]);
                            }
                        }
                        break;
                    case 'y':
                        if (options.direction == 'add') {
                            if (getOffsetTopByBody(children[i]) >= y2 - tgo.miss) {
                                tempArr.push(children[i]);
                            }
                        } else if (options.direction == 'reduce') {
                            if (getOffsetTopByBody(children[i]) + getOffsetHeightByBody(children[i]) <= y1 + tgo.miss) {
                                tempArr.push(children[i]);
                            }
                        }
                        break;
                }
            }
            var min = {
                jl: 0,
                element: tgo.currentFocus
            };
            for (var j = 0; j < tempArr.length; j++) {
                if (isHidden(tempArr[j])) {
                    continue;
                }
                var tempX1 = getOffsetLeftByBody(tempArr[j]);
                var tempX2 = getOffsetLeftByBody(tempArr[j]) + getOffsetWidthByBody(tempArr[j]);
                var tempY1 = getOffsetTopByBody(tempArr[j]);
                var tempY2 = getOffsetTopByBody(tempArr[j]) + getOffsetHeightByBody(tempArr[j]);
                var jl = -1;
                switch (options.axis) {
                    case 'x':
                        if (options.direction == 'add') {
                            if (y2 < tempY1) {
                                jl = (tempX1 - x2) * (tempX1 - x2) + (tempY1 - y2) * (tempY1 - y2);
                            } else if (y1 > tempY2) {
                                jl = (tempX1 - x2) * (tempX1 - x2) + (tempY2 - y1) * (tempY2 - y1);
                            } else {
                                jl = (tempX1 - x2) * (tempX1 - x2);
                            }
                        } else if (options.direction == 'reduce') {
                            if (y2 < tempY1) {
                                jl = (x1 - tempX2) * (x1 - tempX2) + (y1 - tempY2) * (y1 - tempY2);
                            } else if (y1 > tempY2) {
                                jl = (x1 - tempX2) * (x1 - tempX2) + (y2 - tempY1) * (y2 - tempY1);
                            } else {
                                jl = (x1 - tempX2) * (x1 - tempX2);
                            }
                        }
                        break;
                    case 'y':
                        if (options.direction == 'add') {
                            if (x1 > tempX2) {
                                jl = (y2 - tempY1) * (y2 - tempY1) + (x1 - tempX2) * (x1 - tempX2);
                            } else if (x2 < tempX1) {
                                jl = (y2 - tempY1) * (y2 - tempY1) + (x2 - tempX1) * (x2 - tempX1);
                            } else {
                                jl = (y2 - tempY1) * (y2 - tempY1);
                            }
                        } else if (options.direction == 'reduce') {
                            if (x1 > tempX2) {
                                jl = (tempY2 - y1) * (tempY2 - y1) + (tempX1 - x2) * (tempX1 - x2);
                            } else if (x2 < tempX1) {
                                jl = (tempY2 - y1) * (tempY2 - y1) + (tempX2 - x1) * (tempX2 - x1);
                            } else {
                                jl = (tempY2 - y1) * (tempY2 - y1);
                            }
                        }
                        break;
                }

                if (j == 0) {
                    min.jl = jl;
                    min.element = tempArr[j];
                } else if (min.jl > jl) {
                    min.jl = jl;
                    min.element = tempArr[j];
                }
            }
            return (min.element);
        } catch (e) {
            alert(JSON.stringify(e))
        }
        return null;
    },
    $keyEvent: {
        up: function () {
            if (!tgo.allFocus.length > 0) {
                return;
            }
            var nextFocus = tgo.focusMove({
                axis: 'y',
                direction: 'reduce'
            });
            if (tgo.currentFocus != nextFocus && nextFocus.style.display != "none" && nextFocus.style.visibility != "hidden") {
                tgo.querySelector(nextFocus).focus();
            }
        },
        down: function () {
            if (!tgo.allFocus.length > 0) {
                return;
            }
            var nextFocus = tgo.focusMove({
                axis: 'y',
                direction: 'add'
            });
            if (tgo.currentFocus != nextFocus && nextFocus.style.display != "none" && nextFocus.style.visibility != "hidden") {
                tgo.querySelector(nextFocus).focus();
            }
        },
        left: function () {
            if (!tgo.allFocus.length > 0) {
                return;
            }
            var nextFocus = tgo.focusMove({
                axis: 'x',
                direction: 'reduce'
            });
            if (tgo.currentFocus != nextFocus && nextFocus.style.display != "none" && nextFocus.style.visibility != "hidden") {
                tgo.querySelector(nextFocus).focus();
            }
        },
        right: function () {
            if (!tgo.allFocus.length > 0) {
                return;
            }
            var nextFocus = tgo.focusMove({
                axis: 'x',
                direction: 'add'
            });
            if (tgo.currentFocus != nextFocus && nextFocus.style.display != "none" && nextFocus.style.visibility != "hidden") {
                tgo.querySelector(nextFocus).focus();
            }
        },
        ok: function () {

        },
        back: function () {

        },
        beforeKeyEventEnter: function (keyCode) {

        },
        keyLock: false
    },
    keyEventInit: function () {
        document.onkeydown = function () {
            var code = event.which || event.keyCode;
            if (tgo.$keyEvent.keyLock) {
                return;
            }
            tgo.$keyEvent.beforeKeyEventEnter(code);
            switch (code) {
                case 48: //数字
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    tgo.$input.each(function (input) {
                        if (input.element === tgo.currentFocus) {
                            if (input.value.length < input.maxLength) {
                                input.value += code - 48;
                                if (input.children.constructor === Number) {
                                    tgo.querySelector(input.element).children().eq(input.children).text(input.value);
                                } else if (input.children instanceof TGOFOCUS) {
                                    input.children.text(input.value);
                                } else {
                                    input.children.innerText = input.value;
                                }
                            }
                        }
                    });
                    return false;
                    break;
                case 1: //up
                case 38:
                case 28:
                case 269:
                    tgo.$keyEvent.up();
                    if (typeof event.preventDefault !== 'undefined') {
                        event.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }

                    return false;
                    break;
                case 2: //down
                case 40:
                case 31:
                case 270:
                    tgo.$keyEvent.down();
                    if (typeof event.preventDefault !== 'undefined') {
                        event.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }

                    return false;
                    break;
                case 3: //left
                case 37:
                case 29:
                case 271:
                    tgo.$keyEvent.left();
                    if (typeof event.preventDefault !== 'undefined') {
                        event.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }

                    return false;
                    break;
                case 4: //right
                case 39:
                case 30:
                case 272:
                    tgo.$keyEvent.right();
                    if (typeof event.preventDefault !== 'undefined') {
                        event.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }

                    return false;
                    break;
                case 8:   //返回
                case 45:
                case 283:
                case 340:
                    // 弹框判断
                    if (TGO.querySelector('#Message').length > 0) {
                        if (TGO.querySelector('#Message').css("display") != "none") {
                            TGO.allFocus = TGO.beforeMessageFocusArr;
                            TGO.querySelector(TGO.beforeMessageFocus).focus();
                            TGO.querySelector("#Message").css("display", "none");
                            return;
                        }
                    }
                    //输入框判断
                    var isInput = false;
                    tgo.$input.each(function (input) {
                        if (input.element === tgo.currentFocus) {
                            isInput = true;
                            //兼容性处理
                            if (input.value.length > input.minLength) {
                                input.value = input.value.substring(0, input.value.length - 1)
                            } else if (input.value.length == 1 && input.minLength == 0) {
                                input.value = '';
                            }
                            if (input.children.constructor === Number) {
                                tgo.querySelector(input.element).children().eq(input.children).text(input.value);
                            } else if (input.children instanceof TGOFOCUS) {
                                input.children.text(input.value);
                            } else {
                                input.children.innerText = input.value;
                            }
                        }
                    });
                    if (isInput) {
                        return;
                    }
                    //自定义返回
                    tgo.$keyEvent.back();
                    if (typeof event.preventDefault !== 'undefined') {
                        event.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }

                    return false;
                    break;
                case 13://确定
                    if (tgo.currentFocus) {
                        tgo.querySelector(tgo.currentFocus).ok();
                    }
                    tgo.$keyEvent.ok();
                    if (typeof event.preventDefault !== 'undefined') {
                        event.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }

                    return false;
            }
        }
    }
};

function isHidden(el) {
    var res = false;
    while (el && el.tagName != 'BODY') {
        if (tgo.querySelector(el).css('visibility') == 'hidden' || tgo.querySelector(el).css('display') == 'none') {
            res = true;
            break;
        }
        el = el.parentNode;
    }
    return res;
}

function getOffsetTopByBody(el) {
    var offsetTop = 0;
    var i = 0;
    if (typeof el.style.marginTop != 'undefined' && !Function.prototype.bind) {
        offsetTop += parseInt(el.style.marginTop);
    }
    while (el && el.tagName != 'BODY') {
        offsetTop += (el.offsetTop === undefined ? 0 : parseInt(el.offsetTop));
        el = el.offsetParent;
        i++;
    }
    return offsetTop;
}

function getOffsetLeftByBody(el) {
    var offsetLeft = 0;
    if (typeof el.style.marginLeft != 'undefined' && !Function.prototype.bind) {
        offsetLeft += parseInt(el.style.marginLeft);
    }
    while (el && el.tagName != 'BODY') {
        offsetLeft += (el.offsetLeft === undefined ? 0 : parseInt(el.offsetLeft));
        el = el.offsetParent;
    }
    return offsetLeft;
}

function getOffsetWidthByBody(el) {
    var offsetWidth = el.offsetWidth;
    if (!Function.prototype.bind) {
        if (el.style.marginLeft) {
            offsetWidth -= parseInt(el.style.marginLeft);
        }
        if (el.style.marginRight) {
            offsetWidth -= parseInt(el.style.marginRight);
        }
    }
    return offsetWidth;
}

function getOffsetHeightByBody(el) {
    var offsetHeight = el.offsetHeight;
    if (!Function.prototype.bind) {
        if (el.style.marginTop) {
            offsetHeight -= parseInt(el.style.marginTop);
        }
        if (el.style.marginBottom) {
            offsetHeight -= parseInt(el.style.marginBottom);
        }
    }
    return offsetHeight;
}

// function preventDefault() {
//     if(typeof event.preventDefault !== 'undefined'){
//         event.preventDefault();
//     }else{
//         window.event.returnValue = false;
//     }
// }

/**
 *
 * @param selector
 * @returns {TGOFOCUS}
 */
tgo.querySelector = function (selector) {
    if (!selector) {
        throw new Error();
    }
    var ele = [];
    if (typeof selector === 'string') {
        var selectorArr = selector.split(',');
        for (var i = 0; i < selectorArr.length; i++) {
            var obj = selectorArr[i];
            if (obj.indexOf('#') == 0) {
                ele.push(document.getElementById(obj.substring(1)));
            } else if (obj.indexOf('.') == 0) {
                ele = ele.concat(findClass(obj.substring(1)))
            } else {
                ele = document.getElementsByTagName(obj);
            }
        }
    } else {
        if (selector instanceof TGOFOCUS) {
            Array.prototype.each.call(selector, function (obj) {
                ele.push(obj);
            })
        } else {
            ele = selector
        }
    }
    var news = new TGOFOCUS(ele, selector);
    return news;
};
tgo.querySelector.preventDefault = function () {
};
/**
 *  元素的所有事件绑定
 */
tgo.$event = [];
/**
 *  元素的所有事件委托
 *  {
 *    element {DOM} //委托dom
 *    children {Array}  [{selector,eventtype,callback}]  //委托的子集
 *  }
 */
tgo.$entrust = [];
/**
 *  所有输入框集合
 */
tgo.$input = [];

/**
 *
 */
function TGOFOCUS(ele, selector) {
    if (typeof ele != 'undefined' && (ele instanceof Array || ele.toString().indexOf("HTMLCollection") > -1)) {
        for (var i = 0, j = 0; i < ele.length; i++) {
            if (!!ele[i]) {
                this[j] = ele[i];
                j++;
            }
        }
        this.length = j;
    } else if (!!ele) {
        this[0] = ele;
        this.length = 1;
    } else {
        this.length = 0;
    }
    if (typeof selector === "string") {
        this.selector = selector;
    }
}

TGOFOCUS.prototype = {
    text: function (val) {
        if (val != undefined) {
            for (var i = 0; i < this.length; i++) {
                this[i].innerText = val;
            }
        } else {
            var arr = [];
            for (var i = 0; i < this.length; i++) {
                arr.push(this[i].innerText);
            }
            return arr.join('');
        }
        return this;
    },
    html: function (val) {
        if (val != undefined) {
            for (var i = 0; i < this.length; i++) {
                this[i].innerHTML = val;
            }
        } else {
            var arr = [];
            for (var i = 0; i < this.length; i++) {
                arr.push(this[i].innerHTML);
            }
            return arr.join('');
        }
        return this;
    },
    eq: function (index) {
        if (this[index]) {
            var selector = this[index];
            return new TGOFOCUS(selector, selector);
        } else {
            return new TGOFOCUS();
        }
    },
    ok: function (callback) {
        if (typeof callback === "function") {
            for (var i = 0; i < this.length; i++) {
                var find = false;
                var _this = this;
                // (function (obj) {
                //     obj.onclick = function () {
                //         tgo.querySelector(obj).ok();
                //     };
                // })(_this[i]);
                tgo.$event.each(function (obj) {
                    if (obj.element === _this[i]) {
                        find = true;
                        obj.ok = callback;
                    }
                });
                if (!find) {
                    tgo.$event.push({
                        element: this[i],
                        ok: callback
                    });
                }
            }
        } else {
            for (var i = 0; i < tgo.$event.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    if (this[j] === tgo.$event[i].element) {
                        if (typeof tgo.$event[i].ok === 'function') {
                            tgo.$event[i].ok.call(tgo.$event[i].element);
                        }
                    }
                }
            }
            for (var i = 0; i < tgo.$entrust.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    if (tgo.querySelector(this[j]).parents(tgo.$entrust[i].element).length > 0) {
                        for (var k = 0; k < tgo.$entrust[i].list.length; k++) {
                            if (tgo.$entrust[i].list[k].childrenSelector.indexOf('.') > -1) {
                                var arr = this[j].className.split(" ");
                                for (var l = 0; l < arr.length; l++) {
                                    if (tgo.$entrust[i].list[k].childrenSelector.substring(1) === arr[l]) {
                                        if (typeof tgo.$entrust[i].list[k].ok === 'function') {
                                            tgo.$entrust[i].list[k].ok.call(this[j]);
                                        }
                                    }
                                }
                            } else if (tgo.$entrust[i].list[k].childrenSelector.indexOf('#') > -1) {
                                if (tgo.$entrust[i].list[k].childrenSelector.substring(1) === this[j].id) {
                                    if (typeof tgo.$entrust[i].list[k].ok === 'function') {
                                        tgo.$entrust[i].list[k].ok.call(this[j]);
                                    }
                                }
                            } else {
                                if (tgo.$entrust[i].list[k].childrenSelector.toLowerCase() === this[j].tagName.toLowerCase()) {
                                    if (typeof tgo.$entrust[i].list[k].ok === 'function') {
                                        tgo.$entrust[i].list[k].ok.call(this[j]);
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
        return this;
    },
    css: function (key, val) {
        /**
         * key的转化
         */
        var reverseName = function (str) {
            var arr = str.split('');
            var index = -1;
            for (var i = 0; i < arr.length; i++) {
                if (index != -1) {
                    index = -1;
                    arr[i] = arr[i].toUpperCase();
                }
                if (arr[i] === '-') {
                    if (i != 0) {
                        index = i + 1;
                    }
                    arr[i] = '';
                }
            }
            return arr.join('');
        };
        if (val == undefined && typeof key === "string") {
            if (typeof getComputedStyle != "undefined") {
                return getComputedStyle(this[0])[key];
            } else if (typeof this[0].currentStyle != "undefined") {
                return this[0].currentStyle[key];
            } else {
                return this[0].style[key];
            }
        } else if (val == undefined && typeof key === "object") {
            for (var styleName in key) {
                for (var i = 0; i < this.length; i++) {
                    this[i].style[reverseName(styleName)] = key[styleName];
                }
            }
        } else {
            for (var i = 0; i < this.length; i++) {
                this[i].style[key] = val;
            }
        }
        return this;
    },
    children: function (selector) {
        if (typeof selector === "undefined") {
            var arr = [];
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < this[i].children.length; j++) {
                    arr.push(this[i].children[j]);
                }
            }
            return new TGOFOCUS(arr);
        } else if (typeof selector === "string") {
            if (selector.indexOf("#") == 0) {//id选择
                var id = selector.substring(1);
                var arr = [];
                for (var i = 0; i < this.length; i++) {
                    for (var j = 0; j < this[i].children.length; j++) {
                        if (this[i].children[j].id === id) {
                            arr.push(this[i].children[j]);
                            break;
                        }
                    }
                }
                return new TGOFOCUS(arr);
            } else if (selector.indexOf(".") == 0) {
                var className = selector.substring(1);
                var arr = [];
                for (var i = 0; i < this.length; i++) {
                    for (var j = 0; j < this[i].children.length; j++) {
                        var classArr = this[i].children[j].className.split(" ");
                        for (var k = 0; k < classArr.length; k++) {
                            if (classArr[k] === className) {
                                arr.push(this[i].children[j]);
                                break;
                            }
                        }
                    }
                }
                return new TGOFOCUS(arr);
            } else {
                var tagName = selector;
                var arr = [];
                for (var i = 0; i < this.length; i++) {
                    for (var j = 0; j < this[i].children.length; j++) {
                        if (tagName === this[i].children[j].tagName.toLowerCase()) {
                            arr.push(this[i].children[j]);
                            break;
                        }
                    }
                }
                return new TGOFOCUS(arr);
            }
        }
    },
    parent: function () {
        var arr = [];
        for (var i = 0; i < this.length; i++) {
            var state = false;
            for (var j = 0; j < arr.length; j++) {
                if (arr[j] === this[i].parentNode) {
                    state = true;
                    break;
                }
            }
            if (!state) {
                arr.push(this[i].parentNode);
            }
        }
        return new TGOFOCUS(arr);
    },
    index: function () {
        var index = -1;
        for (var i = 0; i < this[0].parentNode.children.length; i++) {
            if (this[0].parentNode.children[i] === this[0]) {
                index = i;
                break;
            }
        }
        return index;
    },
    append: function (val) {
        if (typeof val === 'string') {
            for (var i = 0; i < this.length; i++) {
                var div = document.createElement('div');
                div.innerHTML = val;
                var obj = this[i];
                for (var j = 0; j < div.children.length; j++) {
                    obj.appendChild(div.children[j]);
                    j--;
                }
            }
        }
        return this;
    },
    prepend: function (val) {
        if (typeof val === 'string') {
            for (var i = 0; i < this.length; i++) {
                var div = document.createElement('div');
                div.innerHTML = val;
                var obj = this[i];
                for (var j = div.children.length - 1; j >= 0; j--) {
                    obj.insertBefore(div.children[j], obj.children[0] ? obj.children[0] : null);
                }
            }
        }
        return this;
    },
    focus: function (callback) {
        if (typeof callback === "function") {
            for (var i = 0; i < this.length; i++) {
                var find = false;
                var _this = this;
                // (function (obj) {
                //     obj.onmouseover = function () {
                //         tgo.querySelector(obj).focus();
                //     };
                // })(_this[i]);
                tgo.$event.each(function (obj) {
                    if (obj.element === _this[i]) {
                        find = true;
                        obj.focus = callback;
                    }
                });
                if (!find) {
                    tgo.$event.push({
                        element: this[i],
                        focus: callback
                    });
                }
            }
        } else {
            for (var i = 0; i < tgo.$event.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    if (this[j] === tgo.$event[i].element && typeof tgo.$event[i].focus === 'function') {
                        tgo.querySelector(tgo.currentFocus).blur();
                        tgo.$event[i].focus.call(tgo.$event[i].element);
                        tgo.currentFocus = tgo.$event[i].element;
                    }
                }
            }
            for (var i = 0; i < tgo.$entrust.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    if (tgo.querySelector(this[j]).parents(tgo.$entrust[i].element).length > 0) {
                        for (var k = 0; k < tgo.$entrust[i].list.length; k++) {
                            if (tgo.$entrust[i].list[k].childrenSelector.indexOf('.') > -1) {
                                var arr = this[j].className.split(" ");
                                for (var l = 0; l < arr.length; l++) {
                                    if (tgo.$entrust[i].list[k].childrenSelector.substring(1) === arr[l]) {
                                        if (typeof tgo.$entrust[i].list[k].focus === 'function') {
                                            tgo.querySelector(tgo.currentFocus).blur();
                                            tgo.$entrust[i].list[k].focus.call(this[j]);
                                            tgo.currentFocus = this[j];
                                        }
                                    }
                                }
                            } else if (tgo.$entrust[i].list[k].childrenSelector.indexOf('#') > -1) {
                                if (tgo.$entrust[i].list[k].childrenSelector.substring(1) === this[j].id) {
                                    if (typeof tgo.$entrust[i].list[k].focus === 'function') {
                                        tgo.querySelector(tgo.currentFocus).blur();
                                        tgo.$entrust[i].list[k].focus.call(this[j]);
                                        tgo.currentFocus = this[j];
                                    }
                                }
                            } else {
                                if (tgo.$entrust[i].list[k].childrenSelector.toLowerCase() === this[j].tagName.toLowerCase()) {
                                    if (typeof tgo.$entrust[i].list[k].focus === 'function') {
                                        tgo.querySelector(tgo.currentFocus).blur();
                                        tgo.$entrust[i].list[k].focus.call(this[j]);
                                        tgo.currentFocus = this[j];
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }

        return this;
    },
    blur: function (callback) {
        if (typeof callback === "function") {
            for (var i = 0; i < this.length; i++) {
                var find = false;
                var _this = this;
                // (function (obj) {
                //     obj.onmouseout = function () {
                //         tgo.querySelector(obj).blur();
                //     };
                // })(_this[i]);
                tgo.$event.each(function (obj) {
                    if (obj.element === _this[i]) {
                        find = true;
                        obj.blur = callback;
                    }
                });
                if (!find) {
                    tgo.$event.push({
                        element: this[i],
                        blur: callback
                    });
                }
            }
        } else {
            for (var i = 0; i < tgo.$event.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    if (this[j] === tgo.$event[i].element) {
                        if (typeof tgo.$event[i].blur === 'function') {
                            tgo.$event[i].blur.call(tgo.$event[i].element);
                        }
                    }
                }
            }
            for (var i = 0; i < tgo.$entrust.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    if (tgo.querySelector(this[j]).parents(tgo.$entrust[i].element).length > 0) {
                        for (var k = 0; k < tgo.$entrust[i].list.length; k++) {
                            if (tgo.$entrust[i].list[k].childrenSelector.indexOf('.') > -1) {
                                var arr = this[j].className.split(" ");
                                for (var l = 0; l < arr.length; l++) {
                                    if (tgo.$entrust[i].list[k].childrenSelector.substring(1) === arr[l]) {
                                        if (typeof tgo.$entrust[i].list[k].blur === 'function') {
                                            tgo.$entrust[i].list[k].blur.call(this[j]);
                                        }
                                    }
                                }
                            } else if (tgo.$entrust[i].list[k].childrenSelector.indexOf('#') > -1) {
                                if (tgo.$entrust[i].list[k].childrenSelector.substring(1) === this[j].id) {
                                    if (typeof tgo.$entrust[i].list[k].blur === 'function') {
                                        tgo.$entrust[i].list[k].blur.call(this[j]);
                                    }
                                }
                            } else {
                                if (tgo.$entrust[i].list[k].childrenSelector.toLowerCase() === this[j].tagName.toLowerCase()) {
                                    if (typeof tgo.$entrust[i].list[k].blur === 'function') {
                                        tgo.$entrust[i].list[k].blur.call(this[j]);
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
        return this;
    },
    parents: function (selector) {
        var parent = this[0].parentNode;
        var type = (function () {
            if (typeof selector === 'string') {
                if (selector.indexOf('.') > -1) {//类
                    return '0'
                } else if (selector.indexOf('#') > -1) {
                    return '1'
                } else {
                    return '2'
                }
            } else {
                return '4'
            }
        })();
        while (parent.tagName != 'BODY') {
            switch (type) {
                case '0': //类
                    if (parent.className) {
                        var arr = parent.className.split(" ");
                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i] === selector.substring(1)) {
                                return tgo.querySelector(parent);
                            }
                        }
                    }
                    break;
                case '1': //id
                    if (parent.id === selector.substring(1).replace(/ /g, "")) {
                        return tgo.querySelector(parent);
                    }
                    break;
                case '2': //tag
                    if (parent.tagName.toLowerCase() === selector.toLowerCase()) {
                        return tgo.querySelector(parent);
                    }
                    break;
                case '4':
                    if (parent === selector || parent.innerHTML === selector.innerHTML) {
                        return tgo.querySelector(parent);
                    }
                    break;
            }
            parent = parent.parentNode;
        }
        return tgo.querySelector([]);
    },
    delegate: function (selector, eventType, callback) {
        for (var i = 0; i < this.length; i++) {
            var find = false;
            var _this = this;
            tgo.$entrust.each(function (obj) {
                if (obj.element === _this[i]) {
                    find = true;
                    if (!obj.list) {
                        obj.list = []
                    }
                    var entrust = {
                        childrenSelector: selector
                    };
                    entrust[eventType] = callback;
                    obj.list.push(entrust);
                }
            });
            if (!find) {
                var obj = {
                    element: this[i],
                    list: []
                };
                var entrust = {
                    childrenSelector: selector
                };
                entrust[eventType] = callback;
                obj.list.push(entrust);
                tgo.$entrust.push(obj);
            }
        }
        return this;
    },
    find: function (selector) {
        var arr = [];
        if (typeof selector === 'string') {
            if (selector.indexOf('.') == 0) {
                Array.prototype.each.call(this, function (obj) {
                    arr = arr.concat(findClass(selector.substring(1), obj))
                });
            } else {
                Array.prototype.each.call(this, function (obj) {
                    arr = arr.concat(findClass(selector.substring(1), obj))
                });
            }
        }
        return new TGOFOCUS(arr)
    },
    concat: function (selector) {
        if (selector instanceof TGOFOCUS) {
            var length = this.length;
            for (var i = 0; i < parseInt(selector.length); i++) {
                var index = length + i;
                this[index] = selector[i];
            }
            this.length = length + selector.length;
        }
        return this;
    },
    next: function () {
        var index = tgo.querySelector(this[0]).index();
        if(this[0].parentNode.children.length < index + 1){
            return tgo.querySelector(this[0]).parent().children().eq(index + 1);
        }
        return new TGOFOCUS();
    },
    /**
     *
     * @param children
     * @param options {object}
     *         .value 默认输入框的值
     *         .maxLength 最大输入值
     * @returns {TGOFOCUS}
     */
    setInput: function (children, options) {
        typeof options === 'object' || (options = {});
        for (var i = 0; i < this.length; i++) {
            //基本配置
            var obj = {
                element: this[i],
                value: ( typeof(options.value) !== 'undefined') ? options.value + '' : '',
                maxLength: typeof options.maxLength === 'number' ? options.maxLength : 99,
                minLength: typeof options.minLength === 'number' ? options.minLength : 0
            };
            //是否含有子级判断
            if (children == 0 || children) {
                obj.children = children;
            } else {
                obj.children = this;
            }
            tgo.$input.push(obj);
            //初始化输入框
            if (children.constructor === Number) {
                tgo.querySelector(this[i]).children().eq(children).text(options.value);
            } else if (children instanceof TGOFOCUS) {
                children.text(options.value);
            } else {
                children.innerText = options.value;
            }
        }
        return this;
    },
    val: function (text) {
        var _this = this;
        if (typeof text !== 'undefined') {
            tgo.$input.each(function (input) {
                Array.prototype.each.call(_this, function (focus) {
                    if (focus === input.element) {
                        text = text.substring(0, input.maxLength);
                        input.value = text;
                        if (input.children.constructor === Number) {
                            tgo.querySelector(input.element).children().eq(input.children).text(input.value);
                        } else if (input.children instanceof TGOFOCUS) {
                            input.children.text(input.value);
                        } else {
                            input.children.innerText = input.value;
                        }
                    }
                })
            });
            return this;
        } else {
            var result = '';
            tgo.$input.each(function (input) {
                Array.prototype.each.call(_this, function (focus) {
                    if (focus === input.element) {
                        result = input.value;
                    }
                })
            });
            return result;
        }

    }
};

function findClass(className, parent) {
    var arr = [];
    var bodys = document.getElementsByTagName("body")[0];
    if (parent) {
        bodys = parent;
    }
    fors(bodys);
    return arr;

    function fors(nodes) {
        for (var i = 0; i < nodes.children.length; i++) {
            var child = nodes.children[i];
            if (typeof child.className != "undefined") {
                var classArr = child.className.split(" ");
                for (var k = 0; k < classArr.length; k++) {
                    if (classArr[k] === className) {
                        arr.push(child);
                        break;
                    }
                }
            }
            if (child.children.length > 0) {
                fors(child);
            }
        }
    }
}

/**
 * sp_pos声明位置
 */
tgo.$pos = {};
tgo.$pos.setPos = function (sp_pos) {
    iPanel.eventFrame.sp_Obj = {
        page: location.pathname.split('/')[location.pathname.split('/').length - 1],
        sp_pos: sp_pos
    }
};
tgo.$pos.getPos = function () {
    if (iPanel.eventFrame.sp_Obj) return iPanel.eventFrame.sp_Obj.sp_pos
    return null
};

/**
 * 路由跳转
 * @param options
 * @constructor
 */
tgo.Router = function (options) {
    if (typeof options === 'object' && options.routes instanceof Array) {
        this.routes = options.routes;
    }
    if (typeof options === 'object' && options.parentFile) {
        this.parentFile = options.parentFile;
    }
    /**
     * 获取url的参数
     */
    this.query = {};
    var href = window.location.href;
    if (href.indexOf('?') > -1) {
        var params = href.substring(href.indexOf('?') + 1);
        var arr = params.split('&');
        for (var i = 0; i < arr.length; i++) {
            var objArr = arr[i].split('=');
            if (objArr[0]) {
                this.query[objArr[0]] = arr[i].substring(arr[i].indexOf("=") + 1) || "";
            }
        }
    }
};

tgo.Router.prototype.push = function (route) {
    var url = '';
    switch (typeof route) {
        case 'object':
            if (route.name) {
                for (var key in this.routes) {
                    if (this.routes[key].name === route.name) {
                        url = '/' + this.parentFile + this.routes[key].path;
                        var query = (function (href) {
                            var query = {};
                            if (href.split('?')[1]) {
                                var params = href.split('?')[1];
                                var arr = params.split('&');
                                for (var i = 0; i < arr.length; i++) {
                                    var objArr = arr[i].split('=');
                                    if (objArr[0]) {
                                        query[objArr[0]] = objArr[1] || "";
                                    }
                                }
                            }
                            return query;
                        })(url);
                        for (var param in query) {
                            !route.query[param] && (route.query[param] = query[param]);
                        }
                        if (typeof route.query === "object") {
                            url += '?';
                            var i = 0;
                            for (var k in route.query) {
                                if (route.query[k] != undefined) {
                                    if (i != 0) {
                                        url += '&' + k + '=' + route.query[k];
                                    } else {
                                        url += k + '=' + route.query[k];
                                    }
                                    i++;
                                }
                            }
                        }
                    }
                }
            } else if (route.path) {
                if (route.path.indexOf('/') == 0) { //绝对路径处理
                    url = '/' + this.parentFile + route.path;
                } else { //相对路径
                    url = route.path;
                }
                var query = (function (href) {
                    var query = {};
                    if (href.split('?')[1]) {
                        var params = href.split('?')[1];
                        var arr = params.split('&');
                        for (var i = 0; i < arr.length; i++) {
                            var objArr = arr[i].split('=');
                            if (objArr[0]) {
                                query[objArr[0]] = objArr[1] || "";
                            }
                        }
                    }
                    return query;
                })(url);
                for (var param in query) {
                    !route.query[param] && (route.query[param] = query[param]);
                }
                if (typeof route.query === "object") {
                    url = url.split('?')[0];
                    if (url.indexOf('?') == -1) {
                        url += '?';
                    } else {
                        url += '&';
                    }
                    var i = 0;
                    for (var k in route.query) {
                        if (route.query[k] != undefined) {
                            if (i != 0) {
                                url += '&' + k + '=' + route.query[k];
                            } else {
                                url += k + '=' + route.query[k];
                            }
                            i++;
                        }
                    }
                }
            }
            //跳转声明位置
            if (typeof route.sp_pos == 'string') {
                tgo.$pos.setPos(route.sp_pos);
            }
            break;
        case 'string':
            if (route.indexOf('/') == 0) { //绝对路径处理
                url = '/' + this.parentFile + route;
            } else { //相对路径
                url = route;
            }
            break;
    }
    if (url) {
        window.location.href = url;
    } else {
        throw new Error('请指定path或者name');
    }
};

tgo.Router.prototype.replace = function (route) {
    var url = '';
    switch (typeof route) {
        case 'object':
            if (route.name) {
                for (var key in this.routes) {
                    if (this.routes[key].name === route.name) {
                        url = '/' + this.parentFile + this.routes[key].path;
                        var query = (function (href) {
                            var query = {};
                            if (href.split('?')[1]) {
                                var params = href.split('?')[1];
                                var arr = params.split('&');
                                for (var i = 0; i < arr.length; i++) {
                                    var objArr = arr[i].split('=');
                                    if (objArr[0]) {
                                        query[objArr[0]] = objArr[1] || "";
                                    }
                                }
                            }
                            return query;
                        })(url);
                        for (var param in query) {
                            !route.query[param] && (route.query[param] = query[param]);
                        }
                        if (typeof route.query === "object") {
                            url += '?';
                            var i = 0;
                            for (var k in route.query) {
                                if (i != 0) {
                                    url += '&' + k + '=' + route.query[k];
                                } else {
                                    url += k + '=' + route.query[k];
                                }
                                i++;
                            }
                        }
                    }
                }
            } else if (route.path) {
                if (route.path.indexOf('/') == 0) { //绝对路径处理
                    url = '/' + this.parentFile + route.path;
                } else { //相对路径
                    url = route.path;
                }
                var query = (function (href) {
                    var query = {};
                    if (href.split('?')[1]) {
                        var params = href.split('?')[1];
                        var arr = params.split('&');
                        for (var i = 0; i < arr.length; i++) {
                            var objArr = arr[i].split('=');
                            if (objArr[0]) {
                                query[objArr[0]] = objArr[1] || "";
                            }
                        }
                    }
                    return query;
                })(url);
                for (var param in query) {
                    !route.query[param] && (route.query[param] = query[param]);
                }
                if (typeof route.query === "object") {
                    url = url.split('?')[0];
                    if (url.indexOf('?') == -1) {
                        url += '?';
                    } else {
                        url += '&';
                    }
                    var i = 0;
                    for (var k in route.query) {
                        if (i != 0) {
                            url += '&' + k + '=' + route.query[k];
                        } else {
                            url += k + '=' + route.query[k];
                        }
                        i++;
                    }
                }
            }
            break;
        case 'string':
            if (route.indexOf('/') == 0) { //绝对路径处理
                url = '/' + this.parentFile + route;
            } else { //相对路径
                url = route;
            }
            break;
    }
    if (url) {
        window.location.replace(url);
    } else {
        throw new Error('请指定path或者name');
    }
};

var Promise = function (fn) {
    if (typeof fn === 'function') {
        //需要一个成功时的回调
        var doneCallback;
        //一个实例的方法，用来注册异步事件
        this.then = function (done) {
            doneCallback = done;
        }

        function resolve() {
            doneCallback();
        }

        fn(resolve);
    }
};

var tkTimeout;
var TGO = tgo;

function showTipsDiv(text, callback, time) {
    if (typeof time === 'undefined') {
        time = 3000
    }
    if (TGO.querySelector("#tankuang").length > 0) {
        TGO.querySelector("#tankuang").css("visibility", "visible");
        TGO.querySelector("#tankuang-text").html(text);
        if (typeof tkTimeout != 'undefined') {
            clearTimeout(tkTimeout);
        }
        tkTimeout = setTimeout(function () {
            if (typeof callback === 'function') {
                callback()
            }
            TGO.querySelector("#tankuang").css("visibility", "hidden");
            TGO.querySelector("#tankuang-text").html("");
        }, time);
    } else {
        var div = document.createElement('div');
        var style = {
            position: "absolute",
            left: "0",
            top: "0",
            width: "1280px",
            height: "720px",
            fontSize: "26px",
            color: "#666666",
            background: "url(images/beijing_shadow.png) no-repeat",
            visibility: "visible",
            zIndex: 9999
        };
        for (var key in style) {
            div.style[key] = style[key];
        }
        div.id = "tankuang";
        div.innerHTML = '<div style="position: absolute; left: 374px; top: 190px; width: 534px; height: 342px; font-size: 26px; color: rgb(102, 102, 102); background: rgb(236, 235, 225);"><div id="tankuang-text" style="width: 500px;position:relative;left: 17px;top: 105px;text-align: center">' + text + '</div></div>';
        document.body.appendChild(div);
        var img = new Image();
        img.src = 'images/beijing_shadow.png';
        img.onerror = function () {
            div.style.backgroundImage = 'url(../images/beijing_shadow.png)';
        }
        if (typeof tkTimeout != 'undefined') {
            clearTimeout(tkTimeout);
        }
        tkTimeout = setTimeout(function () {
            if (typeof callback === 'function') {
                callback();
            }
            TGO.querySelector("#tankuang").css("visibility", "hidden");
            TGO.querySelector("#tankuang-text").html("");
        }, time);
    }
}

TGO.showTipsDiv = showTipsDiv;
TGO.showMessage = function (title, ok, cancel, okCallback, cancelCallback) {
    if (TGO.querySelector("#Message").length > 0) {
        TGO.querySelector("#Message").css("display", "block");
        TGO.beforeMessageFocusArr = TGO.allFocus;
        TGO.beforeMessageFocus = TGO.currentFocus;
        TGO.allFocus = TGO.querySelector("#Message").children().eq(1).children();
        TGO.querySelector("#Message").children().eq(1).children().eq(1).focus();
    } else {
        var div = document.createElement('div');
        div.id = 'Message';
        var style = {
            width: '660px',
            height: '440px',
            background: 'url(images/tk-bg.png) no-repeat',
            position: 'absolute',
            left: '310px',
            top: '140px',
            display: 'block',
            color: '#000000',
            fontSize: '26px'
        };
        for (var key in style) {
            div.style[key] = style[key];
        }
        div.innerHTML =
            '    <div id="changeTipTxt"  style="position: absolute;width: 620px;text-align: center;top: 100px;left: 20px;font-size: 30px">' + title + '</div>\n' +
            '    <!--按钮-->\n' +
            '    <div>\n' +
            '        <div style="width: 228px;height: 94px;position: absolute;left: 86px;top: 260px;line-height: 94px;text-align: center ;color: #837F79;"><img style="position: absolute;top: 0;left: 0;" src="images/sy-btn.png" /><span style="position: relative">' + ok + '</span></div>\n' +
            '        <div style="width: 228px;height: 94px;position: absolute;right: 86px;top: 260px;line-height: 94px;text-align: center ;color: #837F79;"><img style="position: absolute;top: 0;left: 0;" src="images/sy-btn.png" /><span style="position: relative">' + cancel + '</span></div>\n' +
            '    </div>\n' +
            '    <div>\n' +
            '        <div style="width: 228px;height: 94px;position: absolute;left: 86px;top: 260px;line-height: 94px;text-align: center ;color: #ffffff;visibility: hidden"><img style="position: absolute;top: 0;left: 0;" src="images/sy-btn-focus.png" /><span style="position: relative">' + ok + '</span></div>\n' +
            '        <div style="width: 228px;height: 94px;position: absolute;right: 86px;top: 260px;line-height: 94px;text-align: center ;color: #ffffff;visibility: hidden"><img style="position: absolute;top: 0;left: 0;" src="images/sy-btn-focus.png" /><span style="position: relative">' + cancel + '</span></div>\n' +
            '    </div>\n';
        document.body.appendChild(div);
        TGO.beforeMessageFocusArr = TGO.allFocus;
        TGO.beforeMessageFocus = TGO.currentFocus;
        TGO.querySelector(div).children().eq(1).children().focus(function () {
            var index = TGO.querySelector(this).index();
            TGO.querySelector(div).children().eq(2).children().eq(index).css("visibility", "visible");
        }).blur(function () {
            var index = TGO.querySelector(this).index();
            TGO.querySelector(div).children().eq(2).children().eq(index).css("visibility", "hidden");
        });
        TGO.querySelector(div).children().eq(1).children().eq(0).ok(function () {
            if (typeof okCallback === 'function') {
                okCallback();
            }
            TGO.allFocus = TGO.beforeMessageFocusArr;
            TGO.querySelector(TGO.beforeMessageFocus).focus();
            TGO.querySelector(div).css("display", "none");
        });
        TGO.querySelector(div).children().eq(1).children().eq(1).ok(function () {
            if (typeof cancelCallback === 'function') {
                cancelCallback();
            }
            TGO.allFocus = TGO.beforeMessageFocusArr;
            TGO.querySelector(TGO.beforeMessageFocus).focus();
            TGO.querySelector(div).css("display", "none");
        });
        TGO.allFocus = TGO.querySelector(div).children().eq(1).children();
        TGO.querySelector(div).children().eq(1).children().eq(1).focus();
        event.preventDefault();
    }
};
//设置当前焦点
tgo.setCurrentFocus = function (ele) {
    if(ele instanceof TGOFOCUS && ele[0] instanceof Element){
        tgo.currentFocus = ele[0]
    }else{
        throw new Error('设置焦点时类型错误')
    }
};
//设置所有焦点
tgo.setAllFocus = function (ele) {
    if(ele instanceof TGOFOCUS){
        tgo.allFocus = ele;
    }else{
        throw new Error('设置焦点时类型错误，必须为TGOFOCUS类型');
    }
};
var $ = tgo.querySelector;
