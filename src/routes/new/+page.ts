import { newSlide, savePresentation } from "$lib/db/presentations.svelte";
import { redirect } from "@sveltejs/kit";

export async function load(event) {
    const pres = {
        id: crypto.randomUUID(),
        title: "New presentation",
        slides: [newSlide()],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await savePresentation(pres);

    return redirect(307, "/" + pres.id);
}