<script>
import { documentName, getFullDocumentTitle } from "$lib/documentState.js";

let isEditing = false;
let editValue = documentName;

function startEditing() {
    isEditing = true;
    editValue = documentName;
}

function saveEdit() {
    documentName.set(editValue);
    isEditing = false;
}

function cancelEdit() {
    isEditing = false;
    editValue = documentName;
}

    /**
     * @param {{ key: string; }} event
     */
function handleKeydown(event) {
    if (event.key === "Enter") saveEdit();
    else if (event.key === "Escape") cancelEdit();
}
</script>

{#if isEditing}
<!-- svelte-ignore a11y_autofocus -->
<input
    bind:value={editValue}
    onblur={saveEdit}
    onkeydown={handleKeydown}
    autofocus
    class="bg-white text-black px-2 py-1 rounded outline-none"
/>
{:else}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
    class="cursor-pointer font-medium hover:underline"
    onclick={startEditing}
    title="Cliquez pour modifier le nom"
>
    {getFullDocumentTitle()}
</span>
{/if}
