// src/lib/types/presentation.ts
export type Presentation = {
    id: string;
    title: string;
    slides: Slide[];
    createdAt: number;
    updatedAt: number;
};

export type Slide = {
    id: string;
    width: number;
    height: number;
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
    shape: ShapeElement;
    button: ButtonElement;
    chart: ChartElement;
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
    opacity: number;
};

export type TextElement = BaseElement & {
    type: "text";
    text: string;
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

export type ButtonElement = BaseElement & {
    type: "button";
    slideId: string;
};

export type ShapeType =
    | "rectangle"
    | "circle"
    | "triangle"
    | "star"
    | "bubble"
    | "heart"
    | "arrow";

export type ShapeElement = BaseElement & {
    type: "shape";
    shapeType: ShapeType;
};

export type ChartRecord = {
    label: string;
    valeurs: number[];
    couleur: string;
};

export type PieChart = {
    label: string;
}

export type Serie = {
    label: string;
    valeurs: number[];
    couleur: string;
};

export type ChartElement = BaseElement & {
    type: "chart";
    chartType: "bar" | "line" | "pie";
    data: Serie[];
};

export type ElementProps<T extends Element> = { data: T };

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
        fillColor: "#ccccff",
        borderColor: "#8888ff",
        borderRadius: 0,
        borderStyle: "solid",
        borderThickness: 2,
        opacity: 1,
    };

    // Define defaults for each type
    const defaults: {
        [K in keyof ElementMap]: Omit<
            Omit<ElementMap[K], "type">,
            keyof BaseElement
        >;
    } = {
        text: { text: "" },
        image: { assetId: "" },
        table: { table: [["Lorem", "Ipsum"]] },
        quizz: {
            question: "Quelle est la couleur du cheval blanc de Henri IV ?",
            options: ["Blanc", "Gris", "Noir"],
            correctAnswerIndex: 0,
        },
        shape: {
            shapeType: "rectangle",
        },
        button: {
            slideId: "",
        },
        chart: {
            chartType: "bar",
            data: [
                {
                    label: "Série 1",
                    valeurs: [10, 20, 30],
                    couleur: "#ff6384",
                },
                {
                    label: "Série 2",
                    valeurs: [15, 25, 35],
                    couleur: "#36a2eb", 
                }
            ],
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
