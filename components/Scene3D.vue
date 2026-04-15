<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useFigureStore } from '~/stores/figure'
import { useHumanoid } from '~/composables/useHumanoid'
import { useSTLExport } from '~/composables/useSTLExport'

const store  = useFigureStore()
const { exportSTL } = useSTLExport()

const containerRef = ref<HTMLDivElement>()
const canvasRef    = ref<HTMLCanvasElement>()

let humanoid: ReturnType<typeof useHumanoid> | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!canvasRef.value || !containerRef.value) return

  humanoid = useHumanoid(canvasRef.value)
  humanoid.updateFigure({ ...store.$state })

  // Resize observer keeps the canvas filling its container
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    if (width > 0 && height > 0) {
      humanoid?.handleResize(width, height)
    }
  })
  resizeObserver.observe(containerRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  humanoid?.dispose()
})

// Reactively update figure whenever the store changes
watch(
  () => ({ ...store.$state }),
  (newState) => { humanoid?.updateFigure(newState) },
  { deep: true }
)

function triggerExport() {
  if (!humanoid) return
  exportSTL(humanoid.figureGroup)
}

defineExpose({ triggerExport })
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full block" />

    <!-- Overlay hint -->
    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
      <p class="text-xs text-gray-500 bg-gray-900/60 px-3 py-1 rounded-full backdrop-blur-sm">
        Left drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Right drag to pan
      </p>
    </div>
  </div>
</template>
