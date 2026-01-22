<script lang="ts">
    import { onMount, onDestroy, type Snippet } from "svelte";

    export type Option<T> = {
        value: T;
        label?: string;
        args?: any;
        render: Snippet;
    };

    let {
        options,
        value = $bindable(),
        placeholder = "Select…",
    } = $props<{
        options: Option<any>[];
        value: any;
        placeholder?: string;
    }>();

    let open = $state(false);
    let root: HTMLElement;

    function select(option: Option<any>) {
        value = option.value;
        open = false;
    }

    function onClickOutside(e: MouseEvent) {
        if (!root.contains(e.target as Node)) open = false;
    }

    onMount(() => document.addEventListener("mousedown", onClickOutside));
    onDestroy(() => document.removeEventListener("mousedown", onClickOutside));
</script>

<div class="relative inline-block" bind:this={root}>
    <!-- Trigger -->
    <button
        type="button"
        class="
      flex items-center gap-2
      rounded-md border border-neutral-700
      bg-neutral-800 px-3 py-1.5
      text-sm text-white
      hover:bg-neutral-700
      focus:outline-none focus:ring-2 focus:ring-blue-500
    "
        aria-haspopup="listbox"
        aria-expanded={open}
        on:click={() => (open = !open)}
    >
        {#if value != null}
            {#each options as opt}
                {#if opt.value === value}
                    {#if opt.render}
                        {@render opt.render(opt.args)}
                    {:else}
                        {opt.label}
                    {/if}
                {/if}
            {/each}
        {:else}
            <span class="text-neutral-400">{placeholder}</span>
        {/if}

        <svg
            class="ml-2 h-4 w-4 opacity-60"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M5.5 7.5l4.5 4.5 4.5-4.5" />
        </svg>
    </button>

    <!-- Dropdown -->
    {#if open}
        <ul
            role="listbox"
            class="
        absolute z-50 mt-1 w-full
        rounded-md border border-neutral-700
        bg-neutral-900 shadow-lg
      "
        >
            {#each options as opt}
                <li
                    role="option"
                    aria-selected={opt.value === value}
                    on:click={() => select(opt)}
                    class="
            cursor-pointer px-3 py-2
            hover:bg-neutral-800
            flex items-center gap-2
          "
                >
                    {#if opt.render}
                        {@render opt.render(opt.args)}
                    {:else}
                        {opt.label}
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>
