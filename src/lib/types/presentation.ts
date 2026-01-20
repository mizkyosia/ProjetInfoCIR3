// src/lib/types/presentation.ts
export type Presentation = {
  id: string
  title: string
  width: number
  height: number
  slides: Slide[]
  createdAt: number
  updatedAt: number
}

export type Slide = {
  id: string
  background: {
    type: 'color' | 'image'
    value: string
  }
  elements: Element[]
}

export type Element =
  | TextElement
  | ImageElement
  | QuizzElement

export type BaseElement = {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  fillColor: string
  borderColor: string
  borderThickness: number
  borderRadius: number
  borderStyle: "solid" | "dotted" | "dashed",

}

export type TextElement = BaseElement & {
  type: 'text'
  text: string
  fontSize: number
  color: string
}

export type ImageElement = BaseElement & {
  type: 'image'
  assetId: string
}

export type QuizzElement = BaseElement & {
  type: 'quizz'
  options: string[]
  question: string
  correctAnswerIndex: number
}