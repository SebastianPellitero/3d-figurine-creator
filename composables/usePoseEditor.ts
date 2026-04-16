import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import type { PoseData } from '~/stores/figure'

// ─── Bone segments exposed to the user ───────────────────────────────────────
export const POSE_SEGMENTS = [
  // Torso
  { key: 'mixamorigHips',                label: 'Hips',         group: 'Torso'            },
  { key: 'mixamorigSpine',               label: 'Lower Spine',  group: 'Torso'            },
  { key: 'mixamorigSpine1',              label: 'Mid Spine',    group: 'Torso'            },
  { key: 'mixamorigSpine2',              label: 'Upper Spine',  group: 'Torso'            },
  // Head
  { key: 'mixamorigNeck',                label: 'Neck',         group: 'Head'             },
  { key: 'mixamorigHead',                label: 'Head',         group: 'Head'             },
  // Left arm
  { key: 'mixamorigLeftArm',             label: 'Upper Arm',    group: 'Left Arm'         },
  { key: 'mixamorigLeftForeArm',         label: 'Forearm',      group: 'Left Arm'         },
  // Left hand fingers
  { key: 'mixamorigLeftHandThumb1',      label: 'Thumb 1',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandThumb2',      label: 'Thumb 2',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandThumb3',      label: 'Thumb 3',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandIndex1',      label: 'Index 1',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandIndex2',      label: 'Index 2',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandIndex3',      label: 'Index 3',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandMiddle1',     label: 'Middle 1',     group: 'Left Hand'        },
  { key: 'mixamorigLeftHandMiddle2',     label: 'Middle 2',     group: 'Left Hand'        },
  { key: 'mixamorigLeftHandMiddle3',     label: 'Middle 3',     group: 'Left Hand'        },
  { key: 'mixamorigLeftHandRing1',       label: 'Ring 1',       group: 'Left Hand'        },
  { key: 'mixamorigLeftHandRing2',       label: 'Ring 2',       group: 'Left Hand'        },
  { key: 'mixamorigLeftHandRing3',       label: 'Ring 3',       group: 'Left Hand'        },
  { key: 'mixamorigLeftHandPinky1',      label: 'Pinky 1',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandPinky2',      label: 'Pinky 2',      group: 'Left Hand'        },
  { key: 'mixamorigLeftHandPinky3',      label: 'Pinky 3',      group: 'Left Hand'        },
  // Right arm
  { key: 'mixamorigRightArm',            label: 'Upper Arm',    group: 'Right Arm'        },
  { key: 'mixamorigRightForeArm',        label: 'Forearm',      group: 'Right Arm'        },
  // Right hand fingers
  { key: 'mixamorigRightHandThumb1',     label: 'Thumb 1',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandThumb2',     label: 'Thumb 2',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandThumb3',     label: 'Thumb 3',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandIndex1',     label: 'Index 1',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandIndex2',     label: 'Index 2',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandIndex3',     label: 'Index 3',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandMiddle1',    label: 'Middle 1',     group: 'Right Hand'       },
  { key: 'mixamorigRightHandMiddle2',    label: 'Middle 2',     group: 'Right Hand'       },
  { key: 'mixamorigRightHandMiddle3',    label: 'Middle 3',     group: 'Right Hand'       },
  { key: 'mixamorigRightHandRing1',      label: 'Ring 1',       group: 'Right Hand'       },
  { key: 'mixamorigRightHandRing2',      label: 'Ring 2',       group: 'Right Hand'       },
  { key: 'mixamorigRightHandRing3',      label: 'Ring 3',       group: 'Right Hand'       },
  { key: 'mixamorigRightHandPinky1',     label: 'Pinky 1',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandPinky2',     label: 'Pinky 2',      group: 'Right Hand'       },
  { key: 'mixamorigRightHandPinky3',     label: 'Pinky 3',      group: 'Right Hand'       },
  // Left leg + toes
  { key: 'mixamorigLeftUpLeg',           label: 'Thigh',        group: 'Left Leg'         },
  { key: 'mixamorigLeftLeg',             label: 'Shin',         group: 'Left Leg'         },
  { key: 'mixamorigLeftFoot',            label: 'Foot',         group: 'Left Leg'         },
  { key: 'mixamorigLeftToeBase',         label: 'Toes',         group: 'Left Leg'         },
  // Right leg + toes
  { key: 'mixamorigRightUpLeg',          label: 'Thigh',        group: 'Right Leg'        },
  { key: 'mixamorigRightLeg',            label: 'Shin',         group: 'Right Leg'        },
  { key: 'mixamorigRightFoot',           label: 'Foot',         group: 'Right Leg'        },
  { key: 'mixamorigRightToeBase',        label: 'Toes',         group: 'Right Leg'        },
] as const

export type PoseSegmentKey = typeof POSE_SEGMENTS[number]['key']

export function usePoseEditor(canvas: HTMLCanvasElement) {
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

  // ── TransformControls — rotate only ───────────────────────────────────────
  const tc = new TransformControls(camera, renderer.domElement)
  tc.setMode('rotate')
  tc.setSize(0.8)
  scene.add(tc.getHelper())
  tc.addEventListener('dragging-changed', (e: any) => { orbit.enabled = !e.value })

  // ── Internal state ─────────────────────────────────────────────────────────
  const boneMap = new Map<string, THREE.Bone>()
  let modelGroup: THREE.Group | null = null
  let baseModelY = 0          // Y at which the T-pose model was grounded
  let groundOffset = 0        // accumulated Y shift from groundFigure() calls
  let pendingPose: { pose: PoseData; offset: number } | null = null

  // ── Load Xbot ──────────────────────────────────────────────────────────────
  const loader = new GLTFLoader()
  loader.load('/models/Xbot.glb', (gltf) => {
    const model = gltf.scene

    // Scale to 38 mm height
    const box0 = new THREE.Box3().setFromObject(model)
    model.scale.setScalar(38 / (box0.max.y - box0.min.y))

    // Ground feet at y = 1.5 (platform top surface)
    const box1 = new THREE.Box3().setFromObject(model)
    baseModelY = -box1.min.y + 1.5
    model.position.y = baseModelY

    // Opaque skin material
    const skinMat = new THREE.MeshStandardMaterial({ color: '#d4a574', roughness: 0.7 })
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      child.material = skinMat
      // Extract bones from parent chain
    })

    // Extract bones
    model.traverse((obj) => {
      if (obj instanceof THREE.Bone) boneMap.set(obj.name, obj)
    })

    modelGroup = model
    scene.add(model)

    // Re-apply any pose that was requested before load completed
    if (pendingPose) {
      _applyPose(pendingPose.pose, pendingPose.offset)
      pendingPose = null
    }
  })

  // ── Internal apply ─────────────────────────────────────────────────────────
  function _applyPose(pose: PoseData, offset: number) {
    if (!modelGroup) return
    for (const [name, [rx, ry, rz]] of Object.entries(pose)) {
      const bone = boneMap.get(name)
      if (bone) bone.rotation.set(rx, ry, rz)
    }
    groundOffset = offset
    modelGroup.position.y = baseModelY + groundOffset
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  function selectBone(boneName: string) {
    const bone = boneMap.get(boneName)
    if (!bone) return
    tc.attach(bone as unknown as THREE.Object3D)
  }

  function deselectBone() {
    tc.detach()
  }

  function groundFigure() {
    if (!modelGroup) return

    // Box3.setFromObject doesn't account for skinning deformations, so we use
    // foot bone world positions to find the lowest point instead.
    modelGroup.updateMatrixWorld(true)

    const footBoneNames = [
      'mixamorigLeftFoot',
      'mixamorigRightFoot',
      'mixamorigLeftToeBase',
      'mixamorigRightToeBase',
    ]

    const worldPos = new THREE.Vector3()
    let minY = Infinity

    for (const name of footBoneNames) {
      const bone = boneMap.get(name)
      if (!bone) continue
      bone.getWorldPosition(worldPos)
      if (worldPos.y < minY) minY = worldPos.y
    }

    // Fall back to bounding box if no foot bones were found
    if (!isFinite(minY)) {
      const box = new THREE.Box3().setFromObject(modelGroup)
      minY = box.min.y
    }

    const shift = 1.5 - minY   // bring lowest foot to platform top surface
    modelGroup.position.y += shift
    groundOffset += shift
  }

  function getPoseData(): PoseData {
    const data: PoseData = {}
    for (const [name, bone] of boneMap) {
      const { x, y, z } = bone.rotation
      if (Math.abs(x) > 1e-6 || Math.abs(y) > 1e-6 || Math.abs(z) > 1e-6) {
        data[name] = [x, y, z]
      }
    }
    return data
  }

  function applyPose(pose: PoseData, offset: number) {
    if (!modelGroup) {
      // Model not loaded yet — defer
      pendingPose = { pose, offset }
      return
    }
    _applyPose(pose, offset)
  }

  function resetPose() {
    if (!modelGroup) return
    tc.detach()
    for (const bone of boneMap.values()) bone.rotation.set(0, 0, 0)
    groundOffset = 0
    modelGroup.position.y = baseModelY
  }

  function getGroundOffset() { return groundOffset }

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

  return { selectBone, deselectBone, groundFigure, getPoseData, applyPose, resetPose, getGroundOffset, handleResize, dispose }
}
