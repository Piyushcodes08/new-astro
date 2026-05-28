import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, MeshReflectorMaterial, useTexture, Stars, Float } from '@react-three/drei'
import useStore from './store'
import Overlay from './Overlay'

const HPI = Math.PI / 2
const vec = new THREE.Vector3()
const obj = new THREE.Object3D()

function AstrologyCenter() {
  const ref = useRef()
  const ringRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.2
    ringRef.current.rotation.z = t * 0.1
    ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.2
  })

  return (
    <group position={[0, 0.5, 0]}>
      {/* Central "Sun" or Celestial Body */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.6, 15]} />
        <meshStandardMaterial 
          color="#dc2626" 
          emissive="#7f1d1d" 
          emissiveIntensity={2} 
          metalness={1} 
          roughness={0} 
        />
        <pointLight intensity={2} color="#ff0000" distance={5} />
      </mesh>

      {/* Rotating Astrology Ring */}
      <mesh ref={ringRef} rotation={[HPI, 0, 0]}>
        <ringGeometry args={[1.2, 1.3, 64]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#92400e" 
          emissiveIntensity={1} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Outer Glow Ring */}
      <mesh rotation={[HPI, 0, 0]}>
        <ringGeometry args={[1.5, 1.52, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Graph(props) {
  const ref = useRef()
  useFrame((state) => {
    const time = state.clock.elapsedTime
    for (let i = 0; i < 64; i++) {
      const height = Math.sin(time * 2 + i / 5) * 0.1 + 0.1
      obj.position.set(i * 0.04 - 1.28, height - 0.2, -1.5)
      obj.updateMatrix()
      ref.current.setMatrixAt(i, obj.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, 64]} {...props}>
      <planeGeometry args={[0.02, 0.1]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.5} color="#fbbf24" />
    </instancedMesh>
  )
}

function Ground() {
  const floor = useTexture('/assets/surface.png')
  return (
    <Reflector 
      position={[0, -0.225, 0]} 
      resolution={512} 
      args={[20, 20]} 
      mirror={0.6} 
      mixBlur={10} 
      mixStrength={1} 
      rotation={[-HPI, 0, HPI]} 
      blur={[400, 100]}
    >
      {(Material, props) => (
        <Material 
          color="#111" 
          metalness={1} 
          roughnessMap={floor} 
          {...props} 
        />
      )}
    </Reflector>
  )
}

function Intro() {
  const clicked = useStore((state) => state.clicked)
  const api = useStore((state) => state.api)
  useEffect(() => api.loaded(), [])

  return useFrame((state) => {
    if (clicked) {
      state.camera.position.lerp(vec.set(-4 + state.mouse.x * 2, 3, 6), 0.05)
      state.camera.lookAt(0, 0.5, 0)
    }
  })
}

export default function AudioVisualizer() {
  return (
    <div className="visualizer-container">
      <Canvas dpr={[1, 2]} camera={{ position: [-25, 25, 25], fov: 25 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 20]} />
        
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#fbbf24" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <AstrologyCenter />
          </Float>
          
          <Graph />
          <Ground />
          <Intro />
        </Suspense>
      </Canvas>
      <Overlay />
    </div>
  )
}
