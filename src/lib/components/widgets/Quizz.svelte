<script lang="ts">
    import { editorStore } from "$lib/state.svelte";
    import type {
        ElementProps,
        QuizzElement,
    } from "$lib/types/presentation";
    import Icon from "@iconify/svelte";
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
</script>

<Base bind:data>
    {#snippet editor()}
        <Icon
            icon="gridicons:add-outline"
            class="hover:cursor-pointer hover:bg-neutral-600 transition-colors rounded-lg p-1 box-content h-5 w-5"
            onclick={() => data.options.push("Nouveau choix")}
        />
    {/snippet}

    <div
        class="overflow-hidden p-4 text-left w-full h-full font-sans"
        style="
            border-color: {data.borderColor};
            border-width: {data.borderThickness}px;
            border-style: {data.borderStyle};
            border-radius: {data.borderRadius}px;
            background-color: {data.fillColor};"
    >
        <h3
            class="mt-0 mb-5 text-neutral-900"
            contenteditable={!editorStore.exporting}
        >
            {data.question}
        </h3>

        <div class="flex flex-col gap-2.5">
            {#each data.options as option, index}
                {#if editorStore.viewing || editorStore.exporting}
                    <button
                        class={[
                            "p-3 text-left border-2 rounded-md cursor-pointer transition-all quiz-option",
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
                        onclick={() => selectOption(index)}
                        disabled={issubmitted}
                    >
                        {option}
                    </button>
                {:else}
                    <div class="flex flex-row items-center gap-2">
                        <input
                            type="radio"
                            bind:group={data.correctAnswerIndex}
                            value={index}
                        />
                        <input
                            type="text"
                            class={[
                                "p-3 text-left border-2 rounded-md cursor-pointer transition-all flex-1 min-w-5",
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
                            bind:value={data.options[index]}
                            onclick={() => selectOption(index)}
                            disabled={issubmitted}
                        />
                        <Icon
                            icon="iconamoon:trash"
                            class="hover:text-red-500 transition-colors h-5 w-5 cursor-pointer"
                            onclick={() => {
                                data.options = data.options.filter(
                                    (_, i) => i !== index,
                                );
                            }}
                        />
                    </div>
                {/if}
            {/each}
        </div>

        <div class="mt-5 flex justify-between items-center">
            {#if !issubmitted}
                <button
                    class="py-2.5 px-5 bg-blue-600 text-white border-0 rounded-md cursor-pointer quizz-submit-button"
                    onclick={submitAnswer}
                    disabled={selectedIndex === null}
                >
                    Valider la réponse
                </button>
            {:else}
                <button
                    class="py-2.5 px-5 bg-neutral-500 text-white border-0 rounded-md cursor-pointer quizz-submit-button"
                    onclick={resetQuiz}>Recommencer</button
                >
            {/if}
        </div>
    </div>
</Base>
