import { error } from "@sveltejs/kit";

export let ssr = false;

export async function load({ parent, params }) {
    let { presentation } = await parent();

    let slide = presentation.slides.find((p) => p.id === params.slideID);

    if (slide === undefined) {
        return error(404);
    }

    return { slide: params.slideID };
}
