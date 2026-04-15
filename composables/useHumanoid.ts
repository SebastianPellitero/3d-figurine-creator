import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { FigureState } from '~/stores/figure'

// ─── Scale: 1 unit = 1 mm, figure ~38–40 mm tall (32 mm heroic D&D scale) ────

// ─── Material helpers ─────────────────────────────────────────────────────────
function mat(color: string, roughness = 0.7, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}
function metalMat(color: string) { return mat(color, 0.25, 0.65) }

// ─── Mesh helper ──────────────────────────────────────────────────────────────
function mk(
  geo: THREE.BufferGeometry,
  m: THREE.Material,
  x = 0, y = 0, z = 0,
  rx = 0, ry = 0, rz = 0
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, m)
  mesh.position.set(x, y, z)
  mesh.rotation.set(rx, ry, rz)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

// ─── Heroic D&D body (32 mm scale, 1 unit = 1 mm) ───────────────────────────
function buildBody(bodyMat: THREE.MeshStandardMaterial): THREE.Group {
  const g = new THREE.Group()
  const eyeM = mat('#111122', 0.2)

  // Head (heroic: bigger than realistic)
  g.add(mk(new THREE.SphereGeometry(3.5, 20, 16), bodyMat, 0, 38, 0))
  // Eyes
  g.add(mk(new THREE.SphereGeometry(0.9, 8, 8), eyeM, -2, 38.5, 3.2))
  g.add(mk(new THREE.SphereGeometry(0.9, 8, 8), eyeM,  2, 38.5, 3.2))
  // Neck
  g.add(mk(new THREE.CylinderGeometry(1.8, 2.4, 3.5, 12), bodyMat, 0, 32.75, 0))
  // Torso (heroic: wide 15 mm)
  g.add(mk(new THREE.BoxGeometry(15, 10, 7.5), bodyMat, 0, 26, 0))
  // Pelvis
  g.add(mk(new THREE.BoxGeometry(13, 4, 7), bodyMat, 0, 19, 0))

  // ── Arms ──────────────────────────────────────────────────────────────────
  // Left upper arm
  g.add(mk(new THREE.CylinderGeometry(1.8, 2.2, 8, 12), bodyMat, -10, 26, 0, 0, 0, 0.22))
  // Left lower arm
  g.add(mk(new THREE.CylinderGeometry(1.5, 1.8, 7.5, 12), bodyMat, -12.5, 18.5, 0, 0, 0, 0.1))
  // Left hand
  g.add(mk(new THREE.SphereGeometry(2, 10, 8), bodyMat, -13.5, 14, 0))

  // Right upper arm
  g.add(mk(new THREE.CylinderGeometry(1.8, 2.2, 8, 12), bodyMat,  10, 26, 0, 0, 0, -0.22))
  // Right lower arm
  g.add(mk(new THREE.CylinderGeometry(1.5, 1.8, 7.5, 12), bodyMat,  12.5, 18.5, 0, 0, 0, -0.1))
  // Right hand
  g.add(mk(new THREE.SphereGeometry(2, 10, 8), bodyMat,  13.5, 14, 0))

  // ── Legs ──────────────────────────────────────────────────────────────────
  // Left upper leg
  g.add(mk(new THREE.CylinderGeometry(2.5, 3, 8, 12), bodyMat, -4, 13, 0))
  // Left lower leg
  g.add(mk(new THREE.CylinderGeometry(1.8, 2.2, 7, 12), bodyMat, -4, 5.5, 0))
  // Left foot
  g.add(mk(new THREE.BoxGeometry(4.5, 2, 7.5), bodyMat, -4, 1, 1.5))

  // Right upper leg
  g.add(mk(new THREE.CylinderGeometry(2.5, 3, 8, 12), bodyMat,  4, 13, 0))
  // Right lower leg
  g.add(mk(new THREE.CylinderGeometry(1.8, 2.2, 7, 12), bodyMat,  4, 5.5, 0))
  // Right foot
  g.add(mk(new THREE.BoxGeometry(4.5, 2, 7.5), bodyMat,  4, 1, 1.5))

  return g
}

// ─── HEAD accessories ─────────────────────────────────────────────────────────
function buildHat(type: string, color: string): THREE.Group | null {
  const g = new THREE.Group()
  const m = metalMat(color)
  const leather = mat(color, 0.75)

  switch (type) {
    case 'open_helmet': {
      // Skullcap
      g.add(mk(new THREE.SphereGeometry(3.8, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), m, 0, 38, 0))
      // Nasal guard
      g.add(mk(new THREE.BoxGeometry(0.8, 4, 0.8), m, 0, 35.5, -3.6))
      // Cheek guards
      g.add(mk(new THREE.BoxGeometry(1.2, 3.5, 1), m, -3.3, 35, -2.2))
      g.add(mk(new THREE.BoxGeometry(1.2, 3.5, 1), m,  3.3, 35, -2.2))
      // Rim brow band
      g.add(mk(new THREE.TorusGeometry(3.7, 0.5, 8, 20, Math.PI * 1.4), m, 0, 34.2, 0, Math.PI / 2, 0, -Math.PI * 0.7))
      break
    }
    case 'full_helmet': {
      // Full dome
      g.add(mk(new THREE.SphereGeometry(3.9, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.72), m, 0, 38, 0))
      // Face plate (front)
      g.add(mk(new THREE.BoxGeometry(6.5, 5, 1), m, 0, 35.5, -3.5))
      // T-visor horizontal slit
      g.add(mk(new THREE.BoxGeometry(5, 0.8, 1.2), mat('#111', 0.1), 0, 36.8, -4))
      // T-visor vertical bar
      g.add(mk(new THREE.BoxGeometry(0.8, 4, 1.2), mat('#111', 0.1), 0, 35, -4))
      // Neck guard (back)
      g.add(mk(new THREE.BoxGeometry(6, 2.5, 1.5), m, 0, 33.5, 3.2))
      break
    }
    case 'horned_helmet': {
      // Skull bowl
      g.add(mk(new THREE.SphereGeometry(3.8, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(color, 0.5, 0.3), 0, 38, 0))
      // Left horn
      const lHorn = new THREE.CylinderGeometry(0.3, 0.9, 10, 8)
      g.add(mk(lHorn, m, -6, 42, 0, 0, 0, -0.5))
      // Right horn
      const rHorn = new THREE.CylinderGeometry(0.3, 0.9, 10, 8)
      g.add(mk(rHorn, m,  6, 42, 0, 0, 0,  0.5))
      // Brow band
      g.add(mk(new THREE.CylinderGeometry(3.8, 3.8, 0.8, 20), m, 0, 34.5, 0))
      break
    }
    case 'wizard_hat': {
      const clothM = mat(color, 0.8)
      // Wide brim
      g.add(mk(new THREE.CylinderGeometry(7, 7.2, 1, 24), clothM, 0, 42.5, 0))
      // Tall cone (slightly curved by tapering)
      g.add(mk(new THREE.ConeGeometry(3.5, 18, 20), clothM, 0, 52.5, 0))
      // Band at base of cone
      g.add(mk(new THREE.TorusGeometry(3.5, 0.5, 8, 20), mat('#c0a000', 0.4, 0.5), 0, 43.8, 0, Math.PI / 2))
      // Star detail
      g.add(mk(new THREE.SphereGeometry(0.6, 6, 6), mat('#ffe000', 0.1, 0.2), 0, 61.5, 0))
      break
    }
    case 'hood': {
      const clothM = mat(color, 0.85)
      // Back dome (half sphere)
      g.add(mk(new THREE.SphereGeometry(4.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), clothM, 0, 38.5, 1))
      // Front drape (partial torus to frame face)
      g.add(mk(new THREE.TorusGeometry(3.6, 0.9, 8, 18, Math.PI), clothM, 0, 38, -0.5, -Math.PI / 2, 0, 0))
      // Neck drape
      g.add(mk(new THREE.CylinderGeometry(3.8, 4.5, 5, 18, 1, true), clothM, 0, 33, 0))
      break
    }
    case 'crown': {
      const goldM = mat('#ffd700', 0.2, 0.8)
      g.add(mk(new THREE.CylinderGeometry(3.8, 4, 1.8, 20), goldM, 0, 42.2, 0))
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        g.add(mk(new THREE.ConeGeometry(0.55, 2.2, 6), goldM, Math.cos(a) * 3.5, 44.7, Math.sin(a) * 3.5))
      }
      const gemM = new THREE.MeshStandardMaterial({ color: '#ff4466', roughness: 0.1, metalness: 0.2, emissive: '#ff2244', emissiveIntensity: 0.4 })
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 5
        g.add(mk(new THREE.SphereGeometry(0.4, 8, 6), gemM, Math.cos(a) * 3.9, 42.2, Math.sin(a) * 3.9))
      }
      break
    }
    case 'circlet': {
      const silverM = metalMat(color)
      g.add(mk(new THREE.TorusGeometry(3.7, 0.45, 8, 28), silverM, 0, 37, 0, Math.PI / 2))
      // Gem centerpiece
      const gemM = new THREE.MeshStandardMaterial({ color: '#4488ff', roughness: 0.05, emissive: '#2244ff', emissiveIntensity: 0.3 })
      g.add(mk(new THREE.SphereGeometry(0.7, 10, 8), gemM, 0, 37, -3.7))
      break
    }
    default: return null
  }
  return g
}

// ─── UPPER BODY accessories ───────────────────────────────────────────────────
function buildTop(type: string, color: string): THREE.Group | null {
  const g = new THREE.Group()

  switch (type) {
    case 'plate_armor': {
      const m = metalMat(color)
      const dark = mat('#1a1a2e', 0.4, 0.7)
      // Breastplate
      g.add(mk(new THREE.BoxGeometry(14.5, 9.5, 8), m, 0, 26, 0))
      // Breastplate center ridge
      g.add(mk(new THREE.BoxGeometry(1, 8, 1.5), dark, 0, 26, -4.5))
      // Left pauldron (shoulder pad)
      g.add(mk(new THREE.BoxGeometry(5, 2.5, 5.5), m, -10, 31.5, 0))
      g.add(mk(new THREE.SphereGeometry(2.8, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), m, -10, 33, 0))
      // Right pauldron
      g.add(mk(new THREE.BoxGeometry(5, 2.5, 5.5), m,  10, 31.5, 0))
      g.add(mk(new THREE.SphereGeometry(2.8, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), m,  10, 33, 0))
      // Left vambrace (upper arm)
      g.add(mk(new THREE.CylinderGeometry(2.2, 2.5, 7, 10), m, -10, 26, 0, 0, 0, 0.22))
      // Right vambrace
      g.add(mk(new THREE.CylinderGeometry(2.2, 2.5, 7, 10), m,  10, 26, 0, 0, 0, -0.22))
      // Gorget (neck)
      g.add(mk(new THREE.CylinderGeometry(2.6, 3.2, 2.5, 14), m, 0, 32, 0))
      // Tasset (waist flaps)
      g.add(mk(new THREE.BoxGeometry(4.5, 3.5, 1.5), m, -4.5, 21.5, -3.5))
      g.add(mk(new THREE.BoxGeometry(4.5, 3.5, 1.5), m,  4.5, 21.5, -3.5))
      break
    }
    case 'chainmail': {
      const m = mat(color, 0.6, 0.3)
      // Mail shirt body
      g.add(mk(new THREE.CylinderGeometry(7, 8, 10, 16), m, 0, 25.5, 0))
      // Mail sleeves
      g.add(mk(new THREE.CylinderGeometry(2.1, 2.4, 8, 12), m, -10, 26, 0, 0, 0, 0.22))
      g.add(mk(new THREE.CylinderGeometry(1.8, 2.1, 7.5, 12), m, -12.5, 18.5, 0, 0, 0, 0.1))
      g.add(mk(new THREE.CylinderGeometry(2.1, 2.4, 8, 12), m,  10, 26, 0, 0, 0, -0.22))
      g.add(mk(new THREE.CylinderGeometry(1.8, 2.1, 7.5, 12), m,  12.5, 18.5, 0, 0, 0, -0.1))
      // Coif (head covering)
      g.add(mk(new THREE.SphereGeometry(3.9, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), m, 0, 38, 0))
      break
    }
    case 'leather_armor': {
      const m = mat(color, 0.8)
      const dark = mat('#2a1a0a', 0.9)
      // Breastplate
      g.add(mk(new THREE.BoxGeometry(13, 9, 7.5), m, 0, 26, 0))
      // Shoulder guards
      g.add(mk(new THREE.BoxGeometry(4.5, 2, 4.5), m, -9.5, 31, 0))
      g.add(mk(new THREE.BoxGeometry(4.5, 2, 4.5), m,  9.5, 31, 0))
      // Strap details
      g.add(mk(new THREE.BoxGeometry(1.2, 8, 0.8), dark, -2.5, 26, -4))
      g.add(mk(new THREE.BoxGeometry(1.2, 8, 0.8), dark,  2.5, 26, -4))
      // Waist band
      g.add(mk(new THREE.BoxGeometry(13.5, 1.5, 8), dark, 0, 21.5, 0))
      break
    }
    case 'robe': {
      const m = mat(color, 0.85)
      const trim = mat('#c0a000', 0.4, 0.3)
      // Robe body
      g.add(mk(new THREE.CylinderGeometry(7.5, 8.5, 12, 18), m, 0, 25, 0))
      // Wide sleeves
      g.add(mk(new THREE.CylinderGeometry(3.5, 2.5, 9, 12), m, -11.5, 25, 0, 0, 0, 0.35))
      g.add(mk(new THREE.CylinderGeometry(3.5, 2.5, 9, 12), m,  11.5, 25, 0, 0, 0, -0.35))
      // Gold trim at hem
      g.add(mk(new THREE.TorusGeometry(8, 0.6, 8, 20), trim, 0, 19.5, 0, Math.PI / 2))
      // Gold trim at collar
      g.add(mk(new THREE.TorusGeometry(3, 0.5, 8, 16), trim, 0, 31, 0, Math.PI / 2))
      // Belt cord
      g.add(mk(new THREE.TorusGeometry(7, 0.55, 8, 20), mat('#6b3a2a', 0.7), 0, 23.5, 0, Math.PI / 2))
      break
    }
    case 'studded_leather': {
      const m = mat(color, 0.8)
      const studM = metalMat('#aaaaaa')
      // Base leather
      g.add(mk(new THREE.BoxGeometry(13, 9, 7.5), m, 0, 26, 0))
      g.add(mk(new THREE.BoxGeometry(4, 1.8, 4), m, -9, 30.5, 0))
      g.add(mk(new THREE.BoxGeometry(4, 1.8, 4), m,  9, 30.5, 0))
      // Stud grid (front face)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          g.add(mk(new THREE.SphereGeometry(0.4, 6, 5), studM,
            -4.5 + col * 3, 22 + row * 3, -3.9))
        }
      }
      break
    }
    default: return null
  }
  return g
}

// ─── LOWER BODY accessories ───────────────────────────────────────────────────
function buildBottom(type: string, color: string): THREE.Group | null {
  const g = new THREE.Group()

  switch (type) {
    case 'plate_legs': {
      const m = metalMat(color)
      const dark = mat('#1a1a2e', 0.4, 0.7)
      // Faulds (hip plates)
      g.add(mk(new THREE.BoxGeometry(13.5, 3.5, 7.5), m, 0, 19, 0))
      // Left cuisse (upper leg plate)
      g.add(mk(new THREE.CylinderGeometry(3, 3.3, 8, 12), m, -4, 13, 0))
      // Left greave (lower leg plate)
      g.add(mk(new THREE.CylinderGeometry(2.2, 2.5, 7, 12), m, -4, 5.5, 0))
      // Left sabaton (foot plate)
      g.add(mk(new THREE.BoxGeometry(5, 2.2, 8), m, -4, 1, 1.8))
      // Right cuisse
      g.add(mk(new THREE.CylinderGeometry(3, 3.3, 8, 12), m,  4, 13, 0))
      // Right greave
      g.add(mk(new THREE.CylinderGeometry(2.2, 2.5, 7, 12), m,  4, 5.5, 0))
      // Right sabaton
      g.add(mk(new THREE.BoxGeometry(5, 2.2, 8), m,  4, 1, 1.8))
      // Knee cops
      g.add(mk(new THREE.SphereGeometry(2.5, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), m, -4, 9.5, -2.5))
      g.add(mk(new THREE.SphereGeometry(2.5, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), m,  4, 9.5, -2.5))
      // Poleyn details
      g.add(mk(new THREE.BoxGeometry(3, 0.8, 1), dark, -4, 9.5, -4.5))
      g.add(mk(new THREE.BoxGeometry(3, 0.8, 1), dark,  4, 9.5, -4.5))
      break
    }
    case 'chainmail_legs': {
      const m = mat(color, 0.55, 0.35)
      g.add(mk(new THREE.CylinderGeometry(12.5, 10, 3.5, 18), m, 0, 19, 0))
      g.add(mk(new THREE.CylinderGeometry(3, 3.2, 8, 12), m, -4, 13, 0))
      g.add(mk(new THREE.CylinderGeometry(2.2, 2.6, 7, 12), m, -4, 5.5, 0))
      g.add(mk(new THREE.CylinderGeometry(3, 3.2, 8, 12), m,  4, 13, 0))
      g.add(mk(new THREE.CylinderGeometry(2.2, 2.6, 7, 12), m,  4, 5.5, 0))
      break
    }
    case 'leather_pants': {
      const m = mat(color, 0.8)
      const dark = mat('#2a1a0a', 0.9)
      g.add(mk(new THREE.BoxGeometry(13, 3.5, 7), m, 0, 19, 0))
      g.add(mk(new THREE.CylinderGeometry(2.8, 3.1, 8, 12), m, -4, 13, 0))
      g.add(mk(new THREE.CylinderGeometry(2.1, 2.5, 7, 12), m, -4, 5.5, 0))
      g.add(mk(new THREE.CylinderGeometry(2.8, 3.1, 8, 12), m,  4, 13, 0))
      g.add(mk(new THREE.CylinderGeometry(2.1, 2.5, 7, 12), m,  4, 5.5, 0))
      // Belt
      g.add(mk(new THREE.BoxGeometry(14, 1.8, 7.5), dark, 0, 21.2, 0))
      // Buckle
      g.add(mk(new THREE.BoxGeometry(2.5, 1.8, 0.8), metalMat('#aaaaaa'), 0, 21.2, -4))
      break
    }
    case 'robe_bottom': {
      const m = mat(color, 0.85)
      const trim = mat('#c0a000', 0.4, 0.3)
      // Flowing skirt
      g.add(mk(new THREE.CylinderGeometry(8, 11, 18, 20), m, 0, 12, 0))
      // Trim at hem
      g.add(mk(new THREE.TorusGeometry(10.5, 0.65, 8, 22), trim, 0, 3, 0, Math.PI / 2))
      break
    }
    default: return null
  }
  return g
}

// ─── HAND ITEMS ───────────────────────────────────────────────────────────────
function buildItem(type: string, color: string): THREE.Group | null {
  const g = new THREE.Group()
  const silver = metalMat('#c0c8d8')
  const wood = mat('#8b5e3c', 0.8)
  const m = metalMat(color)

  switch (type) {
    case 'longsword': {
      // Blade
      g.add(mk(new THREE.BoxGeometry(0.9, 24, 0.5), silver, 0, 12, 0))
      // Tip
      g.add(mk(new THREE.CylinderGeometry(0, 0.45, 3.5, 4), silver, 0, 25.5, 0))
      // Cross-guard
      g.add(mk(new THREE.BoxGeometry(7, 1, 1), m, 0, 0.5, 0))
      // Grip
      g.add(mk(new THREE.CylinderGeometry(0.7, 0.7, 6, 8), wood, 0, -3.5, 0))
      // Pommel
      g.add(mk(new THREE.SphereGeometry(1.2, 8, 6), m, 0, -7, 0))
      break
    }
    case 'greatsword': {
      // Wide blade
      g.add(mk(new THREE.BoxGeometry(1.4, 34, 0.6), silver, 0, 17, 0))
      // Tip
      g.add(mk(new THREE.CylinderGeometry(0, 0.7, 4.5, 4), silver, 0, 35.5, 0))
      // Cross-guard (wider)
      g.add(mk(new THREE.BoxGeometry(10, 1.2, 1.2), m, 0, 0.5, 0))
      g.add(mk(new THREE.SphereGeometry(0.8, 6, 5), m, -5.2, 0.5, 0))
      g.add(mk(new THREE.SphereGeometry(0.8, 6, 5), m,  5.2, 0.5, 0))
      // Two-handed grip (longer)
      g.add(mk(new THREE.CylinderGeometry(0.8, 0.8, 9, 8), wood, 0, -5, 0))
      // Pommel
      g.add(mk(new THREE.CylinderGeometry(1.5, 0.8, 2, 8), m, 0, -10.5, 0))
      break
    }
    case 'dagger': {
      g.add(mk(new THREE.BoxGeometry(0.7, 12, 0.4), silver, 0, 6, 0))
      g.add(mk(new THREE.CylinderGeometry(0, 0.35, 2.5, 4), silver, 0, 13.2, 0))
      g.add(mk(new THREE.BoxGeometry(4, 0.8, 0.8), m, 0, 0, 0))
      g.add(mk(new THREE.CylinderGeometry(0.55, 0.55, 4, 8), wood, 0, -2.5, 0))
      g.add(mk(new THREE.SphereGeometry(0.8, 8, 6), m, 0, -5, 0))
      break
    }
    case 'battleaxe': {
      // Haft
      g.add(mk(new THREE.CylinderGeometry(0.7, 0.8, 22, 8), wood, 0, 9, 0))
      // Axe head (main blade)
      g.add(mk(new THREE.BoxGeometry(0.8, 9, 7), m, -2.5, 20, 0))
      // Curved blade edge (wedge)
      const bGeo = new THREE.CylinderGeometry(7, 7, 0.8, 16, 1, false, -Math.PI * 0.2, Math.PI * 0.4)
      g.add(mk(bGeo, m, -6.5, 20, 0, Math.PI / 2, 0, 0))
      // Butt spike
      g.add(mk(new THREE.ConeGeometry(0.7, 3, 8), m, 0, -2.5, 0, Math.PI, 0, 0))
      break
    }
    case 'warhammer': {
      // Haft
      g.add(mk(new THREE.CylinderGeometry(0.7, 0.8, 20, 8), wood, 0, 8, 0))
      // Hammer head
      g.add(mk(new THREE.BoxGeometry(4.5, 6, 4.5), m, 0, 19.5, 0))
      // Face details
      g.add(mk(new THREE.BoxGeometry(3.8, 0.5, 3.8), metalMat('#888'), 0, 22.8, 0))
      g.add(mk(new THREE.BoxGeometry(3.8, 0.5, 3.8), metalMat('#888'), 0, 16.2, 0))
      // Spike on top
      g.add(mk(new THREE.ConeGeometry(0.7, 3.5, 8), m, 0, 25, 0))
      break
    }
    case 'spear': {
      // Long shaft
      g.add(mk(new THREE.CylinderGeometry(0.65, 0.75, 40, 8), wood, 0, 15, 0))
      // Leaf-shaped tip
      g.add(mk(new THREE.CylinderGeometry(0, 1.2, 8, 6), silver, 0, 37, 0))
      g.add(mk(new THREE.CylinderGeometry(1.2, 0.7, 2, 8), silver, 0, 33.2, 0))
      // Butt end
      g.add(mk(new THREE.ConeGeometry(0.7, 3, 8), m, 0, -5.5, 0, Math.PI, 0, 0))
      break
    }
    case 'mace': {
      // Haft
      g.add(mk(new THREE.CylinderGeometry(0.7, 0.8, 18, 8), wood, 0, 7, 0))
      // Flanged head
      g.add(mk(new THREE.SphereGeometry(2.8, 10, 8), m, 0, 17.5, 0))
      // Flanges (6 fins radiating out)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        const fin = new THREE.BoxGeometry(0.6, 4, 1.8)
        g.add(mk(fin, m, Math.cos(a) * 2.8, 17.5, Math.sin(a) * 2.8, 0, a, 0))
      }
      break
    }
    case 'round_shield': {
      // Main disc
      g.add(mk(new THREE.CylinderGeometry(10, 10, 1, 28), m, 0, 0, 0, Math.PI / 2, 0, 0))
      // Rim
      g.add(mk(new THREE.TorusGeometry(10, 0.6, 8, 28), metalMat('#888888'), 0, 0, 0, Math.PI / 2))
      // Boss (center knob)
      g.add(mk(new THREE.SphereGeometry(2, 10, 8), m, 0, 0, 1))
      // Cross design
      g.add(mk(new THREE.BoxGeometry(1, 12, 0.7), metalMat('#888888'), 0, 0, 0.4))
      g.add(mk(new THREE.BoxGeometry(12, 1, 0.7), metalMat('#888888'), 0, 0, 0.4))
      break
    }
    case 'kite_shield': {
      // Kite (tapered rectangle + triangular bottom)
      g.add(mk(new THREE.BoxGeometry(11, 14, 1.5), m, 0, 4, 0))
      const kGeo = new THREE.CylinderGeometry(0, 5.5, 8, 3)
      g.add(mk(kGeo, m, 0, -4, 0, 0, 0, Math.PI / 6))
      // Rim
      g.add(mk(new THREE.BoxGeometry(0.8, 14, 0.5), metalMat('#888'), -5.5, 4, 0))
      g.add(mk(new THREE.BoxGeometry(0.8, 14, 0.5), metalMat('#888'),  5.5, 4, 0))
      // Cross detail
      g.add(mk(new THREE.BoxGeometry(0.8, 18, 0.6), metalMat('#888888'), 0, 3, 0.8))
      g.add(mk(new THREE.BoxGeometry(10, 0.8, 0.6), metalMat('#888888'), 0, 7, 0.8))
      break
    }
    case 'staff': {
      const orbM = new THREE.MeshStandardMaterial({ color: '#00e5cc', roughness: 0.05, metalness: 0.1, emissive: '#00e5cc', emissiveIntensity: 0.5 })
      const ringM = new THREE.MeshStandardMaterial({ color: '#00ffdd', emissive: '#00ffdd', emissiveIntensity: 0.6, transparent: true, opacity: 0.6 })
      g.add(mk(new THREE.CylinderGeometry(0.7, 0.9, 50, 8), wood, 0, 20, 0))
      g.add(mk(new THREE.CylinderGeometry(1, 1, 1.8, 8), m, 0, 46.5, 0))
      g.add(mk(new THREE.SphereGeometry(3, 14, 12), orbM, 0, 49.5, 0))
      g.add(mk(new THREE.TorusGeometry(3.5, 0.35, 8, 20), ringM, 0, 49.5, 0, Math.PI / 2))
      break
    }
    case 'torch': {
      const handleM = wood
      const flameM = new THREE.MeshStandardMaterial({ color: '#ff6600', roughness: 0.8, emissive: '#ff4400', emissiveIntensity: 0.8 })
      const glowM = new THREE.MeshStandardMaterial({ color: '#ffcc00', roughness: 0.8, emissive: '#ffaa00', emissiveIntensity: 0.6, transparent: true, opacity: 0.7 })
      g.add(mk(new THREE.CylinderGeometry(0.8, 1, 16, 8), handleM, 0, 6, 0))
      // Torch head wrap
      g.add(mk(new THREE.CylinderGeometry(1.4, 1, 4, 10), mat('#5a3010', 0.9), 0, 15.5, 0))
      // Flame layers
      g.add(mk(new THREE.ConeGeometry(1.8, 5, 8), flameM, 0, 20, 0))
      g.add(mk(new THREE.ConeGeometry(1.2, 4, 7), glowM, 0.5, 21, 0))
      g.add(mk(new THREE.ConeGeometry(0.7, 3, 6), mat('#ffff88', 0.1, 0, ), 0, 22.5, 0))
      break
    }
    default: return null
  }
  return g
}

// ─── BACK accessories ─────────────────────────────────────────────────────────
function buildBack(type: string, color: string): THREE.Group | null {
  const g = new THREE.Group()

  switch (type) {
    case 'cloak': {
      const m = mat(color, 0.85)
      const trim = mat('#c0a000', 0.4, 0.3)
      // Main cloak body — wide quad draping down the back
      g.add(mk(new THREE.BoxGeometry(16, 28, 1.2), m, 0, 19, 4.5))
      // Shoulder yoke
      g.add(mk(new THREE.BoxGeometry(18, 4, 2), m, 0, 31, 3.8))
      // Bottom hem — slightly flared
      g.add(mk(new THREE.BoxGeometry(18, 1.5, 1.2), m, 0, 5.5, 5.2))
      // Trim
      g.add(mk(new THREE.BoxGeometry(0.8, 28, 0.5), trim, -8, 19, 5.2))
      g.add(mk(new THREE.BoxGeometry(0.8, 28, 0.5), trim,  8, 19, 5.2))
      // Clasp at neck
      g.add(mk(new THREE.SphereGeometry(1.2, 8, 6), metalMat('#c0a000'), 0, 33.5, 2))
      break
    }
    case 'quiver': {
      const leatherM = mat('#5a3010', 0.8)
      const arrowM = metalMat('#aaaaaa')
      const woodM = mat('#8b5e3c', 0.8)
      // Quiver body (right shoulder)
      g.add(mk(new THREE.CylinderGeometry(2, 2.5, 16, 12), leatherM, 6, 26, 3.5))
      // Quiver bottom cap
      g.add(mk(new THREE.CylinderGeometry(2.5, 2.5, 1, 12), leatherM, 6, 17.5, 3.5))
      // Strap across body
      g.add(mk(new THREE.BoxGeometry(1.2, 22, 0.6), leatherM, 2.5, 24, 3))
      // Arrow shafts sticking out
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 1.2 - Math.PI * 0.3
        const ax = 6 + Math.cos(a) * 1.2
        const az = 3.5 + Math.sin(a) * 1.2
        g.add(mk(new THREE.CylinderGeometry(0.2, 0.2, 10, 5), woodM, ax, 36, az))
        g.add(mk(new THREE.ConeGeometry(0.3, 1.5, 5), arrowM, ax, 41.5, az))
      }
      break
    }
    default: return null
  }
  return g
}

// ─── Main composable ──────────────────────────────────────────────────────────
export function useHumanoid(canvas: HTMLCanvasElement) {
  const width  = canvas.clientWidth  || 800
  const height = canvas.clientHeight || 600

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f1117)
  scene.fog = new THREE.FogExp2(0x0f1117, 0.0025)

  // Camera — zoomed for 32–40 mm figure
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000)
  camera.position.set(0, 20, 90)

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 20, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 30
  controls.maxDistance = 220
  controls.maxPolarAngle = Math.PI * 0.9
  controls.update()

  // ── Lighting ──────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))

  const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.4)
  keyLight.position.set(72, 144, 96)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near = 1
  keyLight.shadow.camera.far = 400
  keyLight.shadow.camera.top    =  72
  keyLight.shadow.camera.bottom = -24
  keyLight.shadow.camera.left   = -48
  keyLight.shadow.camera.right  =  48
  keyLight.shadow.bias = -0.001
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x8ab0ff, 0.5)
  fillLight.position.set(-96, 72, -48)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
  rimLight.position.set(0, 96, -120)
  scene.add(rimLight)

  // ── Stage ──────────────────────────────────────────────────────────────────
  const floorMat = new THREE.MeshStandardMaterial({ color: '#1e2030', roughness: 0.9, metalness: 0.05 })
  const floor = new THREE.Mesh(new THREE.CircleGeometry(120, 48), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const platformMat = new THREE.MeshStandardMaterial({ color: '#252840', roughness: 0.6, metalness: 0.2 })
  scene.add(mk(new THREE.CylinderGeometry(22, 24, 1.5, 32), platformMat, 0, 0.75, 0))
  scene.add(new THREE.GridHelper(240, 24, 0x2a2d4a, 0x1e2035))

  // ── Figure groups ──────────────────────────────────────────────────────────
  const figureGroup    = new THREE.Group()
  const bodyGroup      = new THREE.Group()
  const accessoryGroup = new THREE.Group()
  const backGroup      = new THREE.Group()
  figureGroup.add(bodyGroup, backGroup, accessoryGroup)
  scene.add(figureGroup)

  // ── Shared body material (applied to Xbot meshes for skin tinting) ────────
  const bodyMat = mat('#d4a574')

  // ── Hand anchor positions — defaults match procedural body, updated after Xbot loads ──
  const handL = new THREE.Vector3(-13.5, 14, 0)
  const handR = new THREE.Vector3( 13.5, 14, 0)

  // ── Last known state — replayed after async model load ────────────────────
  let lastState: FigureState | null = null

  // ── Load Xbot.glb ─────────────────────────────────────────────────────────
  const loader = new GLTFLoader()
  loader.load(
    '/models/Xbot.glb',
    (gltf) => {
      const model = gltf.scene

      // Scale so total height ≈ 38 mm (1 unit = 1 mm)
      const box = new THREE.Box3().setFromObject(model)
      const modelHeight = box.max.y - box.min.y
      const scale = 38 / modelHeight
      model.scale.setScalar(scale)

      // Place feet at y = 0
      const box2 = new THREE.Box3().setFromObject(model)
      model.position.y = -box2.min.y

      // Replace materials with body mat so skin color picker works
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        child.castShadow = true
        child.receiveShadow = true
        child.material = bodyMat
      })

      bodyGroup.add(model)

      // Force world matrix update so getWorldPosition is accurate
      scene.updateMatrixWorld(true)

      // Read real hand bone world positions
      model.traverse((node) => {
        const wp = new THREE.Vector3()
        node.getWorldPosition(wp)
        if (node.name === 'mixamorigLeftHand')  handL.copy(wp)
        if (node.name === 'mixamorigRightHand') handR.copy(wp)
      })

      // Re-apply current accessories now that bone positions are correct
      if (lastState) updateFigure(lastState)
    },
    undefined,
    () => {
      // Fallback: use the procedural body if the GLB fails to load
      bodyGroup.add(buildBody(bodyMat))
      if (lastState) updateFigure(lastState)
    }
  )

  // ── Update from state ──────────────────────────────────────────────────────
  function updateFigure(state: FigureState) {
    lastState = state
    bodyMat.color.set(state.bodyColor)
    accessoryGroup.clear()
    backGroup.clear()

    const cc = state.clothingColor
    const ac = state.accessoryColor

    if (state.hat    !== 'none') { const h = buildHat   (state.hat,    cc); if (h) accessoryGroup.add(h) }
    if (state.top    !== 'none') { const t = buildTop   (state.top,    cc); if (t) accessoryGroup.add(t) }
    if (state.bottom !== 'none') { const b = buildBottom(state.bottom, cc); if (b) accessoryGroup.add(b) }

    // Left hand item — positioned at the actual hand bone location
    if (state.leftHand !== 'none') {
      const item = buildItem(state.leftHand, ac)
      if (item) {
        item.position.copy(handL)
        if (state.leftHand === 'round_shield' || state.leftHand === 'kite_shield') {
          item.rotation.set(0, -0.3, 0)
        }
        accessoryGroup.add(item)
      }
    }

    // Right hand item — positioned at the actual hand bone location
    if (state.rightHand !== 'none') {
      const item = buildItem(state.rightHand, ac)
      if (item) {
        item.position.copy(handR)
        if (state.rightHand === 'round_shield' || state.rightHand === 'kite_shield') {
          item.rotation.set(0, 0.3, 0)
        }
        accessoryGroup.add(item)
      }
    }

    // Back item
    if (state.back !== 'none') {
      const b = buildBack(state.back, cc)
      if (b) backGroup.add(b)
    }
  }

  // ── Animation ──────────────────────────────────────────────────────────────
  let rafId: number
  function animate() {
    rafId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // ── Resize ─────────────────────────────────────────────────────────────────
  function handleResize(w: number, h: number) {
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  // ── Dispose ────────────────────────────────────────────────────────────────
  function dispose() {
    cancelAnimationFrame(rafId)
    controls.dispose()
    renderer.dispose()
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material.dispose()
      }
    })
  }

  return { figureGroup, updateFigure, handleResize, dispose }
}
