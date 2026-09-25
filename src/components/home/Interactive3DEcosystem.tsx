import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { 
  Sparkles, 
  Compass, 
  Cpu, 
  Map as MapIcon, 
  MessageSquare, 
  Rocket, 
  BarChart3, 
  RotateCw, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  ArrowRight, 
  Layers, 
  Activity, 
  MousePointerClick 
} from 'lucide-react';

interface PortalInfo {
  id: string;
  title: string;
  badge: string;
  route: string;
  description: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  stat: string;
  pos: [number, number, number];
}

const PORTALS: PortalInfo[] = [
  {
    id: 'research',
    title: 'AI Architecture & Research',
    badge: 'CORE ENGINE',
    route: '/research',
    description: 'Synthesize full-stack open-source tech stacks, compare 3 related architectural solutions & generate code.',
    accentColor: '#7C3AED',
    icon: Cpu,
    stat: 'Dynamic Multi-Solution AI',
    pos: [0, 0, 0]
  },
  {
    id: 'explore',
    title: 'Explore Innovation Radar',
    badge: 'ACTIVE RADAR',
    route: '/explore',
    description: 'Browse, filter, like, and critique real-world community innovation projects across categories.',
    accentColor: '#E96B7A',
    icon: Compass,
    stat: '50+ Verified Innovations',
    pos: [0.8, 2.7, 0.4]
  },
  {
    id: 'roadmap',
    title: 'Execution Roadmap & Gantt',
    badge: 'PHASE ENGINE',
    route: '/roadmap',
    description: 'Interactive sprint planner, milestone tracking, resource allocation, and Gantt export engine.',
    accentColor: '#D97706',
    icon: MapIcon,
    stat: 'Agile Gantt Timeline',
    pos: [-2.9, 1.8, 0.6]
  },
  {
    id: 'community',
    title: 'Community & Peer Reviews',
    badge: 'CONSENSUS',
    route: '/community',
    description: 'Debate, validate, and earn +20 REP points by contributing constructive architectural perspectives.',
    accentColor: '#059669',
    icon: MessageSquare,
    stat: 'Reputation & Rewards Active',
    pos: [-2.6, -2.1, 0.4]
  },
  {
    id: 'launch',
    title: 'Submit & Launch Concept',
    badge: 'NEW PROPOSAL',
    route: '/launch',
    description: 'Publish your innovation to the ecosystem, validate friction points, and earn +50 REP points.',
    accentColor: '#0891B2',
    icon: Rocket,
    stat: 'Instant Deployment',
    pos: [2.7, -2.0, 0.5]
  },
  {
    id: 'insights',
    title: 'Market Telemetry & Insights',
    badge: 'LIVE METRICS',
    route: '/insights',
    description: 'Deep market trend telemetry, category velocity, peer review integrity metrics, and sentiment charts.',
    accentColor: '#4F46E5',
    icon: BarChart3,
    stat: 'Real-Time Telemetry',
    pos: [2.9, 1.2, 0.4]
  }
];

interface PortalNodeData {
  group: THREE.Group;
  mesh: THREE.Object3D;
  basePos: THREE.Vector3;
}

export const Interactive3DEcosystem: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Active state for HUD
  const [activePortalId, setActivePortalId] = useState<string | null>(null);
  const [hoveredPortalId, setHoveredPortalId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(8.5);

  // Refs for 3D state & controls
  const sceneStateRef = useRef<{
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mainGroup: THREE.Group | null;
    targetCameraPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    portalGroups: Record<string, PortalNodeData>;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
    baseRotation: { x: number; y: number };
    rotationVelocity: { x: number; y: number };
    parallaxMouse: { x: number; y: number; targetX: number; targetY: number };
    explodeFactor: number;
    targetExplodeFactor: number;
  }>({
    camera: null,
    renderer: null,
    mainGroup: null,
    targetCameraPos: new THREE.Vector3(0, 0, 8.5),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    portalGroups: {},
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(-999, -999),
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    baseRotation: { x: 0, y: 0 },
    rotationVelocity: { x: 0, y: 0 },
    parallaxMouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    explodeFactor: 1,
    targetExplodeFactor: 1
  });

  const displayedPortal = PORTALS.find(p => p.id === (hoveredPortalId || activePortalId));

  // Focus on a specific 3D node
  const focusOnPortal = useCallback((portalId: string | null) => {
    setActivePortalId(portalId);
    const state = sceneStateRef.current;
    if (!state.camera) return;

    if (!portalId) {
      // Reset to overview
      state.targetCameraPos.set(0, 0, zoomLevel);
      state.targetLookAt.set(0, 0, 0);
      return;
    }

    const portal = PORTALS.find(p => p.id === portalId);
    if (!portal) return;

    const [x, y, z] = portal.pos;
    const factor = state.targetExplodeFactor;
    const nodePos = new THREE.Vector3(x * factor, y * factor, z * factor);

    state.targetLookAt.copy(nodePos);
    if (portalId === 'research') {
      state.targetCameraPos.set(0, 0, 4.2);
    } else {
      const dir = nodePos.clone().normalize().multiplyScalar(4.5);
      state.targetCameraPos.copy(nodePos).add(new THREE.Vector3(dir.x * 0.4, dir.y * 0.4 + 0.5, 3.5));
    }
  }, [zoomLevel]);

  // Handle direct navigation
  const handleNavigateToPortal = (route: string) => {
    navigate(route);
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const next = Math.max(4.5, Math.min(13, prev + delta));
      const state = sceneStateRef.current;
      if (state && !activePortalId) {
        state.targetCameraPos.z = next;
      }
      return next;
    });
  };

  const handleResetView = () => {
    focusOnPortal(null);
    setZoomLevel(8.5);
    const state = sceneStateRef.current;
    if (state.mainGroup) {
      state.baseRotation = { x: 0, y: 0 };
      state.rotationVelocity = { x: 0, y: 0 };
      state.parallaxMouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    }
  };

  const toggleExplode = () => {
    setIsExploded(prev => {
      const next = !prev;
      sceneStateRef.current.targetExplodeFactor = next ? 1.45 : 1.0;
      return next;
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8.5);
    sceneStateRef.current.camera = camera;

    // 2. WebGL Renderer with clean transparent background
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    sceneStateRef.current.renderer = renderer;

    // 3. Subtle Ambient Light Particles (Clean & Soft for White BG)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x7C3AED), // Violet
      new THREE.Color(0x0891B2), // Cyan
      new THREE.Color(0xE96B7A), // Coral
      new THREE.Color(0x059669), // Emerald
      new THREE.Color(0xD97706)  // Amber
    ];

    for (let i = 0; i < particleCount; i++) {
      const r = 4.5 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(6, 9, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xEAE2D7, 1.4);
    dirLight2.position.set(-6, -4, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x7C3AED, 1.6, 20);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 5. Main Rotating Root Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    sceneStateRef.current.mainGroup = mainGroup;

    // Helper: Tether Dashed Line
    const tethers: { line: THREE.Line; startNode: THREE.Vector3; endNodePos: THREE.Vector3 }[] = [];
    const createTether = (start: THREE.Vector3, end: THREE.Vector3, color: number) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const lineMat = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 0.15,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.65
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      mainGroup.add(line);
      tethers.push({ line, startNode: start, endNodePos: end });
      return line;
    };

    // 6. BUILD 3D NODES & SATELLITES

    // Node A: Central Quantum Polyhedron (AI Research Core)
    const centralGroup = new THREE.Group();
    const corePos = new THREE.Vector3(0, 0, 0);
    centralGroup.position.copy(corePos);
    mainGroup.add(centralGroup);

    const coreGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xFAF7F2,
      roughness: 0.3,
      metalness: 0.1,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = { portalId: 'research' };
    centralGroup.add(coreMesh);

    // Inner glowing energy core
    const innerCoreGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x7C3AED,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    centralGroup.add(innerCore);

    // Central Wireframe cage
    const wireframeGeo = new THREE.WireframeGeometry(coreGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x8C8276, transparent: true, opacity: 0.7 });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    centralGroup.add(wireframe);

    // Orbiting Gyro Rings around Central AI Core
    const gyroRingGeo = new THREE.TorusGeometry(1.9, 0.02, 16, 64);
    const gyroRingMat = new THREE.MeshBasicMaterial({ color: 0x7C3AED, transparent: true, opacity: 0.65 });
    const gyro1 = new THREE.Mesh(gyroRingGeo, gyroRingMat);
    const gyro2 = new THREE.Mesh(gyroRingGeo, gyroRingMat);
    gyro1.rotation.x = Math.PI / 3;
    gyro2.rotation.y = Math.PI / 3;
    centralGroup.add(gyro1, gyro2);

    sceneStateRef.current.portalGroups['research'] = {
      group: centralGroup,
      mesh: coreMesh,
      basePos: corePos
    };

    // Node 1: Top Planet (Explore Innovation Radar)
    const node1Group = new THREE.Group();
    const pos1 = new THREE.Vector3(0.8, 2.7, 0.4);
    node1Group.position.copy(pos1);
    mainGroup.add(node1Group);

    const planetGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({ 
      color: 0x20212A, 
      roughness: 0.25,
      metalness: 0.2
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.userData = { portalId: 'explore' };
    node1Group.add(planetMesh);

    const ringGeo1 = new THREE.TorusGeometry(0.72, 0.045, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({ 
      color: 0xE96B7A, 
      roughness: 0.2, 
      metalness: 0.3
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 2.3;
    node1Group.add(ringMesh1);

    // Orbiting mini moon
    const moonGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xE96B7A });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(0.9, 0, 0);
    node1Group.add(moonMesh);

    createTether(new THREE.Vector3(0, 1.3, 0), pos1, 0xE96B7A);
    sceneStateRef.current.portalGroups['explore'] = {
      group: node1Group,
      mesh: planetMesh,
      basePos: pos1
    };

    // Node 2: Top-Left Kinetic Helix (Execution Roadmap)
    const node2Group = new THREE.Group();
    const pos2 = new THREE.Vector3(-2.9, 1.8, 0.6);
    node2Group.position.copy(pos2);
    mainGroup.add(node2Group);

    const bulbGeo = new THREE.DodecahedronGeometry(0.52, 0);
    const bulbMat = new THREE.MeshStandardMaterial({ 
      color: 0xD97706, 
      roughness: 0.2, 
      metalness: 0.2,
      flatShading: true
    });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.userData = { portalId: 'roadmap' };
    node2Group.add(bulbMesh);

    // Outer orbiting crystal shards
    for (let i = 0; i < 3; i++) {
      const shardGeo = new THREE.TetrahedronGeometry(0.18, 0);
      const shardMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.2 });
      const shard = new THREE.Mesh(shardGeo, shardMat);
      const angle = (i * Math.PI * 2) / 3;
      shard.position.set(Math.cos(angle) * 0.8, Math.sin(angle) * 0.3, Math.sin(angle) * 0.8);
      node2Group.add(shard);
    }

    createTether(new THREE.Vector3(-1.1, 0.8, 0), pos2, 0xD97706);
    sceneStateRef.current.portalGroups['roadmap'] = {
      group: node2Group,
      mesh: bulbMesh,
      basePos: pos2
    };

    // Node 3: Bottom-Left Molecular Constellation (Community Consensus)
    const node3Group = new THREE.Group();
    const pos3 = new THREE.Vector3(-2.6, -2.1, 0.4);
    node3Group.position.copy(pos3);
    mainGroup.add(node3Group);

    const atomMat = new THREE.MeshStandardMaterial({ 
      color: 0x059669, 
      roughness: 0.25, 
      metalness: 0.2
    });
    const sphereA = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), atomMat);
    sphereA.userData = { portalId: 'community' };
    sphereA.position.set(0, 0.2, 0);

    const sphereB = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 20), atomMat);
    sphereB.userData = { portalId: 'community' };
    sphereB.position.set(-0.35, -0.22, 0.15);

    const sphereC = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 20), atomMat);
    sphereC.userData = { portalId: 'community' };
    sphereC.position.set(0.35, -0.22, -0.15);

    node3Group.add(sphereA, sphereB, sphereC);

    createTether(new THREE.Vector3(-1.1, -0.8, 0), pos3, 0x059669);
    sceneStateRef.current.portalGroups['community'] = {
      group: node3Group,
      mesh: sphereA,
      basePos: pos3
    };

    // Node 4: Bottom-Right Holographic Beacon (Submit & Launch)
    const node4Group = new THREE.Group();
    const pos4 = new THREE.Vector3(2.7, -2.0, 0.5);
    node4Group.position.copy(pos4);
    mainGroup.add(node4Group);

    const coneGeo = new THREE.ConeGeometry(0.65, 1.4, 4);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x0891B2,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.userData = { portalId: 'launch' };
    node4Group.add(coneMesh);

    const coneWireGeo = new THREE.WireframeGeometry(coneGeo);
    const coneWireMat = new THREE.LineBasicMaterial({ color: 0x06B6D4, transparent: true, opacity: 0.7 });
    const coneWire = new THREE.LineSegments(coneWireGeo, coneWireMat);
    node4Group.add(coneWire);

    createTether(new THREE.Vector3(1.1, -0.8, 0), pos4, 0x0891B2);
    sceneStateRef.current.portalGroups['launch'] = {
      group: node4Group,
      mesh: coneMesh,
      basePos: pos4
    };

    // Node 5: Right Data Matrix (Telemetry & Insights)
    const node5Group = new THREE.Group();
    const pos5 = new THREE.Vector3(2.9, 1.2, 0.4);
    node5Group.position.copy(pos5);
    mainGroup.add(node5Group);

    const cubeGeo = new THREE.BoxGeometry(0.62, 0.62, 0.62);
    const cubeMat = new THREE.MeshStandardMaterial({ 
      color: 0x4F46E5, 
      roughness: 0.2, 
      metalness: 0.2 
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.userData = { portalId: 'insights' };
    node5Group.add(cubeMesh);

    const wireCubeGeo = new THREE.BoxGeometry(0.78, 0.78, 0.78);
    const wireCube = new THREE.LineSegments(
      new THREE.WireframeGeometry(wireCubeGeo),
      new THREE.LineBasicMaterial({ color: 0x6366F1, transparent: true, opacity: 0.7 })
    );
    node5Group.add(wireCube);

    createTether(new THREE.Vector3(1.2, 0.6, 0), pos5, 0x4F46E5);
    sceneStateRef.current.portalGroups['insights'] = {
      group: node5Group,
      mesh: cubeMesh,
      basePos: pos5
    };

    // 7. RESPONSIVE MOUSE INTERACTION & DRAG ORBIT ENGINE
    const getPointerCoords = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      return { x, y, rawX: (clientX - rect.left) / rect.width - 0.5, rawY: (clientY - rect.top) / rect.height - 0.5 };
    };

    const handlePointerDown = (e: MouseEvent) => {
      sceneStateRef.current.isDragging = true;
      sceneStateRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const state = sceneStateRef.current;
      const { x, y, rawX, rawY } = getPointerCoords(e.clientX, e.clientY);
      state.mouse.set(x, y);

      // Continuous Responsive Mouse Parallax Tracking
      state.parallaxMouse.targetX = rawX * 0.9;
      state.parallaxMouse.targetY = rawY * 0.9;

      if (state.isDragging && state.mainGroup) {
        const deltaX = e.clientX - state.previousMousePosition.x;
        const deltaY = e.clientY - state.previousMousePosition.y;

        state.rotationVelocity.x = deltaY * 0.006;
        state.rotationVelocity.y = deltaX * 0.006;

        state.baseRotation.y += state.rotationVelocity.y;
        state.baseRotation.x += state.rotationVelocity.x;

        state.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerUp = () => {
      sceneStateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleZoom(e.deltaY * 0.004);
    };

    const handleClick = (e: MouseEvent) => {
      const state = sceneStateRef.current;
      if (!state.camera) return;

      const { x, y } = getPointerCoords(e.clientX, e.clientY);
      state.raycaster.setFromCamera(new THREE.Vector2(x, y), state.camera);

      // Collect all clickable meshes
      const clickableObjects: THREE.Object3D[] = [];
      Object.values(state.portalGroups).forEach(p => {
        clickableObjects.push(p.mesh);
        p.group.traverse(child => {
          if (child instanceof THREE.Mesh) clickableObjects.push(child);
        });
      });

      const intersects = state.raycaster.intersectObjects(clickableObjects, true);
      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.portalId) {
          hitObj = hitObj.parent;
        }

        if (hitObj?.userData?.portalId) {
          const portalId = hitObj.userData.portalId;
          const portal = PORTALS.find(p => p.id === portalId);
          if (portal) {
            focusOnPortal(portalId);
          }
        }
      }
    };

    // Attach DOM Listeners
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);

    // 8. RENDER & ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const state = sceneStateRef.current;

      // Mouse Parallax Lerping for lively responsive rotation
      state.parallaxMouse.x += (state.parallaxMouse.targetX - state.parallaxMouse.x) * 0.08;
      state.parallaxMouse.y += (state.parallaxMouse.targetY - state.parallaxMouse.y) * 0.08;

      // Drag inertia and continuous rotation
      if (!state.isDragging && state.mainGroup) {
        state.baseRotation.y += state.rotationVelocity.y;
        state.baseRotation.x += state.rotationVelocity.x;
        state.rotationVelocity.x *= 0.92;
        state.rotationVelocity.y *= 0.92;

        if (autoRotate) {
          state.baseRotation.y += 0.0025 * rotationSpeed;
        }
      }

      // Combine base orbital rotation with mouse responsive tilt
      if (state.mainGroup) {
        state.mainGroup.rotation.y = state.baseRotation.y + state.parallaxMouse.x;
        state.mainGroup.rotation.x = state.baseRotation.x - state.parallaxMouse.y;
      }

      // Smooth Explode / Expand Factor Interpolation
      state.explodeFactor += (state.targetExplodeFactor - state.explodeFactor) * 0.08;

      // Update Node Positions & Oscillations
      Object.entries(state.portalGroups).forEach(([id, data]) => {
        const base = data.basePos;
        const ef = state.explodeFactor;
        const pos = new THREE.Vector3(base.x * ef, base.y * ef, base.z * ef);

        if (id === 'research') {
          data.group.rotation.y = elapsedTime * 0.3;
          gyro1.rotation.z = elapsedTime * 0.4;
          gyro2.rotation.x = -elapsedTime * 0.35;
          innerCore.scale.setScalar(0.9 + Math.sin(elapsedTime * 2.5) * 0.15);
        } else if (id === 'explore') {
          data.group.rotation.y = elapsedTime * 0.4;
          data.group.position.set(pos.x, pos.y + Math.sin(elapsedTime * 1.5) * 0.1, pos.z);
          moonMesh.position.x = Math.cos(elapsedTime * 2) * 0.9;
          moonMesh.position.z = Math.sin(elapsedTime * 2) * 0.9;
        } else if (id === 'roadmap') {
          data.group.rotation.x = elapsedTime * 0.3;
          data.group.rotation.y = elapsedTime * 0.2;
          data.group.position.set(pos.x, pos.y + Math.cos(elapsedTime * 1.3) * 0.09, pos.z);
        } else if (id === 'community') {
          data.group.rotation.y = elapsedTime * 0.5;
          data.group.position.set(pos.x, pos.y + Math.sin(elapsedTime * 1.4) * 0.08, pos.z);
        } else if (id === 'launch') {
          data.group.rotation.y = -elapsedTime * 0.35;
          data.group.position.set(pos.x, pos.y + Math.cos(elapsedTime * 1.6) * 0.09, pos.z);
        } else if (id === 'insights') {
          data.group.rotation.x = elapsedTime * 0.3;
          data.group.rotation.y = elapsedTime * 0.25;
          data.group.position.set(pos.x, pos.y + Math.sin(elapsedTime * 1.2) * 0.1, pos.z);
        }
      });

      // Update Tether Geometries
      tethers.forEach(({ line, startNode, endNodePos }) => {
        const ef = state.explodeFactor;
        const currentEnd = new THREE.Vector3(endNodePos.x * ef, endNodePos.y * ef, endNodePos.z * ef);
        const points = [startNode, currentEnd];
        line.geometry.setFromPoints(points);
        line.computeLineDistances();
      });

      // Raycasting for Hover Detection
      if (camera && state.mouse.x !== -999) {
        state.raycaster.setFromCamera(state.mouse, camera);
        const clickableObjects: THREE.Object3D[] = [];
        Object.values(state.portalGroups).forEach(p => {
          clickableObjects.push(p.mesh);
          p.group.traverse(c => {
            if (c instanceof THREE.Mesh) clickableObjects.push(c);
          });
        });

        const intersects = state.raycaster.intersectObjects(clickableObjects, true);
        if (intersects.length > 0) {
          let hitObj: THREE.Object3D | null = intersects[0].object;
          while (hitObj && !hitObj.userData?.portalId) {
            hitObj = hitObj.parent;
          }
          if (hitObj?.userData?.portalId) {
            setHoveredPortalId(hitObj.userData.portalId);
            container.style.cursor = 'pointer';
          } else {
            setHoveredPortalId(null);
            container.style.cursor = state.isDragging ? 'grabbing' : 'grab';
          }
        } else {
          setHoveredPortalId(null);
          container.style.cursor = state.isDragging ? 'grabbing' : 'grab';
        }
      }

      // Smooth Camera Lerping to Target Position & LookAt
      camera.position.lerp(state.targetCameraPos, 0.06);
      state.currentLookAt.lerp(state.targetLookAt, 0.06);
      camera.lookAt(state.currentLookAt);

      // Ambient particle subtle drift
      starField.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate, rotationSpeed]);

  return (
    <div className="relative w-full h-[520px] lg:h-[580px] bg-gradient-to-b from-[#FDFBF7] to-[#FAF7F2] rounded-3xl border border-[#E5E0D6] shadow-card overflow-hidden flex flex-col items-center justify-between select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HUD: INTERACTIVE PORTAL SELECTOR PILLS
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 bg-white/80 backdrop-blur-md border border-[#E5E0D6] rounded-2xl shadow-sm max-w-full">
          <button
            onClick={() => handleResetView()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              !activePortalId
                ? 'bg-[#20212A] text-white shadow-sm font-semibold'
                : 'text-[#8C8276] hover:text-[#20212A] hover:bg-[#EAE2D7]/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Overview</span>
          </button>

          {PORTALS.map((portal) => {
            const Icon = portal.icon;
            const isActive = activePortalId === portal.id || hoveredPortalId === portal.id;
            return (
              <button
                key={portal.id}
                onClick={() => focusOnPortal(portal.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'font-semibold shadow-sm'
                    : 'text-[#64748B] hover:text-[#20212A] hover:bg-[#EAE2D7]/40'
                }`}
                style={{
                  backgroundColor: isActive ? `${portal.accentColor}18` : undefined,
                  color: isActive ? portal.accentColor : undefined,
                  border: isActive ? `1px solid ${portal.accentColor}55` : '1px solid transparent'
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: portal.accentColor }}
                />
                <Icon className="w-3.5 h-3.5" />
                <span>{portal.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Live Status Telemetry Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-[#E5E0D6] rounded-xl text-[11px] font-mono text-[#20212A] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>3D COMMAND HUB • LIVE</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. WEBGL THREE.JS CANVAS CONTAINER
      ───────────────────────────────────────────────────────────── */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE / HOVERED 3D NODE HUD FLOATING CARD
      ───────────────────────────────────────────────────────────── */}
      {displayedPortal && (
        <div 
          className="absolute left-4 sm:left-6 bottom-20 z-20 max-w-sm w-[calc(100%-2rem)] sm:w-auto p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E5E0D6] shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
          style={{ borderLeftColor: displayedPortal.accentColor, borderLeftWidth: '4px' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: `${displayedPortal.accentColor}15`, border: `1px solid ${displayedPortal.accentColor}40` }}
              >
                <displayedPortal.icon className="w-5 h-5" style={{ color: displayedPortal.accentColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded uppercase"
                    style={{ backgroundColor: `${displayedPortal.accentColor}20`, color: displayedPortal.accentColor }}
                  >
                    {displayedPortal.badge}
                  </span>
                  <span className="text-[10px] font-mono text-[#8C8276]">
                    {displayedPortal.route}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-[#20212A] mt-0.5">
                  {displayedPortal.title}
                </h4>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#52525B] mt-2.5 leading-relaxed">
            {displayedPortal.description}
          </p>

          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#E5E0D6]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>{displayedPortal.stat}</span>
            </div>

            <button
              onClick={() => handleNavigateToPortal(displayedPortal.route)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: displayedPortal.accentColor }}
            >
              <span>Launch Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM HUD CONTROLS DOCK (Zoom, Auto-Rotate, Explode, Tips)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 pointer-events-auto">
        
        {/* Interaction Gesture Guide */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-[#E5E0D6] rounded-xl text-[11px] font-mono text-[#71717A] shadow-sm">
          <MousePointerClick className="w-3.5 h-3.5 text-[#7C3AED] animate-bounce" />
          <span>Move mouse to tilt • Drag to 360° orbit • Click node to open page</span>
        </div>

        {/* Quick Control Tools */}
        <div className="flex items-center gap-1.5 ml-auto bg-white/80 backdrop-blur-md border border-[#E5E0D6] p-1.5 rounded-2xl shadow-sm text-[#20212A]">
          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause Auto-Orbit" : "Resume Auto-Orbit"}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              autoRotate ? 'bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30' : 'text-[#71717A] hover:text-[#20212A] hover:bg-[#EAE2D7]/50'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setRotationSpeed(s => (s === 1 ? 2.5 : 1))}
            title="Toggle Orbit Speed"
            className="px-2 py-1 rounded-xl text-[11px] font-mono font-bold text-[#20212A] hover:bg-[#EAE2D7]/50 transition-colors"
          >
            {rotationSpeed}x
          </button>

          <div className="w-px h-4 bg-[#E5E0D6] mx-0.5" />

          {/* Explode / Cluster Toggle */}
          <button
            onClick={toggleExplode}
            title={isExploded ? "Compact Nexus View" : "Explode Galaxy View"}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              isExploded ? 'bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30' : 'text-[#71717A] hover:text-[#20212A] hover:bg-[#EAE2D7]/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => handleZoom(-1.2)}
            title="Zoom In"
            className="p-2 rounded-xl text-[#71717A] hover:text-[#20212A] hover:bg-[#EAE2D7]/50 transition-all"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoom(1.2)}
            title="Zoom Out"
            className="p-2 rounded-xl text-[#71717A] hover:text-[#20212A] hover:bg-[#EAE2D7]/50 transition-all"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetView}
            title="Reset Camera Orientation"
            className="p-2 rounded-xl text-[#71717A] hover:text-[#20212A] hover:bg-[#EAE2D7]/50 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
