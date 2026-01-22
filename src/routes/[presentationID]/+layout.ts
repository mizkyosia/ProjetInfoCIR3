import {
    getPresentation,
} from "$lib/db/presentations.svelte";
import { error } from "@sveltejs/kit";

export let ssr = false;

export async function load(event) {
    let pres = await getPresentation(event.params.presentationID);

    if (pres === null)  return error(404, "Presentation not found");

    return { presentation: pres };
}
