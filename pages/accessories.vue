<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFigureStore } from '~/stores/figure'
import { useAccessoryEditor, bufferToB64 } from '~/composables/useAccessoryEditor'
import type { SlotKey, PrimitiveType, PrimitiveParams, CustomAccessory } from '~/stores/figure'

useHead({ title: 'Accessory Workshop — 3D Figure Builder' })

const router = useRouter()
const route  = useRoute()
const store  = useFigureStore()

// ── Canvas ref ────────────────────────────────────────────────────────────────
const canvasEl = ref<HTMLCanvasElement | null>(null)
const editor = ref<ReturnType<typeof useAccessoryEditor> | null>(null)

// ── Form state ────────────────────────────────────────────────────────────────
const slotOptions: { key: SlotKey; label: string }[] = [
  { key: 'hat',       label: 'Head' },
  { key: 'top',       label: 'Upper Body' },
  { key: 'bottom',    label: 'Lower Body' },
  { key: 'leftHand',  label: 'Left Hand' },
  { key: 'rightHand', label: 'Right Hand' },
  { key: 'back',      label: 'Back' },
]

const selectedSlot = ref<SlotKey>(
  (route.query.slot as SlotKey) ?? 'hat'
)

type SourceType = 'primitive' | 'stl'
const sourceType = ref<SourceType>('primitive')
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate')
const accessoryName = ref('')
const accessoryColor = ref('#7a7a8a')

// Primitive params
const primType = ref<PrimitiveType>('sphere')
const primParams = reactive({
  radius: 5,
  radiusTop: 3,
  radiusBottom: 3,
  height: 10,
  width: 8,
  depth: 8,
  segments: 24,
})

// STL upload
const stlBuffer = ref<ArrayBuffer | null>(null)
const stlFileName = ref('')

// Feedback
const previewActive = ref(false)
const saveError = ref('')

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  if (!canvasEl.value) return
  editor.value = useAccessoryEditor(canvasEl.value)

  const ro = new ResizeObserver(entries => {
    const entry = entries[0]
    editor.value?.handleResize(entry.contentRect.width, entry.contentRect.height)
  })
  ro.observe(canvasEl.value.parentElement!)

  onBeforeUnmount(() => {
    ro.disconnect()
    editor.value?.dispose()
  })
})

// ── Transform mode watcher ────────────────────────────────────────────────────
watch(transformMode, (m) => editor.value?.setMode(m))

// ── Color watcher ─────────────────────────────────────────────────────────────
watch(accessoryColor, (c) => {
  if (previewActive.value) editor.value?.updateColor(c)
})

// ── Actions ───────────────────────────────────────────────────────────────────
function buildPrimitiveParams(): PrimitiveParams {
  const p: PrimitiveParams = { type: primType.value, segments: primParams.segments }
  if (primType.value === 'sphere') {
    p.radius = primParams.radius
  } else if (primType.value === 'cylinder') {
    p.radiusTop    = primParams.radiusTop
    p.radiusBottom = primParams.radiusBottom
    p.height       = primParams.height
  } else if (primType.value === 'box') {
    p.width  = primParams.width
    p.height = primParams.height
    p.depth  = primParams.depth
  } else if (primType.value === 'cone') {
    p.radiusBottom = primParams.radiusBottom
    p.height       = primParams.height
  }
  return p
}

function handlePreview() {
  if (!editor.value) return
  editor.value.previewPrimitive(buildPrimitiveParams(), accessoryColor.value, selectedSlot.value)
  previewActive.value = true
  saveError.value = ''
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  stlFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (ev) => {
    stlBuffer.value = ev.target!.result as ArrayBuffer
  }
  reader.readAsArrayBuffer(file)
}

function handleLoadSTL() {
  if (!editor.value || !stlBuffer.value) return
  editor.value.loadSTL(stlBuffer.value, accessoryColor.value, selectedSlot.value)
  previewActive.value = true
  saveError.value = ''
}

function handleSave() {
  if (!editor.value || !previewActive.value) {
    saveError.value = 'Preview an accessory first.'
    return
  }
  const name = accessoryName.value.trim()
  if (!name) {
    saveError.value = 'Enter a name for the accessory.'
    return
  }

  const { position, rotation, scale } = editor.value.getTransform()
  const id = `${selectedSlot.value}_${Date.now()}`

  let geometry: CustomAccessory['geometry']
  if (sourceType.value === 'primitive') {
    geometry = { kind: 'primitive', params: buildPrimitiveParams() }
  } else {
    if (!stlBuffer.value) { saveError.value = 'No STL loaded.'; return }
    geometry = { kind: 'stl', dataB64: bufferToB64(stlBuffer.value) }
  }

  const acc: CustomAccessory = {
    id,
    name,
    slot: selectedSlot.value,
    geometry,
    color: accessoryColor.value,
    position,
    rotation,
    scale,
  }

  store.saveAccessory(acc)
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
        <h1 class="text-base font-bold text-white">Accessory Workshop</h1>
      </div>
    </header>

    <!-- ── Main layout ──────────────────────────────────────────────────────── -->
    <div class="flex flex-1 min-h-0">

      <!-- ── Left panel ──────────────────────────────────────────────────── -->
      <aside class="w-80 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto flex flex-col gap-4 p-4">

        <!-- ① Slot -->
        <section class="panel-section">
          <h3 class="panel-title">① Assign to Slot</h3>
          <select v-model="selectedSlot" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500">
            <option v-for="opt in slotOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
          </select>
        </section>

        <div class="border-t border-gray-800" />

        <!-- ② Source type -->
        <section class="panel-section">
          <h3 class="panel-title">② Shape Source</h3>
          <div class="flex gap-3">
            <label class="radio-label">
              <input type="radio" v-model="sourceType" value="primitive" class="accent-indigo-500" />
              <span>Primitive</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="sourceType" value="stl" class="accent-indigo-500" />
              <span>Upload STL</span>
            </label>
          </div>
        </section>

        <div class="border-t border-gray-800" />

        <!-- ③ Primitive params -->
        <section v-if="sourceType === 'primitive'" class="panel-section">
          <h3 class="panel-title">③ Shape Parameters</h3>

          <!-- Shape type -->
          <div class="grid grid-cols-4 gap-1.5 mb-3">
            <button v-for="t in (['sphere','cylinder','box','cone'] as PrimitiveType[])"
              :key="t"
              :class="['shape-btn', primType === t ? 'shape-btn--active' : '']"
              @click="primType = t"
            >{{ t }}</button>
          </div>

          <!-- Sphere -->
          <div v-if="primType === 'sphere'" class="space-y-2">
            <param-row label="Radius (mm)" v-model="primParams.radius" :min="0.5" :max="40" :step="0.5" />
          </div>

          <!-- Cylinder -->
          <div v-else-if="primType === 'cylinder'" class="space-y-2">
            <param-row label="Top Radius"    v-model="primParams.radiusTop"    :min="0.1" :max="30" :step="0.5" />
            <param-row label="Bottom Radius" v-model="primParams.radiusBottom" :min="0.1" :max="30" :step="0.5" />
            <param-row label="Height (mm)"   v-model="primParams.height"       :min="0.5" :max="80" :step="0.5" />
          </div>

          <!-- Box -->
          <div v-else-if="primType === 'box'" class="space-y-2">
            <param-row label="Width (mm)"  v-model="primParams.width"  :min="0.5" :max="60" :step="0.5" />
            <param-row label="Height (mm)" v-model="primParams.height" :min="0.5" :max="80" :step="0.5" />
            <param-row label="Depth (mm)"  v-model="primParams.depth"  :min="0.5" :max="60" :step="0.5" />
          </div>

          <!-- Cone -->
          <div v-else-if="primType === 'cone'" class="space-y-2">
            <param-row label="Base Radius"  v-model="primParams.radiusBottom" :min="0.1" :max="30" :step="0.5" />
            <param-row label="Height (mm)"  v-model="primParams.height"       :min="0.5" :max="80" :step="0.5" />
          </div>

          <!-- Color -->
          <div class="flex items-center justify-between mt-3">
            <span class="text-xs text-gray-400">Color</span>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full border border-gray-600" :style="{ background: accessoryColor }" />
              <input type="color" v-model="accessoryColor" class="color-input" />
            </div>
          </div>

          <button class="action-btn mt-3" @click="handlePreview">Preview</button>
        </section>

        <!-- ④ STL upload -->
        <section v-else class="panel-section">
          <h3 class="panel-title">③ Upload STL</h3>

          <label class="block">
            <span class="text-xs text-gray-400 block mb-1">STL File</span>
            <div class="flex items-center gap-2">
              <label class="action-btn cursor-pointer text-center flex-1">
                Choose File
                <input type="file" accept=".stl" class="hidden" @change="handleFileChange" />
              </label>
            </div>
            <p v-if="stlFileName" class="text-xs text-gray-400 mt-1 truncate">{{ stlFileName }}</p>
          </label>

          <div class="flex items-center justify-between mt-3">
            <span class="text-xs text-gray-400">Color</span>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full border border-gray-600" :style="{ background: accessoryColor }" />
              <input type="color" v-model="accessoryColor" class="color-input" />
            </div>
          </div>

          <button class="action-btn mt-3" :disabled="!stlBuffer" @click="handleLoadSTL">Load File</button>
        </section>

        <div class="border-t border-gray-800" />

        <!-- ⑤ Name + Save -->
        <section class="panel-section">
          <h3 class="panel-title">④ Name &amp; Save</h3>
          <input
            v-model="accessoryName"
            type="text"
            placeholder="e.g. Iron Helmet"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
          <p v-if="saveError" class="text-xs text-red-400 mt-1">{{ saveError }}</p>
          <button
            class="action-btn mt-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!previewActive"
            @click="handleSave"
          >
            Save to Builder
          </button>
        </section>

      </aside>

      <!-- ── 3D Viewport ──────────────────────────────────────────────────── -->
      <main class="flex-1 relative overflow-hidden">

        <!-- Transform mode toolbar -->
        <div class="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-gray-900/80 backdrop-blur px-3 py-2 rounded-xl border border-gray-700 shadow-lg">
          <button v-for="m in (['translate', 'rotate', 'scale'] as const)" :key="m"
            :class="['mode-btn', transformMode === m ? 'mode-btn--active' : '']"
            @click="transformMode = m; editor?.setMode(m)"
          >{{ m[0].toUpperCase() + m.slice(1) }}</button>
        </div>

        <!-- Hint -->
        <div v-if="!previewActive" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p class="text-gray-600 text-sm text-center px-6">
            Configure a shape in the left panel,<br>then click <strong class="text-gray-500">Preview</strong> to place it on the skeleton.
          </p>
        </div>

        <canvas ref="canvasEl" class="w-full h-full block" />
      </main>

    </div>
  </div>
</template>

<!-- Inline sub-components ──────────────────────────────────────────────────── -->
<script lang="ts">
import { defineComponent, h } from 'vue'

// Numeric param row with label + number input
const ParamRow = defineComponent({
  props: { label: String, modelValue: Number, min: Number, max: Number, step: Number },
  emits: ['update:modelValue'],
  render() {
    return h('label', { class: 'flex items-center justify-between gap-3' }, [
      h('span', { class: 'text-xs text-gray-400 shrink-0' }, this.label),
      h('input', {
        type: 'number',
        value: this.modelValue,
        min: this.min,
        max: this.max,
        step: this.step ?? 1,
        class: 'w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 text-right focus:outline-none focus:border-indigo-500',
        onInput: (e: Event) => {
          this.$emit('update:modelValue', parseFloat((e.target as HTMLInputElement).value))
        },
      }),
    ])
  },
})

export default { components: { ParamRow } }
</script>

<style scoped>
.panel-section { @apply flex flex-col gap-2; }
.panel-title   { @apply text-xs font-semibold text-gray-400 uppercase tracking-widest; }

.radio-label {
  @apply flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer select-none;
}

.shape-btn {
  @apply px-1 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-300
         hover:bg-gray-700 hover:border-gray-600 hover:text-white transition-all cursor-pointer text-center capitalize;
}
.shape-btn--active {
  @apply bg-indigo-600/25 border-indigo-500 text-indigo-200;
}

.action-btn {
  @apply w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium text-gray-200
         transition-all duration-150 cursor-pointer text-center select-none;
}

.mode-btn {
  @apply px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-all cursor-pointer;
}
.mode-btn--active {
  @apply bg-indigo-600/30 text-indigo-200 border border-indigo-500/60;
}

.color-input {
  @apply w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0;
}
.color-input::-webkit-color-swatch-wrapper { padding: 0; }
.color-input::-webkit-color-swatch { border: none; border-radius: 4px; }
</style>
