<script lang="ts">
    import { getSlideThumbnailURL } from "$lib/db/thumbnails";

    let { title, updatedAt, slideID, presentationID } = $props<{
        title: string;
        updatedAt: number;
        presentationID: string;
        slideID: string;
    }>();

    const formattedDate = new Date(updatedAt).toLocaleDateString();
    let thumbnailUrl: undefined | string = $state();

    getSlideThumbnailURL(slideID).then(
        (url) => (thumbnailUrl = url ?? undefined),
    );
</script>

<a
    href="/{presentationID}"
    class="
    flex items-center gap-3
    rounded-lg border border-neutral-700
    bg-neutral-900 p-3
    text-white
    hover:bg-neutral-800
  "
>
    <!-- Thumbnail -->
    <div
        class="
      h-16 w-24
      flex-shrink-0
      overflow-hidden
      rounded
      bg-neutral-800
      border border-neutral-700
    "
    >
        {#if thumbnailUrl}
            <img
                src={thumbnailUrl}
                alt="Thumbnail"
                class="h-full w-full object-cover"
            />
        {:else}
            <div
                class="flex h-full w-full items-center justify-center text-xs text-neutral-500"
            >
                No preview
            </div>
        {/if}
    </div>

    <!-- Info -->
    <div class="flex min-w-0 flex-col">
        <div class="truncate font-medium">
            {title}
        </div>

        <div class="text-xs text-neutral-500">
            Updated {formattedDate}
        </div>
    </div>
</a>
