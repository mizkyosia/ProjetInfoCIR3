import { redirect } from "@sveltejs/kit";

export async function load(ev) {
    const p = await ev.parent();

    return redirect(302, `${p.presentation.id}/${p.presentation.slides[0].id}`);
}
