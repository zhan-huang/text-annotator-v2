"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class TextAnnotator {
  constructor(html) {
    this.html = html;

    const {
      text,
      tags
    } = this._stripHTMLTags(html);

    this.text = text; // [{ index, length, isCloseTag, annotationIndex* }]; ordered by index

    this.tags = tags; // [{ index, length }]; unordered

    this.annotations = [];
  }

  search(searchText, {
    prefix = '',
    postfix = '',
    trim = true,
    caseSensitive = false,
    offset = 0
  } = {}) {
    const {
      text,
      annotations
    } = this;
    let str = prefix + searchText + postfix;
    str = trim ? str.trim() : str;
    str = caseSensitive ? str : str.toLowerCase();
    const index = (caseSensitive ? text : text.toLowerCase()).indexOf(str, offset);
    const prefixLength = trim ? prefix.replace(/^\s+/, '').length : prefix.length;
    const postfixLength = trim ? postfix.replace(/\s+$/, '').length : postfix.length;
    return index === -1 ? -1 : annotations.push({
      index: index + prefixLength,
      length: str.substring(prefixLength, str.length - postfixLength).length
    }) - 1;
  }

  searchAll(searchText, options) {
    let offset = 0;
    const annotationIndexes = [];
    let annotationIndex = -1; // do not mutate param

    const newOptions = Object.assign({}, options);

    do {
      annotationIndex = this.search(searchText, newOptions);

      if (annotationIndex !== -1) {
        offset = this.annotations[annotationIndex].index + 1;
        newOptions.offset = offset;
        annotationIndexes.push(annotationIndex);
      }
    } while (annotationIndex !== -1);

    return annotationIndexes;
  }

  annotate(annotationIndex, {
    tagName = 'span',
    baseClassName = 'annotation',
    classPattern = 'annotation-'
  } = {}) {
    const {
      tags,
      annotations,
      _insert,
      _binaryInsert
    } = this;
    const annotation = annotations[annotationIndex]; // [start, end, offset]

    const annotationLocation = [annotation.index, annotation.index + annotation.length, 0]; // partition

    const annotatorLocations = [[...annotationLocation]];

    for (let i = 0; i < tags.length; i++) {
      const {
        index: tagIndex,
        length: tagLength
      } = tags[i];

      if (tagIndex <= annotationLocation[0]) {
        annotatorLocations[0][2] += tagLength;
      } else if (tagIndex < annotationLocation[1]) {
        const lastTagIndex = i === 0 ? 0 : tags[i - 1].index;
        const lastAnnotatorLocation = annotatorLocations[annotatorLocations.length - 1];

        if (tagIndex === lastTagIndex) {
          lastAnnotatorLocation[2] += tagLength;
        } else {
          const annotatorLocationEnd = lastAnnotatorLocation[1];
          lastAnnotatorLocation[1] = tagIndex;
          annotatorLocations.push([lastAnnotatorLocation[1], annotatorLocationEnd, lastAnnotatorLocation[2] + tagLength]);
        }
      } else {
        break;
      }
    } // insert annotator tags into tag list and html


    const annotatorOpenTag = `<${tagName} class="${baseClassName} ${classPattern}${annotationIndex}">`;
    const annotatorCloseTag = `</${tagName}>`;
    const annotatorOpenTagLength = annotatorOpenTag.length;
    const annotatorCloseTagLength = annotatorCloseTag.length;
    let locInc = 0;

    for (let i = 0; i < annotatorLocations.length; i++) {
      const annotatorLocation = annotatorLocations[i];

      _binaryInsert(tags, {
        index: annotatorLocation[0],
        length: annotatorOpenTagLength,
        isCloseTag: false,
        annotationIndex
      }, (a, b) => {
        return a.index <= b.index ? -1 : 1;
      });

      _binaryInsert(tags, {
        index: annotatorLocation[1],
        length: annotatorCloseTagLength,
        isCloseTag: true,
        annotationIndex
      }, (a, b) => a.index - b.index);

      this.html = _insert(this.html, annotatorOpenTag, annotatorLocation[0] + annotatorLocation[2] + locInc);
      this.html = _insert(this.html, annotatorCloseTag, annotatorLocation[1] + annotatorLocation[2] + locInc + annotatorOpenTagLength);
      locInc += annotatorOpenTagLength + annotatorCloseTagLength;
    }

    return this.html;
  }

  annotateAll(annotationIndexes, options) {
    annotationIndexes.forEach(annotationIndex => {
      this.annotate(annotationIndex, options);
    });
    return this.html;
  }

  unannotate(annotationIndex) {
    // annotatorIndexesInTags amd annotators have the same size
    const annotatorIndexesInTags = [];
    const annotators = this.tags.filter((tag, index) => {
      if (tag.annotationIndex === annotationIndex) {
        annotatorIndexesInTags.push(index);
      }

      return tag.annotationIndex === annotationIndex;
    });
    const otherTags = this.tags.filter(tag => tag.annotationIndex !== annotationIndex); // find index difference

    for (let i = 0; i < annotators.length; i++) {
      const annotator = annotators[i];
      let indexInc = 0;

      for (let j = 0; j < otherTags.length; j++) {
        const otherTag = otherTags[j];

        if (annotator.index < otherTag.index) {
          break;
        } else if (annotator.index > otherTag.index) {
          indexInc += otherTag.length;
        } else {
          if (otherTag.annotationIndex === undefined) {
            if (!annotator.isCloseTag) {
              indexInc += otherTag.length;
            }
          } else {
            if (annotator.annotationIndex < otherTag.annotationIndex) {
              if (otherTag.isCloseTag) {
                indexInc += otherTag.length;
              }
            } else {
              if (!annotator.isCloseTag) {
                indexInc += otherTag.length;
              }
            }
          }
        }
      } // remove annotators one by one


      this.html = this.html.slice(0, annotator.index + indexInc) + this.html.slice(annotator.index + indexInc + annotator.length);
      this.tags.splice(annotatorIndexesInTags[i] - i, 1);
    }

    return this.html;
  }

  unannotateAll(annotationIndexes) {
    annotationIndexes.forEach(annotationIndex => {
      this.unannotate(annotationIndex);
    });
    return this.html;
  } // pure function


  _stripHTMLTags(html) {
    let text = html;
    const tags = [];
    let tag;
    const tagRegEx = /<[^>]+>/;

    while (tag = text.match(tagRegEx)) {
      text = text.replace(tag, '');
      tags.push({
        index: tag.index,
        length: tag[0].length,
        isCloseTag: tag[0].startsWith('</')
      });
    }

    return {
      text,
      tags
    };
  } // pure function


  _insert(str1, str2, index) {
    return str1.slice(0, index) + str2 + str1.slice(index);
  } // pure function


  _binaryInsert(arr, val, comparator) {
    if (arr.length === 0 || comparator(arr[0], val) >= 0) {
      arr.splice(0, 0, val);
      return arr;
    } else if (arr.length > 0 && comparator(arr[arr.length - 1], val) <= 0) {
      arr.splice(arr.length, 0, val);
      return arr;
    }

    let left = 0,
        right = arr.length;
    let leftLast = 0,
        rightLast = right;

    while (left < right) {
      const inPos = Math.floor((right + left) / 2);
      const compared = comparator(arr[inPos], val);

      if (compared < 0) {
        left = inPos;
      } else if (compared > 0) {
        right = inPos;
      } else {
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
  }

}

var _default = TextAnnotator;
exports.default = _default;