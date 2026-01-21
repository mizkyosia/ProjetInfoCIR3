<script context="module">
    export function createQuizzFromData(dragData) {
        // Here we could validate the data
        return {
            question: dragData.question || "New Question",
            options: dragData.options || ["Option 1"],
            correctAnswerIndex: dragData.correctAnswerIndex || 0
        };
    }
</script>

<script>
    export let mode = 'play'; // 'play' | 'edit'
    
    // Unified data object
    export let data = {
        question: "",
        options: [],
        correctAnswerIndex: 0
    };

    let selectedIndex = null;
    let issubmitted = false;

    // --- Play Logic ---
    function selectOption(index) {
        if (!issubmitted) {
            selectedIndex = index;
        }
    }

    function submitAnswer() {
        if (selectedIndex !== null) {
            issubmitted = true;
        }
    }

    function resetQuiz() {
        selectedIndex = null;
        issubmitted = false;
    }

    // --- Edit Logic ---
    function addOption() {
        data.options = [...data.options, `Option ${data.options.length + 1}`];
    }
    
    function removeOption(index) {
        data.options = data.options.filter((_, i) => i !== index);
        if (data.correctAnswerIndex === index) data.correctAnswerIndex = 0; 
        if (data.correctAnswerIndex > index) data.correctAnswerIndex--;
    }

    function handleDragStart(event) {
        // Clone data to avoid reference issues
        const dropPayload = { ...data };
        event.dataTransfer.setData('application/json', JSON.stringify({ type: 'quizz', data: dropPayload }));
        event.dataTransfer.effectAllowed = 'copy';
    }
</script>

{#if mode === 'edit'}
    <div class="quiz-editor">
        <h2 class="text-xl font-bold mb-6 text-gray-800">Configurer le Quizz</h2>
        
        <div class="field-group">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label>Question</label>
            <textarea bind:value={data.question} rows="3"></textarea>
        </div>

        <div class="field-group">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label>Réponses (Cochez la bonne)</label>
            <div class="options-list">
                {#each data.options as option, i}
                    <div class="option-row">
                        <input 
                            type="radio" 
                            name="correct-answer" 
                            checked={data.correctAnswerIndex === i} 
                            on:change={() => data.correctAnswerIndex = i}
                        >
                        <input 
                            type="text" 
                            bind:value={data.options[i]}
                        >
                        <button class="delete-btn" on:click={() => removeOption(i)}>✕</button>
                    </div>
                {/each}
            </div>
            <button class="add-btn" on:click={addOption}>+ Ajouter une option</button>
        </div>

        <div class="drag-handle-container">
            <p>Glissez cet élément sur la zone de travail pour ajouter le quizz</p>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="drag-handle"
                draggable="true" 
                on:dragstart={handleDragStart}
            >
                <span class="icon">❓</span>
                <span class="text">Glisser le Quizz</span>
            </div>
        </div>
    </div>
{:else}
    <div class="quiz-panel">
        <h3>{data.question}</h3>

        <div class="options-container">
            {#each data.options as option, index}
                <button
                    class="option-btn"
                    class:selected={selectedIndex === index}
                    class:correct={issubmitted && index === data.correctAnswerIndex}
                    class:wrong={issubmitted && selectedIndex === index && index !== data.correctAnswerIndex}
                    on:click={() => selectOption(index)}
                    disabled={issubmitted}
                >
                    {option}
                </button>
            {/each}
        </div>

        <div class="controls">
            {#if !issubmitted}
                <button 
                    class="submit-btn" 
                    on:click={submitAnswer} 
                    disabled={selectedIndex === null}
                >
                    Valider la réponse
                </button>
            {:else}
                <div class="result-message">
                    {#if selectedIndex === data.correctAnswerIndex}
                        <span class="success">Correct ! 🎉</span>
                    {:else}
                        <span class="error">Incorrect. La bonne réponse était : {data.options[data.correctAnswerIndex]}</span>
                    {/if}
                </div>
                <button class="reset-btn" on:click={resetQuiz}>Recommencer</button>
            {/if}
        </div>
    </div>
{/if}

<style>
    /* ... Existing styles ... */
    .quiz-panel {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        max-width: 500px;
        margin: 20px auto;
        font-family: sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: left; /* Ensure left alignment */
    }
    
    /* ... (Existing styles for quiz-panel content) ... */
    h3 { margin-top: 0; margin-bottom: 20px; color: #333; }
    .options-container { display: flex; flex-direction: column; gap: 10px; }
    .option-btn { padding: 12px; text-align: left; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    .option-btn:hover:not(:disabled) { background-color: #eef; border-color: #aaf; }
    .option-btn.selected { border-color: #007bff; background-color: #e6f2ff; font-weight: bold; }
    .option-btn.correct { background-color: #d4edda; border-color: #28a745; color: #155724; }
    .option-btn.wrong { background-color: #f8d7da; border-color: #dc3545; color: #721c24; }
    .controls { margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .submit-btn, .reset-btn { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .submit-btn:disabled { background-color: #cccccc; cursor: not-allowed; }
    .reset-btn { background-color: #6c757d; }
    .result-message { font-weight: bold; }
    .success { color: #28a745; }
    .error { color: #dc3545; }

    /* --- Editor Styles (Tailwind-like plain CSS for portability) --- */
    .quiz-editor {
        width: 100%;
        height: 100%;
        background: white;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        font-family: sans-serif;
    }
    .quiz-editor h2 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #1f2937; margin: 0;}
    
    .field-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    .field-group textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; box-sizing: border-box; resize: vertical; }
    .field-group textarea:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2); }

    .options-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .option-row { display: flex; align-items: center; gap: 0.75rem; }
    .option-row input[type="radio"] { width: 1rem; height: 1rem; color: #7c3aed; cursor: pointer; }
    .option-row input[type="text"] { flex: 1; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem; font-size: 0.875rem; width: 100%; box-sizing: border-box; }
    .option-row input[type="text"]:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2); }
    .delete-btn { color: #f87171; background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.25rem; line-height: 1; }
    .delete-btn:hover { color: #dc2626; }

    .add-btn { margin-top: 0.75rem; color: #7c3aed; background: none; border: none; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; padding: 0; }
    .add-btn:hover { color: #5b21b6; }

    .drag-handle-container { padding-top: 1rem; border-top: 1px solid #e5e7eb; }
    .drag-handle-container p { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.75rem; margin-top: 0; }
    .drag-handle { 
        padding: 1rem; 
        background: linear-gradient(to right, #f3e8ff, #e0e7ff); 
        border: 1px solid #e9d5ff; 
        border-radius: 0.75rem; 
        cursor: grab; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 0.75rem; 
        transition: all 0.2s;
    }
    .drag-handle:active { cursor: grabbing; }
    .drag-handle:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .drag-handle .icon { font-size: 1.5rem; }
    .drag-handle .text { font-weight: 700; color: #312e81; }
</style>