# text-annotator-v2
A JavaScript library for annotating plain text in the HTML<br />
The annotation process is:

1. **Search**: Search for a piece of plain text in the HTML; if finding it, store its location identified by an index and then return the index for later annotation
2. **Annotate**: Annotate the found text given its index<br />
It can be seen that in order to annotate a piece of text, two steps, **search** and **annotate**, are taken. The idea of decomposing the annotation process into the two steps is to allow more flexibility, e.g., the user can search for all pieces of text first, and then annotate them later when required (e.g., when clicking a button). <br />

*text-annotator-v2* can be used in the browser or the Node.js server.<br />
*text-annotator-v2* evolved from [text-annotator](https://www.npmjs.com/package/text-annotator). See [Comparing text-annotator-v2 and text-annotator](#comparing-text-annotator-v2-and-text-annotator).

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
<div id="content">
  <p><i>JavaScript</i> is the <b>world's most popular programming language</b>.</p>
  <p><i>JavaScript</i> is the programming language of the Web. JavaScript is easy to learn.</p>
</div>
*/

// create an instance of TextAnnotator by passing the html to be annotated
var annotator = new TextAnnotator(document.getElementById('content').innerHTML)

// search for text "JavaScript is the programming language of the Web." within the HTML
var annotationIndex = annotator.search('JavaScript is the programming language of the Web.')
// annotate the text if finding it
if (annotationIndex !== -1) {
  document.getElementById('content').innerHTML = annotator.annotate(annotationIndex)
/*
<div id="content">
  <p><i>JavaScript</i> is the <b>world's most popular programming language</b>.</p>
  <p><i><span class="annotation annotation-0">JavaScript</span></i><span class="annotation annotation-0"> is the programming language of the Web.</span> JavaScript is easy to learn.</p>
</div>
*/
}

// search for all occurances of "JavaScript" in the HTML
var annotationIndexes = annotator.searchAll('JavaScript')
// annotate all the found occurances of 'Javascript' given their indexes
if (annotationIndexes.length) {
  document.getElementById('content').innerHTML = annotator.annotateAll(annotationIndexes)
/*
<div id="content">
  <p><i><span class="annotation annotation-1">JavaScript</span></i> is the <b>world's most popular programming language</b>.</p>
  <p><i><span class="annotation annotation-0"><span class="annotation annotation-2">JavaScript</span></span></i><span class="annotation annotation-0"> is the programming language of the Web.</span> <span class="annotation annotation-3">JavaScript</span> is easy to learn.</p>
</div>
*/
}

// unannotate all the previously annotated text
document.getElementById('content').innerHTML = annotator.unannotate(annotationIndex)
document.getElementById('content').innerHTML = annotator.unannotateAll(annotationIndexes)
/*
<div id="content">
  <p><i>JavaScript</i> is the <b>world's most popular programming language</b>.</p>
  <p><i>JavaScript</i> is the programming language of the Web. JavaScript is easy to learn.</p>
</div>
*/
```

## Constructor
#### new TextAnnotator(html)
| Param | Type | Description |
| ---- | ---- | ---- |
| html | string | The HTML string within which a piece of text can be annotated |

## Search APIs
#### search(str, *options = {trim, caseSensitive, prefix, postfix}*)
#### searchAll(str, *options = {trim, caseSensitive, prefix, postfix}*)
| Prop | Type | Description |
| ---- | ---- | ---- |
| trim | boolean | Whether to trim the piece of text to be annotated. Default is *true*. |
| caseSensitive | boolean | Whether to consider case in search. Default is *false*. |
| prefix | string | A string BEFORE the piece of text to be annotated. Default is ''. |
| postfix | string | A string AFTER the piece of text to be annotated. Default is ''. |

## Annotate APIs
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
1. *text-annotator* can only use a single pair of annotation tags to annotate a piece of text, while *text-annotator-v2* can use any number of pairs of annotation tags depending on how "complex" the text is presented using HTML tags. For instance, given the following html:
```
<div>This is an <i>apple</i></div>
```
If we want to annotate *an apple*, *text-annotator* will only use a single annotation tag pair
```
<div>This is <...>an <i>apple</i></...></div>
```
In contrast, *text-annotator-v2* will use two annotation tag pairs
```
<div>This is <...>an </...><i><...>apple</...></i></div>
```
It seems *text-annotator* can provide a simpler solution in this case. However, *text-annotator-v2* aims to give a correct solution in all cases. For instance, if *an apple* is surrounding by a pair of block tags, such as *p*, instead of *i*, annotating *an apple* using a single non-block tag pair such as *span* or *mark* will break the html structure. Another example where more than one pair of annotatation tags is needed for annotation is:
```
<p>These are apples. We like eating them.</p><p>Today we ate ten!</p>
```
If we want to lightlight *We like eating them.Today we ate then!*, we have to use 2 pairs of annotation tags as follows:
```
<p>These are apples. <...>We like eating them.</...></p><p><...>Today we ate ten!</...></p>
```

2. *text-annotator-v2* offers a "smaller" solution: the compressed file is only 3.66kb. In contrast, the the compressed file of *text-annotator* is 90kb.

## Contact
[Zhan Huang](mailto:z2hm@outlook.com "Zhan Huang")
