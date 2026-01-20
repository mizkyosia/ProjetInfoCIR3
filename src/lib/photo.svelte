<script context="module" lang="ts">
    import { writable } from 'svelte/store';

   
    export const isPresentationMode = writable(false);
    
    
    export const currentSlide = writable(0);

    /**
     *  plein écran 
     */
    export async function togglePresentation(element: HTMLElement) {
        if (!element) return;

        try {
            if (!document.fullscreenElement) {
                // On entre en plein écran
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if ((element as any).webkitRequestFullscreen) { /* Safari */
                    await (element as any).webkitRequestFullscreen();
                }
                isPresentationMode.set(true);
            } else {
                // On quitte le plein écran
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
                isPresentationMode.set(false);
            }
        } catch (err) {
            console.error("Erreur mode présentation:", err);
        }
    }

    // pour naviguer  
    export function nextSlide(total: number) {
        currentSlide.update(n => (n < total - 1 ? n + 1 : n));
    }

    export function prevSlide() {
        currentSlide.update(n => (n > 0 ? n - 1 : n));
    }
</script>