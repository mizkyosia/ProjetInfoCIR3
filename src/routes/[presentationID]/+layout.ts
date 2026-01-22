import {
    getPresentation,
    newSlide,
    savePresentation,
} from "$lib/db/presentations.svelte";

export let ssr = false;

export async function load(event) {
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
