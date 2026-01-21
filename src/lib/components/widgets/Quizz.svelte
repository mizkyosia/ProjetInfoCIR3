<script lang="ts">
    import type {
        BaseElement,
        ElementProps,
        QuizzElement,
    } from "$lib/types/presentation";
    import Base from "./Base.svelte";

    let {
        data = $bindable(),
    }: ElementProps<QuizzElement> & { mode: "edit" | "view" } = $props();

    let selectedIndex: number | null = $state(null);
    let issubmitted = $state(false);

    // --- Play Logic ---
    function selectOption(index: number) {
        if (!issubmitted) {
            selectedIndex = index;
        }
    }

    function submitAnswer() {
        if (selectedIndex !== null) {
            issubmitted = true;
        }
    }

    function resetQuiz() {
        selectedIndex = null;
        issubmitted = false;
    }

    // --- Edit Logic ---
    function addOption() {
        data.options.push(`Option ${data.options.length + 1}`);
    }

    function removeOption(index: number) {
        data.options = data.options.filter((_, i) => i !== index);
        if (data.correctAnswerIndex === index) data.correctAnswerIndex = 0;
        if (data.correctAnswerIndex > index) data.correctAnswerIndex--;
    }
</script>

<Base bind:data={data as BaseElement}>
    <div
        class="bg-neutral-50 overflow-hidden border-2 border-[#ddd] rounded-lg p-4 text-left w-full h-full font-sans"
    >
        <h3 class="mt-0 mb-5 text-neutral-900" contenteditable="true">
            {data.question}
        </h3>

        <div class="flex flex-col gap-2.5">
            {#each data.options as option, index}
                <button
                    class={[
                        "p-3 text-left border-2 rounded-md cursor-pointer transition-all",
                        {
                            "border-blue-500 bg-blue-200 font-bold":
                                selectedIndex === index,
                            "border-green-500 bg-green-200 text-green-950":
                                issubmitted &&
                                index === data.correctAnswerIndex,
                            "border-red-500 bg-red-200 text-red-950":
                                issubmitted &&
                                selectedIndex === index &&
                                index !== data.correctAnswerIndex,
                            "border-neutral-700": !issubmitted,
                        },
                    ]}
                    contenteditable={true}
                    onclick={() => selectOption(index)}
                    disabled={issubmitted}
                >
                    {option}
                </button>
            {/each}
        </div>

        <div class="mt-5 flex justify-between items-center">
            {#if !issubmitted}
                <button
                    class="py-2.5 px-5 bg-blue-600 text-white border-0 rounded-md cursor-pointer"
                    onclick={submitAnswer}
                    disabled={selectedIndex === null}
                >
                    Valider la réponse
                </button>
            {:else}
                <button
                    class="py-2.5 px-5 bg-neutral-500 text-white border-0 rounded-md cursor-pointer"
                    onclick={resetQuiz}>Recommencer</button
                >
            {/if}
        </div>
    </div>
</Base>
