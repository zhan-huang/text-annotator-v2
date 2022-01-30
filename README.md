# text-annotator-v2
A JavaScript library for annotating plain text in the HTML<br />
The annotation process is:

1. **Search**: Search for a piece of plain text in the HTML; if finding it, store its location identified by an index and then return the index for later annotation
2. **Annotate**: Annotate the found text given its index<br />
It can be seen that in order to annotate a piece of text, two steps, **search** and **annotate**, are taken. The idea of decomposing the annotation process into the two steps is to allow more flexibility, e.g., the user can search for all pieces of text first, and then annotate (some of) them later when required (e.g., when clicking a button). <br />

*text-annotator-v2* can be used in the browser or the Node.js server.<br />
*text-annotator-v2* evolved from [text-annotator](https://github.com/zhan-huang/text-annotator). See *Comparing text-annotator-v2 and text-annotator* at the end of this document.

## Import
### install it via npm
`npm install --save text-annotator-v2`
```javascript
import TextAnnotator from 'text-annotator-v2'
```
### include it into the head tag
```
<script src="public/js/text-annotator-v2.min.js"></script>
```

## An example of the usage
```javascript
/*
  below is the HTML
  <div id="content"><p><i>JavaScript</i> is the <b>world's most popular programming language</b>.</p><p><i>JavaScript</i> is the programming language of the Web. JavaScript is easy to learn.</p></div>
*/

// create an instance of TextAnnotator by passing the html to be annotated
var annotator = new TextAnnotator(document.getElementById('content').innerHTML)

// search for text "JavaScript is the world's most popular programming language.JavaScript is the programming language of the Web." within the HTML
var annotationIndex = annotator.search('JavaScript is the world\'s most popular programming language.JavaScript is the programming language of the Web.')
// annotate the text if finding it
if (annotationIndex !== -1) {
  document.getElementById('content').innerHTML = annotator.annotate(annotationIndex)
}

// search for all occurances of "JavaScript" in the HTML
var annotationIndexes = annotator.searchAll('JavaScript')
// annotate all the found occurances of 'Javascript' given their indexes
if (annotationIndexes.length) {
  document.getElementById('content').innerHTML = annotator.annotateAll(annotationIndexes) 
}

// unannotate all the previously annotated text
document.getElementById('content').innerHTML = annotator.unannotate(annotationIndex)
document.getElementById('content').innerHTML = annotator.unannotateAll(annotationIndexes)
```

## Constructor parameter
#### new TextAnnotator(html)
| Param | Type | Description |
| ---- | ---- | ---- |
| html | string | The HTML string within which a piece of text can be annotated |

## Search options
#### search(str, *options = {trim, caseSensitive, prefix, postfix}*)
#### searchAll(str, *options = {trim, caseSensitive, prefix, postfix}*)
| Prop | Type | Description |
| ---- | ---- | ---- |
| trim | boolean | Whether to trim the piece of text to be annotated. Default is *true*. |
| caseSensitive | boolean | Whether to consider case in search. Default is *false*. |
| prefix | string | A string BEFORE the piece of text to be annotated. Default is ''. |
| postfix | string | A string AFTER the piece of text to be annotated. Default is ''. |

## Annotate options
#### annotate(annotationIndex, *options = {tagName, baseClassName, classPattern}*)
#### annotationAll(annotationIndexes, *options = {tagName, baseClassName, classPattern}*)
#### unannotate(annotationIndex)
#### unannotateAll(annotationIndexes)
| Prop | Type | Description |
| ---- | ---- | ---- |
| tagName | string | The name of the annotation tag. Default is *span* so that the tag is *<span ...>*. |
| baseClassName | string | The base class name of the annotation tag. Default is *annotation* so that the tag is *<span class="annotation" ...>*. |
| classPattern | string | The pattern of the class used as the ID of the annotation. Default is *annotation-* so that the tag is *<span class="annotation annotation-[annotationIndex]" ...>*. |

## Comparing text-annotator-v2 and text-annotator
TBC

## Contact
[Zhan Huang](mailto:z2hm@outlook.com "Zhan Huang")
