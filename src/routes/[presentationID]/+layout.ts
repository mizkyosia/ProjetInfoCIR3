import {
    getPresentation,
    newSlide,
    savePresentation,
} from "$lib/db/presentations.svelte";
import { editorStore } from "$lib/state.svelte.js";

export let ssr = false;

export async function load(event) {
    console.log("test");

    let pres = await getPresentation(event.params.presentationID);

    if (pres === null) {
        pres = {
            id: event.params.presentationID,
            title: "New presentation",
            slides: [newSlide()],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await savePresentation(pres);
    }


    return { presentation: pres };
}
