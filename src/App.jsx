"use client"

import React, { useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, MeshTransmissionMaterial } from "@react-three/drei"
import { useControls, folder, LevaPanel, useCreateStore } from 'leva'
import * as THREE from "three"

function GlassStructure({ controls }) {
  const groupRef = useRef()
  const { scene } = useThree()
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.degToRad(controls.glassRotationX)
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(controls.glassRotationY)
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(controls.glassRotationZ)
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: controls.count }).map((_, index) => {
        const offset = index - (controls.count - 1) / 2
        const x = offset * controls.radius * 2
        return (
          <mesh key={index} position={[x, 0, controls.glassZ]}>
            <cylinderGeometry args={[controls.radius, controls.radius, controls.height, controls.subdivisions]} />
            <MeshTransmissionMaterial
              transmission={controls.transmission}
              thickness={controls.thickness}
              roughness={controls.roughness}
              envMap={scene.background}
              envMapIntensity={controls.envMapIntensity}
              clearcoat={controls.clearcoat}
              clearcoatRoughness={controls.clearcoatRoughness}
              ior={controls.ior}
              reflectivity={controls.reflectivity}
              color={controls.glassColor}
              transparent={true}
              chromaticAberration={0.2}
              opacity={1.0}
              
            />
          </mesh>
        )
      })}
    </group>
  )
}

function RotatingCube({ controls }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, controls.cubeZ]}>
      <boxGeometry args={[6, 6, 6]} />
      <meshStandardMaterial color={controls.cubeColor} emissive={controls.cubeColor} emissiveIntensity={1} />
    </mesh>
  )
}

function Scene({ store }) {
  const controls = useControls({
    Scene: folder({
      backgroundColor: { value: '#070708' },
      cubeColor: { value: '#ff3030' },
      cubeZ: { value: -9.6, min: -15, max: 0, step: 0.1 },
      glassZ: { value: 0.02, min: -1, max: 1, step: 0.01 },
      cameraZ: { value: 16.8, min: 10, max: 30, step: 0.1 },
    }),
    Glass: folder({
      transmission: { value: 1, min: 0, max: 1, step: 0.01 },
      thickness: { value: 1.22, min: 0, max: 5, step: 0.01 },
      roughness: { value: 0.35, min: 0, max: 1, step: 0.01 },
      clearcoat: { value: 0.18, min: 0, max: 1, step: 0.01 },
      clearcoatRoughness: { value: 0.2, min: 0, max: 1, step: 0.01 },
      ior: { value: 1.5, min: 1, max: 2.5, step: 0.01 },
      reflectivity: { value: 0.5, min: 0, max: 1, step: 0.01 },
      envMapIntensity: { value: 2.8, min: 0, max: 5, step: 0.1 },
      glassColor: { value: '#ffffff' },
      chromaticAberration: { value: 0.2, min: 0, max: 4, step: 0.1 },
    }),
    Cylinder: folder({
      count: { value: 10, min: 1, max: 20, step: 1 },
      radius: { value: 0.66, min: 0.1, max: 1, step: 0.01 },
      height: { value: 29.8, min: 1, max: 40, step: 0.1 },
      subdivisions: { value: 8, min: 3, max: 64, step: 1 },
    }),
    'Glass Rotation': folder({
      glassRotationX: { value: 0, min: -180, max: 180, step: 1 },
      glassRotationY: { value: 0, min: -180, max: 180, step: 1 },
      glassRotationZ: { value: 41, min: -180, max: 180, step: 1 },
    }),
    Performance: folder({
      samples: { value: 16, min: 1, max: 32, step: 1 },
      resolution: { value: 1024, min: 256, max: 2048, step: 256 },
    }),
  }, { store })

  return (
    <>
      <color attach="background" args={[controls.backgroundColor]} />
      <GlassStructure controls={controls} />
      <RotatingCube controls={controls} />
      <Environment preset="studio" background={false} />
      <OrbitControls enablePan={false} enableZoom={true} />
    </>
  )
}

export default function Component() {
  const store = useCreateStore()

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} camera={{ position: [0, 0, 16], fov: 50 }}>
          <Scene store={store} />
        </Canvas>
      </div>
      <div style={{ width: '320px', backgroundColor: '#1a1a1a', overflowY: 'auto' }}>
        <LevaPanel 
          store={store}
          theme={{
            sizes: { rootWidth: '320px' },
            fontSizes: { base: 11 },
            space: { md: '10px' },
          }}
          fill 
          flat 
          titleBar={false}
        />
      </div>
    </div>
  )
}