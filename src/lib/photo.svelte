<script context="module" lang="ts">
    import { writable } from 'svelte/store';

    // État de la présentation
    export const isPresentationMode = writable(false);
    
    // Index de la slide (tes collègues pourront l'utiliser pour changer de page)
    export const currentSlide = writable(0);

    export async function togglePresentation(element: HTMLElement) {
        if (!element) return;

        try {
            if (!document.fullscreenElement) {
                // Demande au navigateur de mettre l'élément en plein écran
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if ((element as any).webkitRequestFullscreen) {
                    await (element as any).webkitRequestFullscreen();
                }
                isPresentationMode.set(true);
            } else {
                // Quitte le mode plein écran
                await document.exitFullscreen();
                isPresentationMode.set(false);
            }
        } catch (err) {
            console.error("Erreur Fullscreen:", err);
        }
    }

    // Fonctions pour naviguer (préparées pour tes collègues)
    export function nextSlide(total: number) {
        currentSlide.update(n => (n < total - 1 ? n + 1 : n));
    }

    export function prevSlide() {
        currentSlide.update(n => (n > 0 ? n - 1 : n));
    }
</script>