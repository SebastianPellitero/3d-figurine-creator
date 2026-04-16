import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { makeGeometry } from '~/composables/useHumanoid'
import type { PrimitiveParams, SlotKey } from '~/stores/figure'

// Approximate default spawn positions per slot (38 mm scaled Xbot)
const SLOT_DEFAULTS: Record<SlotKey, [number, number, number]> = {
  hat:       [  0, 36,  0],
  top:       [  0, 26,  0],
  bottom:    [  0, 13,  0],
  leftHand:  [ -8, 15,  0],
  rightHand: [  8, 15,  0],
  back:      [  0, 26, -5],
}

function mat(color: string, roughness = 0.6, metalness = 0.1): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

export function bufferToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function useAccessoryEditor(canvas: HTMLCanvasElement) {
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
  const orbit = new OrbitControls(camera, renderer.domElement)
  orbit.target.set(0, 20, 0)
  orbit.enableDamping = true
  orbit.dampingFactor = 0.06
  orbit.minDistance = 30
  orbit.maxDistance = 220
  orbit.maxPolarAngle = Math.PI * 0.9
  orbit.update()

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

  // ── Transform controls ─────────────────────────────────────────────────────
  const tc = new TransformControls(camera, renderer.domElement)
  tc.setSize(0.75)
  scene.add(tc as unknown as THREE.Object3D)

  // Disable orbit while dragging the transform gizmo
  tc.addEventListener('dragging-changed', (e: any) => {
    orbit.enabled = !e.value
  })

  // ── Current accessory mesh ─────────────────────────────────────────────────
  let currentMesh: THREE.Mesh | null = null

  function setAccessoryMesh(mesh: THREE.Mesh) {
    if (currentMesh) {
      tc.detach()
      scene.remove(currentMesh)
      currentMesh.geometry.dispose()
      if (Array.isArray(currentMesh.material)) currentMesh.material.forEach(m => m.dispose())
      else currentMesh.material.dispose()
    }
    currentMesh = mesh
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    tc.attach(mesh)
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  function previewPrimitive(params: PrimitiveParams, color: string, slot: SlotKey) {
    const geometry = makeGeometry(params)
    const mesh = new THREE.Mesh(geometry, mat(color))
    const [x, y, z] = SLOT_DEFAULTS[slot]
    mesh.position.set(x, y, z)
    setAccessoryMesh(mesh)
  }

  function loadSTL(arrayBuffer: ArrayBuffer, color: string, slot: SlotKey) {
    const loader = new STLLoader()
    const geometry = loader.parse(arrayBuffer)
    geometry.computeVertexNormals()

    // Auto-center geometry
    geometry.computeBoundingBox()
    const center = new THREE.Vector3()
    geometry.boundingBox!.getCenter(center)
    geometry.translate(-center.x, -center.y, -center.z)

    const mesh = new THREE.Mesh(geometry, mat(color))
    const [x, y, z] = SLOT_DEFAULTS[slot]
    mesh.position.set(x, y, z)
    setAccessoryMesh(mesh)
  }

  function getTransform(): {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
  } {
    if (!currentMesh) return { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }
    const p = currentMesh.position
    const r = currentMesh.rotation
    const s = currentMesh.scale
    return {
      position: [p.x, p.y, p.z],
      rotation: [r.x, r.y, r.z],
      scale:    [s.x, s.y, s.z],
    }
  }

  function setMode(mode: 'translate' | 'rotate' | 'scale') {
    tc.setMode(mode)
  }

  function updateColor(color: string) {
    if (!currentMesh) return
    const m = currentMesh.material as THREE.MeshStandardMaterial
    m.color.set(color)
  }

  // ── Load Xbot skeleton ─────────────────────────────────────────────────────
  const loader = new GLTFLoader()
  loader.load('/models/Xbot.glb', (gltf) => {
    const model = gltf.scene
    const box0 = new THREE.Box3().setFromObject(model)
    model.scale.setScalar(38 / (box0.max.y - box0.min.y))
    const box1 = new THREE.Box3().setFromObject(model)
    model.position.y = -box1.min.y

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      // Semi-transparent skeleton so you can see accessory placement
      child.material = new THREE.MeshStandardMaterial({
        color: '#8090b0',
        roughness: 0.7,
        transparent: true,
        opacity: 0.55,
      })
    })
    scene.add(model)
  })

  // ── Render loop ────────────────────────────────────────────────────────────
  let rafId: number
  function animate() {
    rafId = requestAnimationFrame(animate)
    orbit.update()
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
    tc.dispose()
    orbit.dispose()
    renderer.dispose()
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material.dispose()
      }
    })
  }

  return { previewPrimitive, loadSTL, getTransform, setMode, updateColor, handleResize, dispose }
}
