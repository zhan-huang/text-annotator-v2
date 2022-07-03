export type Location = {
  index: number,
  length: number
}
  
export type Tag = Location & {
  isCloseTag?: boolean,
  annotationIndex?: number
}
  
export type SearchOptions = {
  prefix?: string,
  postfix?: string,
  trim?: boolean,
  caseSensitive?: boolean
  offset?: number
}
  
export type AnnotateOptions = {
  tagName?: string,
  baseClassName?: string,
  classPattern?: string
}

export type TextAnnotatorInterface = {
  search: (searchText: string, searchOptions: SearchOptions) => number,
  searchAll: (searchText: string, searchOptions: SearchOptions) => number[],
  annotate: (annotationIndex: number, annotateOptions: AnnotateOptions) => string,
  annotateAll: (annotationIndexes: number[], annotateOptions: AnnotateOptions) => string,
  unannotate: (annotationIndex: number) => string,
  unannotateAll: (annotationIndexes: number[]) => string
}
