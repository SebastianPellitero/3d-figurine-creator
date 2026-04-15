import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'

export function useSTLExport() {
  function exportSTL(figureGroup: THREE.Group, filename = 'figure.stl') {
    const exporter = new STLExporter()

    // Clone group so we can apply world transforms cleanly
    const exportScene = new THREE.Scene()
    const clone = figureGroup.clone(true)
    clone.updateMatrixWorld(true)
    exportScene.add(clone)

    // Binary STL is smaller and widely supported by slicers
    const binary = exporter.parse(exportScene, { binary: true }) as DataView

    const blob = new Blob([binary.buffer as ArrayBuffer], { type: 'application/octet-stream' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportSTL }
}
