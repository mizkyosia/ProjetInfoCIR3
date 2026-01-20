<script lang="ts">
    // On définit les "props" (les données que ce composant reçoit de l'extérieur)
    
    // Le texte qui sera affiché au-dessus de la case de saisie
    export let label: string;
    
    // L'identifiant unique pour lier techniquement le label à l'input (accessibilité)
    export let id: string;
    
    // La valeur actuelle du nombre (ex: la position X du bouton)
    export let value: number;
    
    // La fonction de "rappel" (callback) que l'on appelle pour modifier la donnée chez le parent
    export let onChange: (val: number) => void;

    // Cette fonction gère l'événement de saisie
    function handleInput(e: Event) {
        // On récupère l'élément HTML qui a déclenché l'événement
        const target = e.target as HTMLInputElement;
        
        // On transforme le texte tapé en nombre entier
        // Si l'utilisateur efface tout, on met 0 par défaut (|| 0)
        const numericValue = parseInt(target.value) || 0;
        
        // On envoie ce nouveau nombre au parent via la fonction onChange
        onChange(numericValue);
    }
</script>

<div>
    <label class="block text-gray-300 text-xs mb-1" for="input-{id}">
        {label}
    </label>
    
    <input 
        {id}
        type="number" 
        {value}
        on:change={handleInput}
        class="w-full px-1 py-1 bg-gray-700 text-white rounded text-xs border border-gray-600 focus:border-blue-500 outline-none"
    />
</div>