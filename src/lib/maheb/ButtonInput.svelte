<script lang="ts">
    export let label: string;
    export let id: string;
    export let value: number;
    export let onChange: (val: number) => void;
</script>

<div>
    <label class="block text-gray-300" for="input-{id}">{label}</label>
    <input 
        {id}
        type="number" 
        {value}
        on:change={(e) => onChange(parseInt((e.target as HTMLInputElement).value))}
        class="w-full px-1 py-1 bg-gray-700 text-white rounded text-xs"
    />
</div>
