import { writable } from 'svelte/store';

export interface Button {
    id: string;
    label: string;
    color: string;
    destinationSlide: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export interface Slide {
    id: number;
    label: string;
    buttons: Button[];
}

export interface Presentation {
    slides: Slide[];
}

// Configuration par défaut
const defaultPresentation: Presentation = {
    slides: [
        {
            id: 1,
            label: 'Slide 1',
            buttons: [
                { id: 'btn1', label: 'Bouton rouge', color: 'red', destinationSlide: 3 },
                { id: 'btn2', label: 'Bouton vert', color: 'green', destinationSlide: 2 }
            ]
        },
        {
            id: 2,
            label: 'Slide 2',
            buttons: [
                { id: 'btn3', label: 'Bouton violet', color: 'purple', destinationSlide: 4 }
            ]
        },
        {
            id: 3,
            label: 'Slide 3',
            buttons: [
                { id: 'btn4', label: 'Bouton bleu', color: 'blue', destinationSlide: 5 }
            ]
        },
        { id: 4, label: 'Slide 4', buttons: [
            { id: 'btn5', label: 'Bouton magenta', color: 'magenta', destinationSlide: 10 },
            { id: 'btn6', label: 'Bouton orange', color: 'orange', destinationSlide: 12 }
        ]},
        { id: 5, label: 'Slide 5', buttons: [] },
        { id: 10, label: 'Slide 10', buttons: [] },
        { id: 12, label: 'Slide 12', buttons: [] }
    ]
};

function loadPresentation(): Presentation {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('presentation');
        if (saved) {
            return JSON.parse(saved);
        }
    }
    return defaultPresentation;
}

function savePresentation(presentation: Presentation) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('presentation', JSON.stringify(presentation));
    }
}

function createPresentationStore() {
    const { subscribe, set, update } = writable<Presentation>(loadPresentation());

    return {
        subscribe,
        
        // Sauvegarder les changements
        save: () => {
            subscribe(pres => {
                savePresentation(pres);
                return pres;
            })();
        },

        // Ajouter une slide
        addSlide: (label: string) => {
            update(pres => {
                const newId = Math.max(...pres.slides.map(s => s.id), 0) + 1;
                pres.slides.push({
                    id: newId,
                    label: label || `Slide ${newId}`,
                    buttons: []
                });
                savePresentation(pres);
                return pres;
            });
        },

        // Ajouter une slide avec ID spécifique
        addSlideWithId: (id: number, label: string) => {
            update(pres => {
                // Vérifier que l'ID n'existe pas déjà
                if (pres.slides.some(s => s.id === id)) {
                    alert(`La slide ${id} existe déjà !`);
                    return pres;
                }
                pres.slides.push({
                    id: id,
                    label: label || `Slide ${id}`,
                    buttons: []
                });
                // Trier par ID
                pres.slides.sort((a, b) => a.id - b.id);
                savePresentation(pres);
                return pres;
            });
        },

        // Supprimer une slide
        deleteSlide: (slideId: number) => {
            update(pres => {
                pres.slides = pres.slides.filter(s => s.id !== slideId);
                savePresentation(pres);
                return pres;
            });
        },

        // Ajouter un bouton à une slide
        addButton: (slideId: number, label: string, color: string, destinationSlide: number) => {
            update(pres => {
                const slide = pres.slides.find(s => s.id === slideId);
                if (slide) {
                    const newId = `btn${Date.now()}`;
                    slide.buttons.push({
                        id: newId,
                        label: label || 'Nouveau bouton',
                        color: color || 'blue',
                        destinationSlide
                    });
                    savePresentation(pres);
                }
                return pres;
            });
        },

        // Supprimer un bouton
        deleteButton: (slideId: number, buttonId: string) => {
            update(pres => {
                const slide = pres.slides.find(s => s.id === slideId);
                if (slide) {
                    slide.buttons = slide.buttons.filter(b => b.id !== buttonId);
                    savePresentation(pres);
                }
                return pres;
            });
        },

        // Mettre à jour un bouton
        updateButton: (slideId: number, buttonId: string, updates: Partial<Button>) => {
            update(pres => {
                const slide = pres.slides.find(s => s.id === slideId);
                if (slide) {
                    const button = slide.buttons.find(b => b.id === buttonId);
                    if (button) {
                        Object.assign(button, updates);
                        savePresentation(pres);
                    }
                }
                return pres;
            });
        },

        // Réinitialiser à la config par défaut
        reset: () => {
            set(defaultPresentation);
            savePresentation(defaultPresentation);
        }
    };
}

export const presentation = createPresentationStore();
