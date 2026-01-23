<script lang="ts">
    import { listImageURLs, getImageURL, saveImage } from "$lib/db/images";
    import { createPresentationElement } from "$lib/types/presentation";
    import { editorStore } from "$lib/state.svelte.js";

    let uploadedImages: Awaited<ReturnType<typeof listImageURLs>> = $state([]);
    
    async function loadImages() {
        uploadedImages = await listImageURLs();
    }

    async function onUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const imageId = await saveImage(file);
        const url = (await getImageURL(imageId)) as string;
        uploadedImages.unshift({ url, id: imageId });
    }

    loadImages();
</script>

<label
    for="file"
    class="cursor-pointer bg-neutral-100 w-auto m-8 h-fit aspect-square border-2 border-dashed border-neutral-700 rounded-4xl flex items-center justify-center"
>
    <div
        class="flex flex-col items-center content-center gap-1"
    >
        <svg viewBox="0 0 640 512" class="h-12 mb-5">
            <path
                d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
            ></path>
        </svg>
        <p>Drag and Drop</p>
        <p>or</p>
        <span
            class="bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-left hover:bg-right px-4 py-1 rounded-xl text-neutral-50 transition-all"
            >Browse file</span
        >
    </div>
    <input
        class="hidden"
        id="file"
        type="file"
        onchange={onUpload}
    />
</label>
<hr class="mx-5 border rounded-full border-neutral-700" />

<div class="flex flex-wrap items-center">
    {#each uploadedImages as img (img.id)}
        <button
            onclick={() => {
                editorStore.updateSlide((slide) =>
                    slide.elements.push(
                        createPresentationElement("image", {
                            assetId: img.id,
                        }),
                    ),
                );
            }}
        >
            <img
                src={img.url}
                class="h-26 shadow m-2 hover:shadow-lg transition-all cursor-pointer rounded-2xl border border-neu"
                alt="Uploaded"
            />
        </button>
    {/each}
</div>
