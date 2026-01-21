import { SvelteMap } from "svelte/reactivity";
import type { Presentation, Slide } from "./types/presentation";
import { savePresentation } from "./db/presentations.svelte";

export let imageUrlMap: SvelteMap<string, string> = new SvelteMap();

export type EditorStore = {
    presentation: Presentation;
    currentSlide: Slide | null;
    updateSlide: (updater: (slide: Slide) => any) => any;
};

export type EditorStoreValid = {
    presentation: Presentation;
    currentSlide: Slide;
    updateSlide: (updater: (slide: Slide) => any) => any;
};

export const editorStore: EditorStore = $state({
    presentation: null as unknown as Presentation,
    currentSlide: null,
    updateSlide: (updater) => {
        if (
            editorStore.currentSlide === null ||
            editorStore.presentation === null
        )
            return;
        updater(editorStore.currentSlide);
        savePresentation(editorStore.presentation);
        console.log($state.snapshot(editorStore.presentation), $state.snapshot(editorStore.currentSlide));
    },
});

export function validateStore(store: EditorStore): store is EditorStoreValid {
    return store.currentSlide !== null && store.presentation !== null;
}
