<script lang="ts">
    import PresentationPreview from "$lib/components/PresentationPreview.svelte";
    import { listPresentations } from "$lib/db/presentations.svelte";
    import type { Presentation } from "$lib/types/presentation";

    let isHovered = false;

    let presentations: Presentation[] = $state.raw([]);

    listPresentations().then((l) => (presentations = l));
</script>

<div
    class="h-full w-full bg-linear-to-br from-purple-50 via-white to-blue-50 font-sans text-slate-800"
>
    <!-- Navbar -->
    <nav
        class="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
    >
        <div class="flex items-center gap-2">
            <div
                class="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-600"
            ></div>
            <span class="text-xl font-bold tracking-tight">DesignFlow</span>
        </div>
        <div class="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="/templates" class="hover:text-purple-600 transition-colors"
                >Templates</a
            >
            <a href="/feature" class="hover:text-purple-600 transition-colors"
                >Features</a
            >
        </div>
    </nav>

    <header
        class="container mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center"
    >
        <h1
            class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
        >
            Design anything. <br />
            <span
                class="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"
            >
                Publish anywhere.
            </span>
        </h1>
        <p class="text-xl md:text-2xl text-slate-500 max-w-2xl mb-10">
            Crée de superbes designs, logos, posters et bien plus, le tout en
            quelques clics.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <a
                href="/home"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30"
                onmouseenter={() => (isHovered = true)}
                onmouseleave={() => (isHovered = false)}
            >
                Start Designing
            </a>
            <a
                href="/test"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30"
                onmouseenter={() => (isHovered = true)}
                onmouseleave={() => (isHovered = false)}
            >
                Test Toolbar
            </a>
            <button
                class="flex-1 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 text-lg px-8 py-4 rounded-xl font-bold transition-all"
            >
                Commencer un nouveau design
            </button>
            <a
                href="/templates"
                class="flex-1 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 text-lg px-8 py-4 rounded-xl font-bold transition-all"
            >
                Templates déjà crées
            </a>
        </div>
    </header>

    <section
        class="w-xl flex m-auto flex-wrap items-center justify-center my-8"
    >
        {#each presentations as p}
            <PresentationPreview presentation={p} />
        {/each}
    </section>

    <!-- Footer CTA -->
    <section class="bg-[#0f172a] text-white py-20 text-center">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-bold mb-6">Ready to create?</h2>
            <a
                href="/home"
                class="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105"
            >
                Commencer
            </a>
        </div>
    </section>
</div>

<style>
    /* Global Reset/Base styles if Tailwind isn't fully configured */
    :global(body) {
        margin: 0;
        padding: 0;
        font-family:
            "Inter",
            system-ui,
            -apple-system,
            sans-serif;
    }
</style>
