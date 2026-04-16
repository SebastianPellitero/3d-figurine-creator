import { defineStore } from 'pinia'

// ─── Slot keys ────────────────────────────────────────────────────────────────
export type SlotKey = 'hat' | 'top' | 'bottom' | 'leftHand' | 'rightHand' | 'back'

// ─── Primitive geometry ───────────────────────────────────────────────────────
export type PrimitiveType = 'sphere' | 'cylinder' | 'box' | 'cone'

export interface PrimitiveParams {
  type: PrimitiveType
  radius?: number          // sphere
  radiusTop?: number       // cylinder
  radiusBottom?: number    // cylinder / cone
  height?: number          // cylinder / cone / box
  width?: number           // box
  depth?: number           // box
  segments?: number
}

// ─── Custom accessory ─────────────────────────────────────────────────────────
export interface CustomAccessory {
  id: string               // e.g. 'hat_1713000000000'
  name: string
  slot: SlotKey
  geometry:
    | { kind: 'primitive'; params: PrimitiveParams }
    | { kind: 'stl'; dataB64: string }  // base64 binary STL
  color: string            // hex
  position: [number, number, number]
  rotation: [number, number, number]   // Euler XYZ radians
  scale:    [number, number, number]
}

// ─── Figure state ─────────────────────────────────────────────────────────────
export interface FigureState {
  hat:         string   // 'none' or CustomAccessory.id
  top:         string
  bottom:      string
  leftHand:    string
  rightHand:   string
  back:        string
  bodyColor:      string
  clothingColor:  string
  accessoryColor: string
  customAccessories: Record<string, CustomAccessory>
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useFigureStore = defineStore('figure', {
  state: (): FigureState => ({
    hat:         'none',
    top:         'none',
    bottom:      'none',
    leftHand:    'none',
    rightHand:   'none',
    back:        'none',
    bodyColor:      '#d4a574',
    clothingColor:  '#7a7a8a',
    accessoryColor: '#b8b8c8',
    customAccessories: {},
  }),

  actions: {
    saveAccessory(acc: CustomAccessory) {
      this.customAccessories[acc.id] = acc
      this[acc.slot] = acc.id
    },

    deleteAccessory(id: string) {
      const acc = this.customAccessories[id]
      if (acc && this[acc.slot] === id) this[acc.slot] = 'none'
      delete this.customAccessories[id]
    },
  },
})
