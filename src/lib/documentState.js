import { writable, derived } from "svelte/store";

// Nom et dimensions du document
export const documentName = writable("Sans nom");
export const documentWidth = writable(1920);
export const documentHeight = writable(1080);

// Store dérivé pour le titre complet
export const fullDocumentTitle = derived(
    [documentName, documentWidth, documentHeight],
    ([$documentName, $documentWidth, $documentHeight]) =>
        `${$documentName} ${$documentWidth}x${$documentHeight}`
);
