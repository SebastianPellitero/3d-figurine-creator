import { defineStore } from 'pinia'

export type HatOption =
  | 'none' | 'open_helmet' | 'full_helmet' | 'horned_helmet'
  | 'wizard_hat' | 'hood' | 'crown' | 'circlet'

export type TopOption =
  | 'none' | 'plate_armor' | 'chainmail' | 'leather_armor' | 'robe' | 'studded_leather'

export type BottomOption =
  | 'none' | 'plate_legs' | 'chainmail_legs' | 'leather_pants' | 'robe_bottom'

export type ItemOption =
  | 'none' | 'longsword' | 'greatsword' | 'dagger' | 'battleaxe'
  | 'warhammer' | 'spear' | 'mace' | 'round_shield' | 'kite_shield'
  | 'staff' | 'torch'

export type BackOption = 'none' | 'cloak' | 'quiver'

export interface FigureState {
  hat: HatOption
  top: TopOption
  bottom: BottomOption
  leftHand: ItemOption
  rightHand: ItemOption
  back: BackOption
  bodyColor: string
  clothingColor: string
  accessoryColor: string
}

export const useFigureStore = defineStore('figure', {
  state: (): FigureState => ({
    hat: 'open_helmet',
    top: 'plate_armor',
    bottom: 'plate_legs',
    leftHand: 'round_shield',
    rightHand: 'longsword',
    back: 'none',
    bodyColor: '#d4a574',
    clothingColor: '#7a7a8a',
    accessoryColor: '#b8b8c8'
  })
})
