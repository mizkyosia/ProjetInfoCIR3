<script lang="ts">
    import PresentationPreview from "$lib/components/PresentationPreview.svelte";
    import { listPresentations } from "$lib/db/presentations";
    import type { Presentation } from "$lib/types/presentation";

    let isHovered = false;

    let presentations: Presentation[] = $state.raw([]);

    listPresentations().then((l) => (presentations = l));
</script>

<div
    class="h-full w-full bg-gradient-to-br from-purple-50 via-white to-blue-50 font-sans text-slate-800"
>
    <!-- Navbar -->
    <nav
        class="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
    >
        <div class="flex items-center gap-2">
            <div
                class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600"
            ></div>
            <span class="text-xl font-bold tracking-tight">DesignFlow</span>
        </div>
        <div class="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#templates" class="hover:text-purple-600 transition-colors"
                >Templates</a
            >
            <a href="#features" class="hover:text-purple-600 transition-colors"
                >Features</a
            >
            <a href="#pricing" class="hover:text-purple-600 transition-colors"
                >Pricing</a
            >
        </div>
        <div class="flex gap-4">
            <button class="text-slate-600 hover:text-slate-900 font-medium"
                >Log in</button
            >
            <button
                class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
                Sign u for free
            </button>
        </div>
    </nav>

    <!-- Hero Section -->
    <header
        class="container mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center"
    >
        <h1
            class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
        >
            Design anything. <br />
            <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            >
                Publish anywhere.
            </span>
        </h1>
        <p class="text-xl md:text-2xl text-slate-500 max-w-2xl mb-10">
            Create stunning presentations, posters, logos and more. No design
            skills needed.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <a
                href="/home"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30"
                on:mouseenter={() => (isHovered = true)}
                on:mouseleave={() => (isHovered = false)}
            >
                Start Designing
            </a>
            <button
                class="flex-1 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 text-lg px-8 py-4 rounded-xl font-bold transition-all"
            >
                Browse Templates
            </button>
        </div>
    </header>

    <section class="w-xl flex m-auto flex-wrap items-center justify-center my-8">
        {#each presentations as p}
            <PresentationPreview presentation={p} />
        {/each}
    </section>

    <!-- Creative Grid Section -->
    <section class="container mx-auto px-6 pb-24">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            <!-- Card 1 Removed -->

            <!-- Card 2 -->
            <div
                class="bg-yellow-100 rounded-3xl p-6 flex flex-col justify-between hover:bg-yellow-200 transition-colors cursor-pointer group"
            >
                <div
                    class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xl"
                >
                    ✨
                </div>
                <div>
                    <h3
                        class="font-bold text-xl text-yellow-900 group-hover:translate-x-1 transition-transform"
                    >
                        Presentations
                    </h3>
                    <p class="text-sm text-yellow-800 mt-1">
                        Pitch decks that win
                    </p>
                </div>
            </div>

            <!-- Card 3 Removed -->

            <!-- Card 4 -->
            <div
                class="md:col-span-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 flex items-center justify-between text-white shadow-lg hover:shadow-pink-500/40 transition-all cursor-pointer"
            >
                <div class="max-w-xs">
                    <h3 class="text-3xl font-bold mb-2">Team Collaboration</h3>
                    <p class="text-pink-100">
                        Design together in real-time with comments and
                        workflows.
                    </p>
                </div>
                <div
                    class="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                    →
                </div>
            </div>
        </div>
    </section>

    <!-- Footer CTA -->
    <section class="bg-[#0f172a] text-white py-20 text-center">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-bold mb-6">Ready to create?</h2>
            <button
                class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105"
            >
                Get Started for Free
            </button>
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
