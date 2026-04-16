<script setup lang="ts">
import { ref } from 'vue'

const sceneRef = ref<{ triggerExport: () => void } | null>(null)

useHead({
  title: '3D Figure Builder',
  meta: [{ name: 'description', content: 'Build and customize a humanoid 3D figure for printing.' }]
})
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

    <!-- ── Top bar ──────────────────────────────────────────────────────────── -->
    <header class="shrink-0 flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 shadow-lg z-10">
      <div class="flex items-center gap-3">
        <!-- Logo mark -->
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow shadow-indigo-700/40">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        </div>
        <div>
          <h1 class="text-base font-bold text-white leading-none">3D Figure Builder</h1>
          <p class="text-xs text-gray-500 leading-none mt-0.5">Customize · Preview · Export STL</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Pose button -->
        <NuxtLink
          to="/pose"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600
                 text-sm font-medium text-gray-200 transition-all duration-150"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Pose
        </NuxtLink>

        <!-- Workshop button -->
        <NuxtLink
          to="/accessories"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600
                 text-sm font-medium text-gray-200 transition-all duration-150"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Workshop
        </NuxtLink>

        <!-- Export button -->
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
                 text-sm font-semibold text-white shadow shadow-indigo-700/40
                 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          @click="sceneRef?.triggerExport()"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export STL
        </button>
      </div>
    </header>

    <!-- ── Main layout ──────────────────────────────────────────────────────── -->
    <div class="flex flex-1 min-h-0">
      <!-- Control panel -->
      <ControlPanel />

      <!-- 3D Viewport -->
      <main class="flex-1 relative overflow-hidden">
        <Scene3D ref="sceneRef" />
      </main>
    </div>

  </div>
</template>
