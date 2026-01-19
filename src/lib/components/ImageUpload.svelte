<script lang="ts">
    import { saveImage } from "$lib/db";

    async function onUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const imageId = await saveImage(file);
        console.log("Saved image with ID:", imageId);

        // store imageId in your presentation JSON
    }
</script>
 
<input type="file" accept="image/*" onchange={onUpload} />
