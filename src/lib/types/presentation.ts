// src/lib/types/presentation.ts
export type Presentation = {
    id: string;
    title: string;
    width: number;
    height: number;
    slides: Slide[];
    createdAt: number;
    updatedAt: number;
};

export type Slide = {
    id: string;
    background: {
        type: "color" | "image";
        value: string;
    };
    elements: Element[];
};

export type Element = ElementMap[keyof ElementMap];

type ElementMap = {
    text: TextElement;
    image: ImageElement;
    quizz: QuizzElement;
    table: TableElement;
};

export type BaseElement = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    fillColor: string;
    borderColor: string;
    borderThickness: number;
    borderRadius: number;
    borderStyle: "solid" | "dotted" | "dashed";
};

export type TextElement = BaseElement & {
    type: "text";
    text: string;
    fontSize: number;
    color: string;
};

export type ImageElement = BaseElement & {
    type: "image";
    assetId: string;
};

export type QuizzElement = BaseElement & {
    type: "quizz";
    options: string[];
    question: string;
    correctAnswerIndex: number;
};

export type TableElement = BaseElement & {
    type: "table";
    table: string[][];
};

export function createPresentationElement<T extends keyof ElementMap>(
    type: T,
    parameters?: Partial<Omit<ElementMap[T], "type" | "id">>,
): ElementMap[T] {
    const baseDefault: Omit<BaseElement, "id"> = {
        x: 0,
        y: 0,
        width: 250,
        height: 250,
        rotation: 0,
        zIndex: 0,
        fillColor: "",
        borderColor: "",
        borderRadius: 0,
        borderStyle: "solid",
        borderThickness: 0,
    };

    // Define defaults for each type
    const defaults: {
        [K in keyof ElementMap]: Omit<
            Omit<ElementMap[K], "type">,
            keyof BaseElement
        >;
    } = {
        text: { text: "", fontSize: 16, color: "#000000" },
        image: { assetId: "" },
        table: { table: [["Lorem", "Ipsum"]] },
        quizz: {
            question: "Quelle est la couleur du cheval blanc de Henri IV ?",
            options: ["Blanc", "Gris", "Noir"],
            correctAnswerIndex: 0,
        },
    };

    // Merge defaults with provided parameters
    return {
        type,
        ...baseDefault,
        ...defaults[type],
        ...parameters,
        id: crypto.randomUUID(),
    } as ElementMap[T];
}
