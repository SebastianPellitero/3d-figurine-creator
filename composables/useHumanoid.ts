import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type { FigureState, CustomAccessory, PrimitiveParams } from '~/stores/figure'

// ─── Scale: 1 unit = 1 mm ──────────────────────────────────────────────────────

// ─── Material helper ──────────────────────────────────────────────────────────
function mat(color: string, roughness = 0.7, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

// ─── Geometry factory (shared with useAccessoryEditor) ────────────────────────
export function makeGeometry(p: PrimitiveParams): THREE.BufferGeometry {
  const seg = p.segments ?? 24
  switch (p.type) {
    case 'sphere':
      return new THREE.SphereGeometry(p.radius ?? 5, seg, Math.ceil(seg * 0.75))
    case 'cylinder':
      return new THREE.CylinderGeometry(p.radiusTop ?? 3, p.radiusBottom ?? 3, p.height ?? 10, seg)
    case 'box':
      return new THREE.BoxGeometry(p.width ?? 8, p.height ?? 8, p.depth ?? 8)
    case 'cone':
      return new THREE.ConeGeometry(p.radiusBottom ?? 4, p.height ?? 10, seg)
  }
}

// ─── Base64 ↔ ArrayBuffer helpers ────────────────────────────────────────────
export function b64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

// ─── Render a saved custom accessory into a group ─────────────────────────────
function renderCustomAccessory(acc: CustomAccessory, group: THREE.Group) {
  let geometry: THREE.BufferGeometry
  if (acc.geometry.kind === 'primitive') {
    geometry = makeGeometry(acc.geometry.params)
  } else {
    geometry = new STLLoader().parse(b64ToBuffer(acc.geometry.dataB64))
    geometry.computeVertexNormals()
  }
  const mesh = new THREE.Mesh(geometry, mat(acc.color, 0.6, 0.1))
  mesh.position.fromArray(acc.position)
  mesh.rotation.set(acc.rotation[0], acc.rotation[1], acc.rotation[2])
  mesh.scale.fromArray(acc.scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
}

// ─── Fallback procedural body (shown if Xbot.glb fails to load) ──────────────
function buildFallbackBody(bodyMat: THREE.MeshStandardMaterial): THREE.Group {
  const g = new THREE.Group()
  const add = (geo: THREE.BufferGeometry, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, bodyMat)
    m.position.set(x, y, z)
    m.castShadow = true
    g.add(m)
  }
  add(new THREE.SphereGeometry(3.5, 20, 16), 0, 38, 0)
  add(new THREE.CylinderGeometry(1.8, 2.4, 3.5, 12), 0, 32.75, 0)
  add(new THREE.BoxGeometry(15, 10, 7.5), 0, 26, 0)
  add(new THREE.BoxGeometry(13, 4, 7), 0, 19, 0)
  add(new THREE.CylinderGeometry(2.5, 3, 8, 12), -4, 13, 0)
  add(new THREE.CylinderGeometry(2.5, 3, 8, 12),  4, 13, 0)
  add(new THREE.CylinderGeometry(1.8, 2.2, 7, 12), -4, 5.5, 0)
  add(new THREE.CylinderGeometry(1.8, 2.2, 7, 12),  4, 5.5, 0)
  add(new THREE.BoxGeometry(4.5, 2, 7.5), -4, 1, 1.5)
  add(new THREE.BoxGeometry(4.5, 2, 7.5),  4, 1, 1.5)
  return g
}

// ─── Main composable ──────────────────────────────────────────────────────────
export function useHumanoid(canvas: HTMLCanvasElement) {
  const width  = canvas.clientWidth  || 800
  const height = canvas.clientHeight || 600

  // ── Scene ──────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f1117)
  scene.fog = new THREE.FogExp2(0x0f1117, 0.0025)

  // ── Camera ─────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000)
  camera.position.set(0, 20, 90)

  // ── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25

  // ── Orbit controls ─────────────────────────────────────────────────────────
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 20, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 30
  controls.maxDistance = 220
  controls.maxPolarAngle = Math.PI * 0.9
  controls.update()

  // ── Lighting ───────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))

  const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.4)
  keyLight.position.set(72, 144, 96)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near   = 1
  keyLight.shadow.camera.far    = 400
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
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(120, 48),
    new THREE.MeshStandardMaterial({ color: '#1e2030', roughness: 0.9, metalness: 0.05 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(22, 24, 1.5, 32),
    new THREE.MeshStandardMaterial({ color: '#252840', roughness: 0.6, metalness: 0.2 })
  )
  platform.position.set(0, 0.75, 0)
  platform.castShadow = true
  scene.add(platform)
  scene.add(new THREE.GridHelper(240, 24, 0x2a2d4a, 0x1e2035))

  // ── Figure groups ──────────────────────────────────────────────────────────
  const figureGroup    = new THREE.Group()
  const bodyGroup      = new THREE.Group()
  const accessoryGroup = new THREE.Group()
  const backGroup      = new THREE.Group()
  figureGroup.add(bodyGroup, backGroup, accessoryGroup)
  scene.add(figureGroup)

  // ── Shared skin material (applied to all Xbot meshes) ─────────────────────
  const bodyMat = mat('#d4a574')

  // ── Last applied state — replayed after async model load ──────────────────
  let lastState: FigureState | null = null

  // ── Load Xbot.glb ──────────────────────────────────────────────────────────
  const loader = new GLTFLoader()
  loader.load(
    '/models/Xbot.glb',
    (gltf) => {
      const model = gltf.scene

      // Scale to 38 mm height
      const box0 = new THREE.Box3().setFromObject(model)
      model.scale.setScalar(38 / (box0.max.y - box0.min.y))

      // Ground feet at y = 0
      const box1 = new THREE.Box3().setFromObject(model)
      model.position.y = -box1.min.y

      // Replace all mesh materials with skin color
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        child.castShadow = true
        child.receiveShadow = true
        child.material = bodyMat
      })

      bodyGroup.add(model)
      if (lastState) updateFigure(lastState)
    },
    undefined,
    () => {
      bodyGroup.add(buildFallbackBody(bodyMat))
      if (lastState) updateFigure(lastState)
    }
  )

  // ── Update figure from store state ────────────────────────────────────────
  function updateFigure(state: FigureState) {
    lastState = state
    bodyMat.color.set(state.bodyColor)
    accessoryGroup.clear()
    backGroup.clear()

    const slots = ['hat', 'top', 'bottom', 'leftHand', 'rightHand', 'back'] as const
    for (const slot of slots) {
      const id = state[slot]
      if (id === 'none') continue
      const acc = state.customAccessories[id]
      if (!acc) continue
      renderCustomAccessory(acc, slot === 'back' ? backGroup : accessoryGroup)
    }
  }

  // ── Render loop ────────────────────────────────────────────────────────────
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
