<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useFigureStore } from '~/stores/figure'
import { usePoseEditor, POSE_SEGMENTS } from '~/composables/usePoseEditor'

useHead({ title: 'Pose Editor — 3D Figure Builder' })

const router = useRouter()
const store  = useFigureStore()

const canvasEl  = ref<HTMLCanvasElement | null>(null)
const poseEditor = ref<ReturnType<typeof usePoseEditor> | null>(null)
const selectedBone = ref<string | null>(null)

// Group segments by their group label for the panel
const segmentGroups = computed(() => {
  const groups: Record<string, typeof POSE_SEGMENTS[number][]> = {}
  for (const seg of POSE_SEGMENTS) {
    if (!groups[seg.group]) groups[seg.group] = []
    groups[seg.group].push(seg)
  }
  return groups
})

// Collapsed state per group — finger groups start collapsed to keep the panel tidy
const collapsedGroups = ref<Record<string, boolean>>({
  'Left Hand':  true,
  'Right Hand': true,
})

function toggleGroup(name: string) {
  collapsedGroups.value[name] = !collapsedGroups.value[name]
}

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  if (!canvasEl.value) return
  poseEditor.value = usePoseEditor(canvasEl.value)

  // Pre-apply any previously saved pose
  if (Object.keys(store.pose).length > 0) {
    poseEditor.value.applyPose(store.pose, store.poseGroundOffset)
  }

  const ro = new ResizeObserver(entries => {
    poseEditor.value?.handleResize(entries[0].contentRect.width, entries[0].contentRect.height)
  })
  ro.observe(canvasEl.value.parentElement!)

  onBeforeUnmount(() => { ro.disconnect(); poseEditor.value?.dispose() })
})

// ── Actions ───────────────────────────────────────────────────────────────────
function handleSelectBone(key: string) {
  selectedBone.value = key
  poseEditor.value?.selectBone(key)
}

function handleGround() {
  poseEditor.value?.groundFigure()
}

function handleReset() {
  selectedBone.value = null
  poseEditor.value?.resetPose()
}

function handleSave() {
  if (!poseEditor.value) return
  store.savePose(poseEditor.value.getPoseData(), poseEditor.value.getGroundOffset())
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <header class="shrink-0 flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 shadow-lg z-10">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Builder
        </NuxtLink>
        <div class="w-px h-5 bg-gray-700" />
        <h1 class="text-base font-bold text-white">Pose Editor</h1>
      </div>
    </header>

    <!-- ── Main layout ──────────────────────────────────────────────────────── -->
    <div class="flex flex-1 min-h-0">

      <!-- ── Left panel ──────────────────────────────────────────────────── -->
      <aside class="w-64 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto flex flex-col">

        <div class="flex-1 px-3 py-3 space-y-1">
          <!-- Segment groups -->
          <div v-for="(segments, groupName) in segmentGroups" :key="groupName">

            <!-- Collapsible group header -->
            <button
              class="w-full flex items-center justify-between px-1 py-1.5 text-left hover:text-gray-300 transition-colors group"
              @click="toggleGroup(String(groupName))"
            >
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                {{ groupName }}
              </span>
              <svg
                :class="['w-3 h-3 text-gray-600 transition-transform duration-150',
                         collapsedGroups[String(groupName)] ? '' : 'rotate-180']"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Segment list (hidden when collapsed) -->
            <ul v-show="!collapsedGroups[String(groupName)]" class="space-y-0.5 mb-1">
              <li v-for="seg in segments" :key="seg.key">
                <button
                  :class="['w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left',
                           selectedBone === seg.key
                             ? 'bg-indigo-600/25 border border-indigo-500/60 text-indigo-200'
                             : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent']"
                  @click="handleSelectBone(seg.key)"
                >
                  <span :class="['w-2 h-2 rounded-full shrink-0',
                                 selectedBone === seg.key ? 'bg-indigo-400' : 'bg-gray-700']" />
                  {{ seg.label }}
                </button>
              </li>
            </ul>

          </div>
        </div>

        <!-- Bottom actions -->
        <div class="px-3 pb-4 pt-2 space-y-2 border-t border-gray-800">
          <button
            class="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600
                   text-sm font-medium text-gray-200 transition-all"
            @click="handleGround"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Place on Ground
          </button>

          <button
            class="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700
                   text-sm font-medium text-gray-400 hover:text-gray-200 transition-all"
            @click="handleReset"
          >
            Reset Pose
          </button>

          <button
            class="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                   text-sm font-semibold text-white transition-all"
            @click="handleSave"
          >
            Save Pose
          </button>
        </div>

      </aside>

      <!-- ── 3D Viewport ──────────────────────────────────────────────────── -->
      <main class="flex-1 relative overflow-hidden">

        <!-- Hint overlay -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div class="bg-gray-900/80 backdrop-blur px-4 py-2 rounded-xl border border-gray-700/60 text-xs text-gray-400 text-center shadow">
            <template v-if="selectedBone">
              Drag the colored <span class="text-gray-200 font-medium">rings</span> to rotate the joint &nbsp;·&nbsp;
              <span class="text-gray-300">Right-click + drag</span> to orbit
            </template>
            <template v-else>
              Select a joint from the left panel to start posing
            </template>
          </div>
        </div>

        <canvas ref="canvasEl" class="w-full h-full block" />
      </main>

    </div>
  </div>
</template>
