<script setup lang="ts">
import type { useFigureStore } from '~/stores/figure'

const props = defineProps<{
  slotKey: string
  label: string
  store: ReturnType<typeof useFigureStore>
}>()
</script>

<template>
  <div class="space-y-2">
    <!-- Current assignment -->
    <div v-if="(store as any)[slotKey] !== 'none'" class="flex items-center justify-between px-1 py-1">
      <span class="text-sm text-gray-200 truncate max-w-[140px]">
        {{ store.customAccessories[(store as any)[slotKey]]?.name ?? 'Unknown' }}
      </span>
      <button
        class="text-xs text-red-400 hover:text-red-300 transition-colors ml-2 shrink-0"
        @click="store.deleteAccessory((store as any)[slotKey])"
      >
        Remove
      </button>
    </div>
    <div v-else class="text-xs text-gray-500 px-1 py-1 italic">
      No accessory assigned
    </div>

    <!-- Add / Edit button -->
    <NuxtLink
      :to="`/accessories?slot=${slotKey}`"
      class="option-btn w-full flex items-center justify-center gap-1 py-2"
    >
      <span class="text-base leading-none">＋</span>
      <span class="text-xs">Add / Edit</span>
    </NuxtLink>
  </div>
</template>
