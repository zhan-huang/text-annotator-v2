import TextAnnotator from '../dist/text-annotator-v2'

const html =
  '"I am <b><i>Zhan Huang</i></b>, a <b>frontend developer</b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'

test('annotate text without surrounding/inside tags', () => {
  const textAnnotator = new TextAnnotator(html)
  const searchText = 'EMBL-EBI'
  const annotatedHtml = textAnnotator.annotate(textAnnotator.search(searchText))
  expect(annotatedHtml).toBe(
    '"I am <b><i>Zhan Huang</i></b>, a <b>frontend developer</b> in <span class="annotation annotation-0">EMBL-EBI</span>. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate text with surrounding tags', () => {
  const textAnnotator = new TextAnnotator(html)
  const searchText = 'frontend developer'
  const annotatedHtml = textAnnotator.annotate(textAnnotator.search(searchText))
  expect(annotatedHtml).toBe(
    '"I am <b><i>Zhan Huang</i></b>, a <b><span class="annotation annotation-0">frontend developer</span></b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate text with inside open tag', () => {
  const textAnnotator = new TextAnnotator(html)
  const searchText = 'a frontend developer'
  const annotatedHtml = textAnnotator.annotate(textAnnotator.search(searchText))
  expect(annotatedHtml).toBe(
    '"I am <b><i>Zhan Huang</i></b>, <span class="annotation annotation-0">a </span><b><span class="annotation annotation-0">frontend developer</span></b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate text with inside close tag', () => {
  const textAnnotator = new TextAnnotator(html)
  const searchText = 'frontend developer in EMBL-EBI'
  const annotatedHtml = textAnnotator.annotate(textAnnotator.search(searchText))
  expect(annotatedHtml).toBe(
    '"I am <b><i>Zhan Huang</i></b>, a <b><span class="annotation annotation-0">frontend developer</span></b><span class="annotation annotation-0"> in EMBL-EBI</span>. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate text with multiple tags surrounding/inside', () => {
  const textAnnotator = new TextAnnotator(html)
  const searchText = 'Zhan Huang, a frontend developer in EMBL-EBI'
  const annotatedHtml = textAnnotator.annotate(textAnnotator.search(searchText))
  expect(annotatedHtml).toBe(
    '"I am <b><i><span class="annotation annotation-0">Zhan Huang</span></i></b><span class="annotation annotation-0">, a </span><b><span class="annotation annotation-0">frontend developer</span></b><span class="annotation annotation-0"> in EMBL-EBI</span>. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate all occurrences of the text', () => {
  const textAnnotator = new TextAnnotator(html)
  const searchText = 'Zhan Huang'
  const annotationIndexes = textAnnotator.searchAll(searchText)
  const annotatedHtml = textAnnotator.annotateAll(annotationIndexes)
  expect(annotatedHtml).toBe(
    '"I am <b><i><span class="annotation annotation-0">Zhan Huang</span></i></b>, a <b>frontend developer</b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - <span class="annotation annotation-1">Zhan HUANG</span>'
  )
})

test('annotate multiple pieces of text', () => {
  const textAnnotator = new TextAnnotator(html)
  textAnnotator.annotate(textAnnotator.search('Zhan Huang'))
  textAnnotator.annotate(textAnnotator.search('food and sports'))
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('a frontend developer in EMBL-EBI')
  )
  expect(annotatedHtml).toBe(
    '"I am <b><i><span class="annotation annotation-0">Zhan Huang</span></i></b>, <span class="annotation annotation-2">a </span><b><span class="annotation annotation-2">frontend developer</span></b><span class="annotation annotation-2"> in EMBL-EBI</span>. I like <span class="annotation annotation-1">food and sports</span>. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate text with multiple tags inside/surrounding', () => {
  const textAnnotator = new TextAnnotator(
    '<p><span>I am <b>Zhan Huang</b></span></p>. <p><i>I like apples.<i></p>'
  )
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('I am Zhan Huang. I like')
  )
  expect(annotatedHtml).toBe(
    '<p><span><span class="annotation annotation-0">I am </span><b><span class="annotation annotation-0">Zhan Huang</span></b></span></p><span class="annotation annotation-0">. </span><p><i><span class="annotation annotation-0">I like</span> apples.<i></p>'
  )
})

test('annotate text with prefix/postfix', () => {
  const textAnnotator = new TextAnnotator(html)
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('Zhan Huang', { prefix: '- ', postfix: '' })
  )
  expect(annotatedHtml).toBe(
    '"I am <b><i>Zhan Huang</i></b>, a <b>frontend developer</b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - <span class="annotation annotation-0">Zhan HUANG</span>'
  )
})

test('annotate text with trimming', () => {
  const textAnnotator = new TextAnnotator(html)
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('Zhan Huang', { prefix: ' - ', postfix: '' })
  )
  expect(annotatedHtml).toBe(
    '"I am <b><i>Zhan Huang</i></b>, a <b>frontend developer</b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - <span class="annotation annotation-0">Zhan HUANG</span>'
  )
})

test('annotate text with case sensitive', () => {
  const textAnnotator = new TextAnnotator(html)
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('Zhan HUANG', { caseSensitive: true })
  )
  expect(annotatedHtml).toBe(
    '"I am <b><i>Zhan Huang</i></b>, a <b>frontend developer</b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - <span class="annotation annotation-0">Zhan HUANG</span>'
  )
})

test('unannotate the text', () => {
  const textAnnotator = new TextAnnotator(html)
  const searchText = 'Zhan Huang, a frontend developer in EMBL-EBI'
  const annotationIndex = textAnnotator.search(searchText)
  const annotatedHtml = textAnnotator.annotate(annotationIndex)
  expect(annotatedHtml).toBe(
    '"I am <b><i><span class="annotation annotation-0">Zhan Huang</span></i></b><span class="annotation annotation-0">, a </span><b><span class="annotation annotation-0">frontend developer</span></b><span class="annotation annotation-0"> in EMBL-EBI</span>. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
  const unannotatedHtml = textAnnotator.unannotate(annotationIndex)
  expect(unannotatedHtml).toBe(html)
})

test('unnotatate the text with tags inside', () => {
  const textAnnotator = new TextAnnotator(html)
  textAnnotator.annotate(
    textAnnotator.search('Zhan Huang, a frontend developer in EMBL-EBI')
  )
  textAnnotator.annotate(textAnnotator.search('Zhan Huang'))
  const annotatedHtml = textAnnotator.unannotate(0)
  expect(annotatedHtml).toBe(
    '"I am <b><i><span class="annotation annotation-1">Zhan Huang</span></i></b>, a <b>frontend developer</b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate the text again after unannotating it', () => {
  const textAnnotator = new TextAnnotator(html)
  textAnnotator.annotate(textAnnotator.search('Zhan Huang'))
  textAnnotator.annotate(textAnnotator.search('food and sports'))
  textAnnotator.unannotateAll([0, 1])
  const annotatedHtml = textAnnotator.annotate(0)
  expect(annotatedHtml).toBe(
    '"I am <b><i><span class="annotation annotation-0">Zhan Huang</span></i></b>, a <b>frontend developer</b> in EMBL-EBI. I like food and sports. My favourite food is udon noodles." - Zhan HUANG'
  )
})

test('annotate document without html tags', () => {
  const textAnnotator = new TextAnnotator('I am Zhan Huang')
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search(' zhan huang ')
  )
  expect(annotatedHtml).toBe(
    'I am <span class="annotation annotation-0">Zhan Huang</span>'
  )
})

test('do not trim the search terms', () => {
  const textAnnotator = new TextAnnotator('I am Zhan Huang')
  const annotationIndex = textAnnotator.search(' zhan huang ', { trim: false })

  expect(annotationIndex).toBe(-1)
})

test('make the search case sensitive', () => {
  const textAnnotator = new TextAnnotator('I am Zhan Huang')
  const annotationIndex = textAnnotator.search('zhan huang', {
    caseSensitive: true,
  })

  expect(annotationIndex).toBe(-1)
})

test('add prefix and postfix of the search terms', () => {
  const textAnnotator = new TextAnnotator('I am Zhan Huang')
  const annotationIndex = textAnnotator.search('zhan huang', {
    prefix: 'am ',
    postfix: '.',
  })

  expect(annotationIndex).toBe(-1)
})

test('annotate using mark tags', () => {
  const textAnnotator = new TextAnnotator('I am Zhan Huang')
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('zhan huang'),
    { tagName: 'mark' }
  )
  expect(annotatedHtml).toBe(
    'I am <mark class="annotation annotation-0">Zhan Huang</mark>'
  )
})

test('annotate using a different base class name', () => {
  const textAnnotator = new TextAnnotator('I am Zhan Huang')
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('zhan huang'),
    { baseClassName: 'highlight' }
  )
  expect(annotatedHtml).toBe(
    'I am <span class="highlight annotation-0">Zhan Huang</span>'
  )
})

test('annotate using a different class pattern', () => {
  const textAnnotator = new TextAnnotator('I am Zhan Huang')
  const annotatedHtml = textAnnotator.annotate(
    textAnnotator.search('zhan huang'),
    { classPattern: 'highlight-' }
  )
  expect(annotatedHtml).toBe(
    'I am <span class="annotation highlight-0">Zhan Huang</span>'
  )
})
