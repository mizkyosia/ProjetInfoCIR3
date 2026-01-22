import { SvelteMap } from "svelte/reactivity";
import type {
    BaseElement,
    Element,
    Presentation,
    Slide,
} from "./types/presentation";
import { savePresentation } from "./db/presentations.svelte";
import type { Snippet } from "svelte";

export let imageUrlMap: SvelteMap<string, string> = new SvelteMap();

export type EditorStore = {
    presentation: Presentation;
    currentSlide: Slide | null;
    viewing: boolean;
    updateSlide: (updater: (slide: Slide) => any) => any;
};

export const editorStore: EditorStore = $state({
    presentation: null as unknown as Presentation,
    currentSlide: null,
    viewing: false,
    updateSlide: (updater) => {
        if (
            editorStore.currentSlide === null ||
            editorStore.presentation === null
        )
            return;
        updater(editorStore.currentSlide);
        savePresentation(editorStore.presentation);
    },
});

export const selectedElementStore: {
    element: Element | null;
    snippet: Snippet | null;
} = $state({
    element: null,
    snippet: null,
});
