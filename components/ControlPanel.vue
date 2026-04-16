<script setup lang="ts">
import { ref } from 'vue'
import { useFigureStore } from '~/stores/figure'

const store = useFigureStore()

const open = ref({ head: true, top: true, bottom: true, hands: true, back: true, colors: true })
</script>

<template>
  <aside class="w-72 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto flex flex-col">

    <!-- Brand -->
    <div class="px-5 py-4 border-b border-gray-800">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-widest">Figure Builder</h2>
      <p class="text-xs text-gray-600 mt-0.5">32 mm Heroic Scale</p>
    </div>

    <div class="flex-1 px-4 py-3 space-y-2">

      <!-- ── Head ────────────────────────────────────────────────────────────── -->
      <section>
        <button class="section-toggle" @click="open.head = !open.head">
          <span class="flex items-center gap-2"><span>⛑</span> Head</span>
          <chevron :open="open.head" />
        </button>
        <transition name="collapse">
          <div v-if="open.head" class="pb-3">
            <slot-row slot-key="hat" label="Head" :store="store" />
          </div>
        </transition>
      </section>

      <div class="border-t border-gray-800" />

      <!-- ── Upper Body ───────────────────────────────────────────────────────── -->
      <section>
        <button class="section-toggle" @click="open.top = !open.top">
          <span class="flex items-center gap-2"><span>🛡</span> Upper Body</span>
          <chevron :open="open.top" />
        </button>
        <transition name="collapse">
          <div v-if="open.top" class="pb-3">
            <slot-row slot-key="top" label="Upper Body" :store="store" />
          </div>
        </transition>
      </section>

      <div class="border-t border-gray-800" />

      <!-- ── Lower Body ───────────────────────────────────────────────────────── -->
      <section>
        <button class="section-toggle" @click="open.bottom = !open.bottom">
          <span class="flex items-center gap-2"><span>🦵</span> Lower Body</span>
          <chevron :open="open.bottom" />
        </button>
        <transition name="collapse">
          <div v-if="open.bottom" class="pb-3">
            <slot-row slot-key="bottom" label="Lower Body" :store="store" />
          </div>
        </transition>
      </section>

      <div class="border-t border-gray-800" />

      <!-- ── Held Items ────────────────────────────────────────────────────────── -->
      <section>
        <button class="section-toggle" @click="open.hands = !open.hands">
          <span class="flex items-center gap-2"><span>⚔️</span> Held Items</span>
          <chevron :open="open.hands" />
        </button>
        <transition name="collapse">
          <div v-if="open.hands" class="space-y-2 pb-3">
            <p class="text-xs text-gray-500 px-1 font-medium uppercase tracking-wider">Left Hand</p>
            <slot-row slot-key="leftHand" label="Left Hand" :store="store" />
            <p class="text-xs text-gray-500 px-1 font-medium uppercase tracking-wider mt-2">Right Hand</p>
            <slot-row slot-key="rightHand" label="Right Hand" :store="store" />
          </div>
        </transition>
      </section>

      <div class="border-t border-gray-800" />

      <!-- ── Back ─────────────────────────────────────────────────────────────── -->
      <section>
        <button class="section-toggle" @click="open.back = !open.back">
          <span class="flex items-center gap-2"><span>🧣</span> Back</span>
          <chevron :open="open.back" />
        </button>
        <transition name="collapse">
          <div v-if="open.back" class="pb-3">
            <slot-row slot-key="back" label="Back" :store="store" />
          </div>
        </transition>
      </section>

      <div class="border-t border-gray-800" />

      <!-- ── Colors ────────────────────────────────────────────────────────────── -->
      <section>
        <button class="section-toggle" @click="open.colors = !open.colors">
          <span class="flex items-center gap-2"><span>🎨</span> Colors</span>
          <chevron :open="open.colors" />
        </button>
        <transition name="collapse">
          <div v-if="open.colors" class="space-y-3 pb-3">
            <label class="color-row">
              <span class="text-xs text-gray-400">Skin</span>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full border border-gray-600" :style="{ background: store.bodyColor }" />
                <input type="color" :value="store.bodyColor" class="color-input"
                  @input="store.bodyColor = ($event.target as HTMLInputElement).value" />
              </div>
            </label>
            <label class="color-row">
              <span class="text-xs text-gray-400">Accessory Color</span>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full border border-gray-600" :style="{ background: store.clothingColor }" />
                <input type="color" :value="store.clothingColor" class="color-input"
                  @input="store.clothingColor = ($event.target as HTMLInputElement).value" />
              </div>
            </label>
          </div>
        </transition>
      </section>

    </div>
  </aside>
</template>

<!-- Reusable chevron icon -->
<script lang="ts">
import { defineComponent, h } from 'vue'
const Chevron = defineComponent({
  props: { open: Boolean },
  render() {
    return h('svg', {
      class: ['w-4 h-4 transition-transform duration-200', this.open ? 'rotate-180' : ''],
      fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor'
    }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 9l-7 7-7-7' })])
  }
})
export default { components: { Chevron } }
</script>

<style scoped>
.section-toggle {
  @apply w-full flex items-center justify-between py-2 text-left text-sm font-medium text-gray-300 hover:text-white transition-colors;
}
.option-btn {
  @apply flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-lg
         bg-gray-800 border border-gray-700 text-gray-300
         hover:bg-gray-700 hover:border-gray-600 hover:text-white
         transition-all duration-150 cursor-pointer text-center select-none;
}
.option-btn--active {
  @apply bg-indigo-600/25 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20;
}
.color-row {
  @apply flex items-center justify-between px-1 cursor-pointer;
}
.color-input {
  @apply w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0;
}
.color-input::-webkit-color-swatch-wrapper { padding: 0; }
.color-input::-webkit-color-swatch { border: none; border-radius: 4px; }

.collapse-enter-active, .collapse-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top;
}
.collapse-enter-from, .collapse-leave-to { opacity: 0; transform: scaleY(0.95); }
</style>
