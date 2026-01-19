<script>
    // Placeholder data for the sidebar items
    const sidebarItems = [
        { icon: '🎨', label: 'Design' },
        { icon: '🧩', label: 'Elements' },
        { icon: 'T', label: 'Text' },
        { icon: '☁️', label: 'Uploads' },
        { icon: '🖊️', label: 'Draw' },
        { icon: '📂', label: 'Projects' },
        { icon: '📱', label: 'Apps' }
    ];

    // Placeholder data for templates
    const templates = [
        { color: 'bg-blue-200', title: 'Infographic' },
        { color: 'bg-pink-200', title: 'Instagram Post' },
        { color: 'bg-yellow-200', title: 'Presentation' },
        { color: 'bg-green-200', title: 'Poster' },
        { color: 'bg-purple-200', title: 'Resume' },
        { color: 'bg-orange-200', title: 'Logo' },
    ];
</script>

<div class="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
    
    <!-- Left Sidebar (Navigation) -->
    <aside class="w-20 bg-gray-900 text-white flex flex-col items-center py-4 flex-shrink-0">
        <!-- Burger Menu / Logo placeholder -->
        <div class="mb-6 p-2 cursor-pointer hover:bg-gray-800 rounded">
            <div class="w-6 h-0.5 bg-white mb-1"></div>
            <div class="w-6 h-0.5 bg-white mb-1"></div>
            <div class="w-6 h-0.5 bg-white"></div>
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 w-full space-y-2">
            {#each sidebarItems as item, i}
                <button class={`flex flex-col items-center justify-center w-full py-3 hover:bg-gray-800 transition-colors ${i === 0 ? 'bg-gray-800 border-l-4 border-cyan-400' : ''}`}>
                    <span class="text-xl mb-1">{item.icon}</span>
                    <span class="text-xs font-medium">{item.label}</span>
                </button>
            {/each}
        </nav>
    </aside>

    <!-- Secondary Sidebar (Contextual Panel) -->
    <aside class="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div class="p-4 border-b border-gray-200">
            <div class="relative">
                <input 
                    type="text" 
                    placeholder="Search templates..." 
                    class="w-full bg-gray-100 text-gray-700 rounded-md py-2 px-3 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span class="absolute left-2.5 top-2 text-gray-400">🔍</span>
            </div>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4">
            <h3 class="font-bold text-gray-800 mb-4">Templates</h3>
            <div class="grid grid-cols-2 gap-3">
                {#each templates as t}
                    <div class="cursor-pointer group">
                        <div class={`${t.color} h-32 rounded-md mb-2 group-hover:opacity-80 transition-opacity`}></div>
                        <p class="text-xs text-gray-600 truncate">{t.title}</p>
                    </div>
                {/each}
                {#each templates as t}
                    <div class="cursor-pointer group">
                        <div class={`${t.color} h-32 rounded-md mb-2 group-hover:opacity-80 transition-opacity`}></div>
                        <p class="text-xs text-gray-600 truncate">{t.title}</p>
                    </div>
                {/each}
            </div>
        </div>
    </aside>

    <!-- Main Workspace (Canvas Area) -->
    <main class="flex-1 flex flex-col min-w-0 bg-gray-100 relative">
        
        <!-- Top Bar -->
        <header class="h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between px-4 shadow-sm flex-shrink-0">
            <div class="flex items-center space-x-4">
                <span class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer">File</span>
                <span class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer">Resize</span>
                <div class="h-4 w-[1px] bg-white/30"></div>
                <span class="text-sm opacity-90">Untitled Design - 1920x1080</span>
            </div>

            <div class="flex items-center space-x-3">
                <div class="flex -space-x-2">
                     <div class="w-8 h-8 rounded-full bg-red-400 border-2 border-indigo-600"></div>
                     <div class="w-8 h-8 rounded-full bg-green-400 border-2 border-indigo-600"></div>
                </div>
                <button class="bg-white/20 hover:bg-white/30 p-2 rounded-full">
                     <span>➕</span>
                </button>
                <button class="bg-white text-indigo-700 font-bold py-1.5 px-4 rounded hover:bg-gray-100">
                    Share
                </button>
            </div>
        </header>

        <!-- Canvas Container -->
        <div class="flex-1 relative overflow-auto flex items-center justify-center p-10 bg-gray-200">
            
            <!-- The White Board / Page -->
            <div class="bg-white w-[800px] h-[450px] shadow-xl relative group">
                <!-- Content Placeholder -->
                <div class="absolute inset-0 flex items-center justify-center border-2 border-dashed border-transparent hover:border-purple-300">
                    <h1 class="text-4xl font-extrabold text-gray-800 tracking-tight">DESIGN CANVAS</h1>
                    <div class="absolute bottom-10 right-10 w-20 h-20 bg-purple-500 rounded-full opacity-50 mix-blend-multiply"></div>
                    <div class="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-50 mix-blend-multiply"></div>
                </div>
            </div>

            <!-- Footer / Zoom Controls -->
            <div class="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-4 text-gray-600 text-sm">
                <span class="cursor-pointer hover:bg-gray-100 p-1 rounded">Notes</span>
                <div class="h-4 w-[1px] bg-gray-300"></div>
                <div class="flex items-center space-x-2">
                        <button class="hover:text-black">-</button>
                        <span>56%</span>
                        <button class="hover:text-black">+</button>
                </div>
                <div class="h-4 w-[1px] bg-gray-300"></div>
                <span class="cursor-pointer hover:bg-gray-100 p-1 rounded">⤢</span>
            </div>

        </div>
    </main>
</div>