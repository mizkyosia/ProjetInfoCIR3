<script context="module" lang="ts">
    import { writable } from 'svelte/store';

    export const isPresentationMode = writable(false);
    export const currentSlide = writable(0);

    export async function togglePresentation(element: HTMLElement) {
        if (!element) return;
        if (!document.fullscreenElement) {
            await element.requestFullscreen().catch(console.error);
            isPresentationMode.set(true);
        } else {
            await document.exitFullscreen().catch(console.error);
            isPresentationMode.set(false);
        }
    }

    export function nextSlide(total: number) {
        currentSlide.update(n => (n < total - 1 ? n + 1 : n));
    }

    export function prevSlide() {
        currentSlide.update(n => (n > 0 ? n - 1 : n));
    }
</script>