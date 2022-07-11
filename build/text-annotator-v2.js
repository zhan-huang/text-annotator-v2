"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var TextAnnotator = /** @class */ (function () {
    function TextAnnotator(html) {
        this.html = '';
        this.text = '';
        this.tags = [];
        this.annotations = [];
        this.html = html;
        var _a = this._stripHTMLTags(html), text = _a.text, tags = _a.tags;
        this.text = text;
        this.tags = tags;
    }
    TextAnnotator.prototype.search = function (searchText, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.prefix, prefix = _c === void 0 ? '' : _c, _d = _b.postfix, postfix = _d === void 0 ? '' : _d, _e = _b.trim, trim = _e === void 0 ? true : _e, _f = _b.caseSensitive, caseSensitive = _f === void 0 ? false : _f, _g = _b.offset, offset = _g === void 0 ? 0 : _g;
        var _h = this, text = _h.text, annotations = _h.annotations;
        var str = prefix + searchText + postfix;
        str = trim ? str.trim() : str;
        str = caseSensitive ? str : str.toLowerCase();
        var index = (caseSensitive ? text : text.toLowerCase()).indexOf(str, offset);
        var prefixLength = trim
            ? prefix.replace(/^\s+/, '').length
            : prefix.length;
        var postfixLength = trim
            ? postfix.replace(/\s+$/, '').length
            : postfix.length;
        return index === -1
            ? -1
            : annotations.push({
                index: index + prefixLength,
                length: str.substring(prefixLength, str.length - postfixLength)
                    .length,
            }) - 1;
    };
    TextAnnotator.prototype.searchAll = function (searchText, options) {
        var offset = 0;
        var annotationIndexes = [];
        var annotationIndex = -1;
        // do not mutate param
        var newOptions = Object.assign({}, options);
        do {
            annotationIndex = this.search(searchText, newOptions);
            if (annotationIndex !== -1) {
                offset = this.annotations[annotationIndex].index + 1;
                newOptions.offset = offset;
                annotationIndexes.push(annotationIndex);
            }
        } while (annotationIndex !== -1);
        return annotationIndexes;
    };
    TextAnnotator.prototype.annotate = function (annotationIndex, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.tagName, tagName = _c === void 0 ? 'span' : _c, _d = _b.baseClassName, baseClassName = _d === void 0 ? 'annotation' : _d, _e = _b.classPattern, classPattern = _e === void 0 ? 'annotation-' : _e;
        var _f = this, tags = _f.tags, annotations = _f.annotations, _insert = _f._insert, _binaryInsert = _f._binaryInsert;
        var annotation = annotations[annotationIndex];
        // [start, end, offset]
        var annotationLocation = [
            annotation.index,
            annotation.index + annotation.length,
            0,
        ];
        // partition
        var annotatorLocations = [__spreadArray([], annotationLocation, true)];
        for (var i = 0; i < tags.length; i++) {
            var _g = tags[i], tagIndex = _g.index, tagLength = _g.length;
            if (tagIndex <= annotationLocation[0]) {
                annotatorLocations[0][2] += tagLength;
            }
            else if (tagIndex < annotationLocation[1]) {
                var lastTagIndex = i === 0 ? 0 : tags[i - 1].index;
                var lastAnnotatorLocation = annotatorLocations[annotatorLocations.length - 1];
                if (tagIndex === lastTagIndex) {
                    lastAnnotatorLocation[2] += tagLength;
                }
                else {
                    var annotatorLocationEnd = lastAnnotatorLocation[1];
                    lastAnnotatorLocation[1] = tagIndex;
                    annotatorLocations.push([
                        lastAnnotatorLocation[1],
                        annotatorLocationEnd,
                        lastAnnotatorLocation[2] + tagLength,
                    ]);
                }
            }
            else {
                break;
            }
        }
        // insert annotator tags into tag list and html
        var annotatorOpenTag = "<".concat(tagName, " class=\"").concat(baseClassName, " ").concat(classPattern).concat(annotationIndex, "\">");
        var annotatorCloseTag = "</".concat(tagName, ">");
        var annotatorOpenTagLength = annotatorOpenTag.length;
        var annotatorCloseTagLength = annotatorCloseTag.length;
        var locInc = 0;
        for (var i = 0; i < annotatorLocations.length; i++) {
            var annotatorLocation = annotatorLocations[i];
            _binaryInsert(tags, {
                index: annotatorLocation[0],
                length: annotatorOpenTagLength,
                isCloseTag: false,
                annotationIndex: annotationIndex,
            }, function (a, b) {
                return a.index <= b.index ? -1 : 1;
            });
            _binaryInsert(tags, {
                index: annotatorLocation[1],
                length: annotatorCloseTagLength,
                isCloseTag: true,
                annotationIndex: annotationIndex,
            }, function (a, b) { return a.index - b.index; });
            this.html = _insert(this.html, annotatorOpenTag, annotatorLocation[0] + annotatorLocation[2] + locInc);
            this.html = _insert(this.html, annotatorCloseTag, annotatorLocation[1] +
                annotatorLocation[2] +
                locInc +
                annotatorOpenTagLength);
            locInc += annotatorOpenTagLength + annotatorCloseTagLength;
        }
        return this.html;
    };
    TextAnnotator.prototype.annotateAll = function (annotationIndexes, options) {
        var _this = this;
        annotationIndexes.forEach(function (annotationIndex) {
            _this.annotate(annotationIndex, options);
        });
        return this.html;
    };
    TextAnnotator.prototype.unannotate = function (annotationIndex) {
        // annotatorIndexesInTags amd annotators have the same size
        var annotatorIndexesInTags = [];
        var annotators = this.tags.filter(function (tag, index) {
            if (tag.annotationIndex === annotationIndex) {
                annotatorIndexesInTags.push(index);
            }
            return tag.annotationIndex === annotationIndex;
        });
        var otherTags = this.tags.filter(function (tag) { return tag.annotationIndex !== annotationIndex; });
        // find index difference
        for (var i = 0; i < annotators.length; i++) {
            var annotator = annotators[i];
            var indexInc = 0;
            for (var j = 0; j < otherTags.length; j++) {
                var otherTag = otherTags[j];
                if (annotator.index < otherTag.index) {
                    break;
                }
                else if (annotator.index > otherTag.index) {
                    indexInc += otherTag.length;
                }
                else {
                    if (otherTag.annotationIndex === undefined) {
                        if (!annotator.isCloseTag) {
                            indexInc += otherTag.length;
                        }
                    }
                    else {
                        if (annotator.annotationIndex < otherTag.annotationIndex) {
                            if (otherTag.isCloseTag) {
                                indexInc += otherTag.length;
                            }
                        }
                        else {
                            if (!annotator.isCloseTag) {
                                indexInc += otherTag.length;
                            }
                        }
                    }
                }
            }
            // remove annotators one by one
            this.html =
                this.html.slice(0, annotator.index + indexInc) +
                    this.html.slice(annotator.index + indexInc + annotator.length);
            this.tags.splice(annotatorIndexesInTags[i] - i, 1);
        }
        return this.html;
    };
    TextAnnotator.prototype.unannotateAll = function (annotationIndexes) {
        var _this = this;
        annotationIndexes.forEach(function (annotationIndex) {
            _this.unannotate(annotationIndex);
        });
        return this.html;
    };
    // pure function
    TextAnnotator.prototype._stripHTMLTags = function (html) {
        var text = html;
        var tags = [];
        // elaborate it later
        var tag;
        var tagRegEx = /<[^>]+>/;
        while ((tag = text.match(tagRegEx))) {
            text = text.replace(tag[0], '');
            tags.push({
                index: tag.index,
                length: tag[0].length,
                isCloseTag: tag[0].startsWith('</'),
            });
        }
        return { text: text, tags: tags };
    };
    // pure function
    TextAnnotator.prototype._insert = function (str1, str2, index) {
        return str1.slice(0, index) + str2 + str1.slice(index);
    };
    // pure function
    TextAnnotator.prototype._binaryInsert = function (arr, val, comparator) {
        if (arr.length === 0 || comparator(arr[0], val) >= 0) {
            arr.splice(0, 0, val);
            return arr;
        }
        else if (arr.length > 0 && comparator(arr[arr.length - 1], val) <= 0) {
            arr.splice(arr.length, 0, val);
            return arr;
        }
        var left = 0, right = arr.length;
        var leftLast = 0, rightLast = right;
        while (left < right) {
            var inPos = Math.floor((right + left) / 2);
            var compared = comparator(arr[inPos], val);
            if (compared < 0) {
                left = inPos;
            }
            else if (compared > 0) {
                right = inPos;
            }
            else {
                right = inPos;
                left = inPos;
            }
            if (leftLast === left && rightLast === right) {
                break;
            }
            leftLast = left;
            rightLast = right;
        }
        arr.splice(right, 0, val);
        return arr;
    };
    return TextAnnotator;
}());
exports.default = TextAnnotator;
