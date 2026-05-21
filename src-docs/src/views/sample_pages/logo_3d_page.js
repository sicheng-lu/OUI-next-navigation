/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ThemeContext } from '../../components/with_theme';

// GLB path — served from the static build directory
const LOGO_GLB_PATH = '/OpenSearch3D.glb';

/**
 * Logo3DPage — Interactive Three.js viewer for the OpenSearch 3D logo.
 * Physics-based rotation with full Z-axis tumbling and inertia.
 * Toggle between wireframe and filled. Scale slider.
 */
export const Logo3DPage = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const modelGroupRef = useRef(null);
  const meshesRef = useRef([]);
  const originalMaterialsRef = useRef([]);
  const modelDataRef = useRef({ baseScale: 1, center: new THREE.Vector3() });

  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  const [isWireframe, setIsWireframe] = useState(true);
  const [modelScale, setModelScale] = useState(3);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.5);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
    rimLight.position.set(0, -2, -4);
    scene.add(rimLight);

    // Model group — we rotate this
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Physics state
    const velocity = { x: 0.003, y: 0.005, z: 0.001 };
    const friction = 0.995;
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };

    // Load GLB
    const loader = new GLTFLoader();
    loader.load(LOGO_GLB_PATH, (gltf) => {
      const model = gltf.scene;

      // Compute center and base scale
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = 1 / maxDim;

      // Store for later use
      modelDataRef.current = { baseScale, center: center.clone() };

      // Apply initial scale and center
      model.scale.setScalar(baseScale * modelScale);
      model.position.copy(center).multiplyScalar(-baseScale * modelScale);

      // Collect meshes and store original materials
      const meshes = [];
      const originals = [];
      model.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);
          originals.push(child.material.clone());
          // Start in wireframe
          child.material = new THREE.MeshBasicMaterial({
            color: 0x1e3a5f,
            wireframe: true,
            transparent: true,
            opacity: 0.7,
          });
        }
      });
      meshesRef.current = meshes;
      originalMaterialsRef.current = originals;

      modelGroup.add(model);
    });

    // Mouse/touch interaction
    const onPointerDown = (e) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - previousMouse.x;
      const dy = e.clientY - previousMouse.y;
      previousMouse = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.005;
      velocity.y = dx * sensitivity;
      velocity.x = dy * sensitivity;
      velocity.z = dx * sensitivity * 0.3;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(2, Math.min(10, camera.position.z + e.deltaY * 0.005));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointerleave', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animate with physics
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      modelGroup.rotation.x += velocity.x;
      modelGroup.rotation.y += velocity.y;
      modelGroup.rotation.z += velocity.z;

      if (!isDragging) {
        velocity.x *= friction;
        velocity.y *= friction;
        velocity.z *= friction;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointerleave', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Toggle wireframe/filled
  useEffect(() => {
    const meshes = meshesRef.current;
    if (meshes.length === 0) return;

    // Design system palette for filled mode
    const palette = [
      0x075985, // primary dark blue
      0x0284C7, // primary blue
      0x0EA5E9, // sky blue
      0x38BDF8, // light blue
      0x7DD3FC, // lighter blue
      0xBAE6FD, // pale blue
    ];

    const wireColor = isDark ? 0x7DD3FC : 0x1e3a5f;

    meshes.forEach((mesh, i) => {
      if (isWireframe) {
        mesh.material = new THREE.MeshBasicMaterial({
          color: wireColor,
          wireframe: true,
          transparent: true,
          opacity: 0.7,
        });
      } else {
        mesh.material = new THREE.MeshPhongMaterial({
          color: palette[i % palette.length],
          shininess: 60,
          specular: 0x222222,
          flatShading: false,
        });
      }
    });
  }, [isWireframe, isDark]);

  // Update scale — always anchor from center
  useEffect(() => {
    const group = modelGroupRef.current;
    if (!group || group.children.length === 0) return;
    const model = group.children[0];
    const { baseScale, center } = modelDataRef.current;
    if (!baseScale) return;

    const s = baseScale * modelScale;
    model.scale.setScalar(s);
    model.position.copy(center).multiplyScalar(-s);
  }, [modelScale]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
      />

      {/* Controls overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '10px 20px',
          background: isDark ? 'rgba(6, 13, 26, 0.6)' : 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 12,
          border: isDark ? '1px solid rgba(122, 159, 212, 0.2)' : '1px solid rgba(30, 58, 95, 0.2)',
          zIndex: 10,
        }}>
        {/* Wireframe / Filled toggle */}
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          style={{
            padding: '6px 14px',
            border: isDark ? '1px solid rgba(122, 159, 212, 0.3)' : '1px solid rgba(30, 58, 95, 0.3)',
            borderRadius: 6,
            background: isDark
              ? (isWireframe ? 'rgba(122, 159, 212, 0.1)' : 'rgba(122, 159, 212, 0.2)')
              : (isWireframe ? 'rgba(30, 58, 95, 0.1)' : 'rgba(30, 58, 95, 0.2)'),
            color: isDark ? '#BAE6FD' : '#1e3a5f',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif',
          }}>
          {isWireframe ? 'Wireframe' : 'Filled'}
        </button>

        {/* Scale slider */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: isDark ? '#BAE6FD' : '#1e3a5f', fontFamily: 'Outfit, sans-serif' }}>
          Scale
          <input
            type="range"
            min="1"
            max="6"
            step="0.1"
            value={modelScale}
            onChange={(e) => setModelScale(parseFloat(e.target.value))}
            style={{ width: 100, cursor: 'pointer' }}
          />
        </label>
      </div>
    </div>
  );
};
