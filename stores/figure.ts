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

// ─── Accessory part (one mesh within an accessory) ───────────────────────────
export interface AccessoryPart {
  geometry:
    | { kind: 'primitive'; params: PrimitiveParams }
    | { kind: 'stl'; dataB64: string }
  color: string
  position: [number, number, number]
  rotation: [number, number, number]   // Euler XYZ radians
  scale:    [number, number, number]
}

// ─── Custom accessory (one or more parts) ─────────────────────────────────────
export interface CustomAccessory {
  id: string               // e.g. 'hat_1713000000000'
  name: string
  slot: SlotKey
  parts: AccessoryPart[]
}

// ─── Pose data ────────────────────────────────────────────────────────────────
export type PoseData = Record<string, [number, number, number]>  // boneName → [rx, ry, rz]

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
  pose:            PoseData
  poseGroundOffset: number
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
    pose: {},
    poseGroundOffset: 0,
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

    savePose(pose: PoseData, groundOffset: number) {
      this.pose = pose
      this.poseGroundOffset = groundOffset
    },

    resetPose() {
      this.pose = {}
      this.poseGroundOffset = 0
    },
  },
})
