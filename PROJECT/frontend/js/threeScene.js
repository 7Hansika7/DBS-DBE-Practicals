/**
 * EYE OF ODIN - Lost & Found Item Tracker for Campus
 * Three.js 3D Engine with 6 Asymmetric Stages:
 * 3D Models positioned BESIDE the left-side text rail so animations are NEVER blocked!
 */

export class ThreeSceneManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    // Groups for stages
    this.odinEyeGroup = null;
    this.orbitingItems = [];
    this.neuralGroup = null;
    this.campusGroup = null;
    this.inspectorGroup = null;
    this.vaultGroup = null;
    this.particles = null;
    this.pulseWaves = [];

    // Mouse tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Scroll state
    this.scrollProgress = 0;
    this.currentStage = 0;

    // Inspector active item model
    this.activeInspectorItem = null;
    this.isXrayMode = false;
    this.currentInspectedType = 'laptop';

    // Horizontal offset: on desktop, shift 3D models to the right (x: 2.8) so they sit BESIDE the left-side text dock!
    this.isDesktop = window.innerWidth >= 1024;
    this.xOffset = this.isDesktop ? 2.8 : 0;

    // 6 Distinct Stage Camera Configs matching the 6 sections exactly
    this.stageCameraConfigs = [
      // Stage 0: Hero Eye of Odin (Model sits on right x: 2.8, text sits on left)
      { pos: { x: 0, y: 2.5, z: 12 }, target: { x: this.xOffset, y: 0.2, z: 0 } },
      // Stage 1: Live Discovery Feed (Eye of Odin in inspection mode beside the left feed dock)
      { pos: { x: 0, y: 1.6, z: 11 }, target: { x: this.xOffset, y: -0.2, z: 0 } },
      // Stage 2: AI Neural Engine (Neural cortex on right, text on left)
      { pos: { x: 0, y: -8, z: 9 }, target: { x: this.xOffset * 0.8, y: -10, z: 0 } },
      // Stage 3: Campus 3D Isometric Map (Island on right, building selector on left)
      { pos: { x: 8, y: 6, z: 14 }, target: { x: this.xOffset * 0.6, y: -20, z: 0 } },
      // Stage 4: Item 3D Inspector (Pedestal in center, controls around it at bottom)
      { pos: { x: 0, y: -30, z: 7.5 }, target: { x: 0, y: -31, z: 0 } },
      // Stage 5: Vault & Security Escrow (Vault on right, locker table on left)
      { pos: { x: 0, y: -42, z: 8.5 }, target: { x: this.xOffset * 0.6, y: -42, z: 0 } }
    ];

    this.currentCameraTarget = {
      x: this.stageCameraConfigs[0].target.x,
      y: this.stageCameraConfigs[0].target.y,
      z: this.stageCameraConfigs[0].target.z
    };

    this.orbitMode = false;
    this.clock = null;
    this.initialized = false;
  }

  init() {
    if (!window.THREE) {
      setTimeout(() => this.init(), 100);
      return;
    }

    const THREE = window.THREE;
    this.clock = new THREE.Clock();

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060813, 0.032);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 1000);
    const startCfg = this.stageCameraConfigs[0];
    this.camera.position.set(startCfg.pos.x, startCfg.pos.y, startCfg.pos.z);
    this.camera.lookAt(startCfg.target.x, startCfg.target.y, startCfg.target.z);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    // 4. Orbit Controls (for Free 3D Orbit Mode)
    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enabled = false;
      this.controls.maxDistance = 35;
      this.controls.minDistance = 2;
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Background Atmosphere
    this.buildAtmosphere();

    // 7. Stage 0 & 1: 3D EYE OF ODIN & Orbiting Items
    this.buildEyeOfOdin();

    // 8. Stage 2: AI Neural Core
    this.buildNeuralCore();

    // 9. Stage 3: 3D Campus Isometric Map
    this.buildCampusMap();

    // 10. Stage 4: Item 3D Inspector Pedestal
    this.buildItemInspector();

    // 11. Stage 5: Vault & Escrow Safe
    this.buildVaultSafe();

    // 12. Listeners
    this.setupEventListeners();

    this.initialized = true;
    this.animate();
  }

  setupLighting() {
    const THREE = window.THREE;

    const ambientLight = new THREE.AmbientLight(0x0d1527, 2.8);
    this.scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xa5c4ff, 3.2);
    mainKeyLight.position.set(10, 15, 12);
    this.scene.add(mainKeyLight);

    const cyanRimLight = new THREE.PointLight(0x00f0ff, 4.2, 30);
    cyanRimLight.position.set(-6, 5, 8);
    this.scene.add(cyanRimLight);

    const amberFillLight = new THREE.PointLight(0xf59e0b, 3.2, 25);
    amberFillLight.position.set(8, -2, 5);
    this.scene.add(amberFillLight);

    const violetAccentLight = new THREE.PointLight(0x8b5cf6, 2.5, 25);
    violetAccentLight.position.set(0, 10, -6);
    this.scene.add(violetAccentLight);
  }

  buildAtmosphere() {
    const THREE = window.THREE;

    const particleCount = 900;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0x00f0ff);
    const colorB = new THREE.Color(0xf59e0b);
    const colorC = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 65;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 90 - 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 55;

      const mixedColor = Math.random() > 0.6 ? colorA : Math.random() > 0.3 ? colorB : colorC;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    const gridHelper = new THREE.GridHelper(60, 45, 0x00f0ff, 0x111c38);
    gridHelper.position.y = -3.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.22;
    this.scene.add(gridHelper);
  }

  buildEyeOfOdin() {
    const THREE = window.THREE;
    this.odinEyeGroup = new THREE.Group();
    this.odinEyeGroup.position.set(this.xOffset, 0, 0);

    // 1. Central Glowing Pupil
    const pupilGeo = new THREE.SphereGeometry(0.92, 32, 32);
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00a8ff,
      emissiveIntensity: 1.25
    });
    this.odinPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.odinEyeGroup.add(this.odinPupil);

    // Inner Glowing Iris Ring
    const irisRingGeo = new THREE.TorusGeometry(1.28, 0.08, 16, 48);
    const irisRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      metalness: 0.8
    });
    this.odinIrisRing = new THREE.Mesh(irisRingGeo, irisRingMat);
    this.odinEyeGroup.add(this.odinIrisRing);

    // 2. Mechanical Aperture Blades (8 rotating blades)
    this.apertureBlades = [];
    const bladeGeo = new THREE.BoxGeometry(0.25, 1.25, 0.05);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.15
    });

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0.1);
      blade.rotation.z = angle + 0.35;
      this.odinEyeGroup.add(blade);
      this.apertureBlades.push(blade);
    }

    // 3. Outer Mechanical Armored Ring
    const outerChassisGeo = new THREE.TorusGeometry(2.35, 0.15, 16, 64);
    const outerChassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    this.odinChassis = new THREE.Mesh(outerChassisGeo, outerChassisMat);
    this.odinEyeGroup.add(this.odinChassis);

    // 4. Holographic Concentric Rune Rings
    this.odinRings = [];
    const ringConfigs = [
      { radius: 2.85, tube: 0.025, color: 0x00f0ff, speed: 0.6, axis: 'z' },
      { radius: 3.45, tube: 0.03, color: 0xf59e0b, speed: -0.45, axis: 'x' },
      { radius: 4.05, tube: 0.035, color: 0x8b5cf6, speed: 0.35, axis: 'y' }
    ];

    ringConfigs.forEach(cfg => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      this.odinEyeGroup.add(ring);
      this.odinRings.push({ mesh: ring, cfg });
    });

    // 5. Projected Forward Scanning Laser Reticle
    const laserReticleGeo = new THREE.RingGeometry(0.3, 0.34, 32);
    const laserReticleMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.laserReticle = new THREE.Mesh(laserReticleGeo, laserReticleMat);
    this.laserReticle.position.z = 1.1;
    this.odinEyeGroup.add(this.laserReticle);

    // 6. 5 Orbiting Belongings (Orbiting the Eye of Odin)
    this.buildOrbitingItems();

    this.scene.add(this.odinEyeGroup);
  }

  buildOrbitingItems() {
    const THREE = window.THREE;
    this.orbitingItems = [];

    // 1. 3D Smartphone
    const phoneGroup = new THREE.Group();
    const phoneBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.6, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, roughness: 0.2 })
    );
    phoneGroup.add(phoneBody);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.76, 1.48),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    screen.position.z = 0.045;
    phoneGroup.add(screen);

    // 2. 3D Keychain & Brass Dorm Key
    const keyGroup = new THREE.Group();
    const keyRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.045, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 })
    );
    keyGroup.add(keyRing);
    const keyShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 })
    );
    keyShaft.position.y = -0.52;
    keyGroup.add(keyShaft);
    const fob = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.65, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.7 })
    );
    fob.position.set(0.32, -0.42, 0);
    keyGroup.add(fob);

    // 3. 3D Wireless Earbuds Case
    const budsGroup = new THREE.Group();
    const caseGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.65, 24);
    caseGeo.rotateX(Math.PI / 2);
    const caseMesh = new THREE.Mesh(
      caseGeo,
      new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.2, metalness: 0.3 })
    );
    budsGroup.add(caseMesh);
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    led.position.set(0, 0, 0.38);
    budsGroup.add(led);

    // 4. 3D Student ID Card
    const idGroup = new THREE.Group();
    const card = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.82, 0.02),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.3,
        metalness: 0.4,
        emissive: 0x0369a1,
        emissiveIntensity: 0.35
      })
    );
    idGroup.add(card);
    const clip = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.03, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    clip.position.set(0, 0.46, 0);
    idGroup.add(clip);

    // 5. 3D Campus Backpack
    const packGroup = new THREE.Group();
    const pack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.48, 1.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7, metalness: 0.1 })
    );
    packGroup.add(pack);
    const pouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.42, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7, metalness: 0.1 })
    );
    pouch.position.set(0, -0.2, 0.3);
    packGroup.add(pouch);

    const items = [
      { group: phoneGroup, angleOffset: 0, radius: 5.0, speed: 0.48, name: 'phone' },
      { group: keyGroup, angleOffset: (Math.PI * 2 * 1) / 5, radius: 5.2, speed: 0.48, name: 'keys' },
      { group: budsGroup, angleOffset: (Math.PI * 2 * 2) / 5, radius: 4.8, speed: 0.48, name: 'earbuds' },
      { group: idGroup, angleOffset: (Math.PI * 2 * 3) / 5, radius: 5.4, speed: 0.48, name: 'id_card' },
      { group: packGroup, angleOffset: (Math.PI * 2 * 4) / 5, radius: 5.1, speed: 0.48, name: 'backpack' }
    ];

    items.forEach(item => {
      this.odinEyeGroup.add(item.group);
      this.orbitingItems.push(item);
    });
  }

  buildNeuralCore() {
    const THREE = window.THREE;
    this.neuralGroup = new THREE.Group();
    this.neuralGroup.position.set(this.xOffset * 0.8, -10, 0);

    this.neuralNodes = [];
    const layers = [
      { count: 4, x: -3.5, color: 0x38bdf8 },
      { count: 6, x: -1.0, color: 0x818cf8 },
      { count: 5, x: 1.2, color: 0xc084fc },
      { count: 2, x: 3.5, color: 0x10b981 }
    ];

    layers.forEach((layer, layerIdx) => {
      for (let i = 0; i < layer.count; i++) {
        const y = (i - (layer.count - 1) / 2) * 1.25;
        const z = (Math.random() - 0.5) * 1.5;

        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 16, 16),
          new THREE.MeshStandardMaterial({
            color: layer.color,
            emissive: layer.color,
            emissiveIntensity: 0.9,
            roughness: 0.2,
            metalness: 0.8
          })
        );
        node.position.set(layer.x, y, z);
        this.neuralGroup.add(node);
        this.neuralNodes.push({ mesh: node, layerIdx, initialY: y, phase: Math.random() * Math.PI * 2 });
      }
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < this.neuralNodes.length; i++) {
      for (let j = i + 1; j < this.neuralNodes.length; j++) {
        const nA = this.neuralNodes[i];
        const nB = this.neuralNodes[j];
        if (nB.layerIdx === nA.layerIdx + 1) {
          const points = [nA.mesh.position, nB.mesh.position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, lineMat);
          this.neuralGroup.add(line);
        }
      }
    }

    const scannerRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.3, 0.04, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true })
    );
    scannerRing.rotation.x = Math.PI / 2;
    this.neuralGroup.add(scannerRing);
    this.neuralScannerRing = scannerRing;

    this.scene.add(this.neuralGroup);
  }

  buildCampusMap() {
    const THREE = window.THREE;
    this.campusGroup = new THREE.Group();
    this.campusGroup.position.set(this.xOffset * 0.6, -20, 0);

    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(9.2, 9.7, 0.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x0b1329, roughness: 0.8, metalness: 0.3 })
    );
    baseMesh.position.y = -0.3;
    this.campusGroup.add(baseMesh);

    const campusGrid = new THREE.GridHelper(16, 16, 0x00f0ff, 0x1e293b);
    campusGrid.position.y = 0.01;
    this.campusGroup.add(campusGrid);

    this.buildingMeshes = [];
    const bldgData = [
      { id: 'bldg-lib', name: 'Library', x: -4, z: -2, w: 2.2, h: 2.8, d: 2.0, color: 0x38bdf8 },
      { id: 'bldg-tech', name: 'Tech Hall', x: 4, z: -3, w: 2.6, h: 3.4, d: 1.8, color: 0x818cf8 },
      { id: 'bldg-union', name: 'Student Union', x: -3, z: 4, w: 2.4, h: 2.0, d: 2.2, color: 0xf59e0b },
      { id: 'bldg-sci', name: 'Science Complex', x: 3, z: 3, w: 2.0, h: 3.0, d: 2.2, color: 0x10b981 },
      { id: 'bldg-gym', name: 'Athletics Arena', x: -6, z: 1, w: 2.8, h: 1.8, d: 2.6, color: 0xef4444 },
      { id: 'bldg-quad', name: 'Central Quad', x: 0, z: 0, w: 1.5, h: 0.8, d: 1.5, color: 0x06b6d4 }
    ];

    bldgData.forEach(b => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0, b.z);

      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bMesh = new THREE.Mesh(
        bGeo,
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 })
      );
      bMesh.position.y = b.h / 2;
      bGroup.add(bMesh);

      const wireMesh = new THREE.Mesh(
        bGeo,
        new THREE.MeshBasicMaterial({ color: b.color, wireframe: true, transparent: true, opacity: 0.35 })
      );
      wireMesh.position.y = b.h / 2;
      wireMesh.scale.set(1.02, 1.02, 1.02);
      bGroup.add(wireMesh);

      const pinGeo = new THREE.ConeGeometry(0.2, 0.6, 8);
      pinGeo.rotateX(Math.PI);
      const pin = new THREE.Mesh(
        pinGeo,
        new THREE.MeshStandardMaterial({ color: b.color, emissive: b.color, emissiveIntensity: 1.0 })
      );
      pin.position.set(0, b.h + 0.8, 0);
      bGroup.add(pin);

      const radarRing = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.42, 24),
        new THREE.MeshBasicMaterial({ color: b.color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
      );
      radarRing.rotation.x = -Math.PI / 2;
      radarRing.position.set(0, b.h + 0.8, 0);
      bGroup.add(radarRing);

      this.campusGroup.add(bGroup);
      this.buildingMeshes.push({
        id: b.id,
        group: bGroup,
        pin,
        radarRing,
        baseHeight: b.h,
        origColor: b.color
      });
    });

    this.scene.add(this.campusGroup);
  }

  buildItemInspector() {
    const THREE = window.THREE;
    this.inspectorGroup = new THREE.Group();
    this.inspectorGroup.position.set(0, -31, 0);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.9, 0.45, 36),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 })
    );
    this.inspectorGroup.add(pedestal);

    const rimGeo = new THREE.TorusGeometry(2.6, 0.05, 16, 64);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(
      rimGeo,
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 1.0 })
    );
    rim.position.y = 0.22;
    this.inspectorGroup.add(rim);

    this.inspectorItemSlot = new THREE.Group();
    this.inspectorItemSlot.position.set(0, 1.45, 0);
    this.inspectorGroup.add(this.inspectorItemSlot);

    this.loadInspectedItemModel('laptop');

    this.scene.add(this.inspectorGroup);
  }

  loadInspectedItemModel(type) {
    const THREE = window.THREE;
    this.currentInspectedType = type;

    while (this.inspectorItemSlot.children.length > 0) {
      this.inspectorItemSlot.remove(this.inspectorItemSlot.children[0]);
    }

    const itemGroup = new THREE.Group();

    if (type === 'laptop') {
      const baseMat = new THREE.MeshStandardMaterial({
        color: this.isXrayMode ? 0x00f0ff : 0x334155,
        wireframe: this.isXrayMode,
        metalness: 0.9,
        roughness: 0.2
      });
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.5), baseMat);
      itemGroup.add(base);

      const screenHousingGeo = new THREE.BoxGeometry(2.2, 1.4, 0.06);
      screenHousingGeo.translate(0, 0.7, -0.7);
      screenHousingGeo.rotateX(-0.25);
      const screenHousing = new THREE.Mesh(screenHousingGeo, baseMat);
      itemGroup.add(screenHousing);

      if (!this.isXrayMode) {
        const dispGeo = new THREE.PlaneGeometry(2.0, 1.25);
        dispGeo.translate(0, 0.7, -0.66);
        dispGeo.rotateX(-0.25);
        const disp = new THREE.Mesh(dispGeo, new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
        itemGroup.add(disp);
      }
    } else if (type === 'earbuds') {
      const caseGeo = new THREE.SphereGeometry(0.9, 24, 24);
      caseGeo.scale(1.2, 0.8, 0.8);
      const caseMesh = new THREE.Mesh(
        caseGeo,
        new THREE.MeshStandardMaterial({
          color: this.isXrayMode ? 0x00f0ff : 0x8a5cf6,
          wireframe: this.isXrayMode,
          metalness: 0.4,
          roughness: 0.2
        })
      );
      itemGroup.add(caseMesh);
    } else if (type === 'keys') {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.08, 16, 32),
        new THREE.MeshStandardMaterial({
          color: this.isXrayMode ? 0x00f0ff : 0xd4af37,
          wireframe: this.isXrayMode,
          metalness: 0.95
        })
      );
      itemGroup.add(ring);

      const fob = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 0.3),
        new THREE.MeshStandardMaterial({
          color: this.isXrayMode ? 0x00f0ff : 0x0f172a,
          wireframe: this.isXrayMode,
          metalness: 0.7
        })
      );
      fob.position.set(0.6, -0.8, 0);
      itemGroup.add(fob);
    } else {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.2, 0.8),
        new THREE.MeshStandardMaterial({
          color: this.isXrayMode ? 0x00f0ff : 0xef4444,
          wireframe: this.isXrayMode,
          metalness: 0.8,
          roughness: 0.2
        })
      );
      itemGroup.add(box);
    }

    this.inspectorItemSlot.add(itemGroup);
    this.activeInspectorItem = itemGroup;
  }

  setInspectorXray(enabled) {
    this.isXrayMode = enabled;
    this.loadInspectedItemModel(this.currentInspectedType);
  }

  buildVaultSafe() {
    const THREE = window.THREE;
    this.vaultGroup = new THREE.Group();
    this.vaultGroup.position.set(this.xOffset * 0.6, -42, 0);

    const doorGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.6, 36);
    doorGeo.rotateX(Math.PI / 2);
    this.vaultDoor = new THREE.Mesh(
      doorGeo,
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.15 })
    );
    this.vaultGroup.add(this.vaultDoor);

    const gearRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.12, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.3 })
    );
    this.vaultGroup.add(gearRim);

    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x005577,
      emissiveIntensity: 0.6,
      metalness: 0.9
    });
    this.vaultWheel = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 16, 32), wheelMat);
    this.vaultWheel.position.z = 0.35;
    this.vaultGroup.add(this.vaultWheel);

    for (let i = 0; i < 4; i++) {
      const spokeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
      spokeGeo.rotateZ((Math.PI / 4) * i);
      const spoke = new THREE.Mesh(spokeGeo, wheelMat);
      spoke.position.z = 0.35;
      this.vaultGroup.add(spoke);
    }

    this.scene.add(this.vaultGroup);
  }

  triggerOdinPulse() {
    if (!window.THREE) return;
    const THREE = window.THREE;

    const pulseGeo = new THREE.RingGeometry(0.5, 0.65, 48);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.position.copy(this.odinEyeGroup.position);
    pulseMesh.position.z = 1.2;

    this.scene.add(pulseMesh);
    this.pulseWaves.push({ mesh: pulseMesh, scale: 1, opacity: 1.0 });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    window.addEventListener('mousemove', e => {
      this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
      this.mouse.targetY = -(e.clientY / this.height - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
      this.onScroll();
    }, { passive: true });
  }

  onScroll() {
    if (this.orbitMode) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = Math.max(0, Math.min(1, maxScroll > 0 ? scrollTop / maxScroll : 0));

    const segment = 1 / (this.stageCameraConfigs.length - 1);
    const floatIdx = this.scrollProgress / segment;
    const lowerIdx = Math.floor(floatIdx);
    const upperIdx = Math.min(this.stageCameraConfigs.length - 1, lowerIdx + 1);
    const t = floatIdx - lowerIdx;

    this.currentStage = lowerIdx;

    const lower = this.stageCameraConfigs[lowerIdx];
    const upper = this.stageCameraConfigs[upperIdx];

    this.targetCameraPos = {
      x: lower.pos.x + (upper.pos.x - lower.pos.x) * t,
      y: lower.pos.y + (upper.pos.y - lower.pos.y) * t,
      z: lower.pos.z + (upper.pos.z - lower.pos.z) * t
    };

    this.targetLookAt = {
      x: lower.target.x + (upper.target.x - lower.target.x) * t,
      y: lower.target.y + (upper.target.y - lower.target.y) * t,
      z: lower.target.z + (upper.target.z - lower.target.z) * t
    };
  }

  focusBuilding(buildingId) {
    const found = this.buildingMeshes.find(b => b.id === buildingId);
    if (!found) return;

    this.buildingMeshes.forEach(b => {
      b.pin.material.emissiveIntensity = b.id === buildingId ? 2.5 : 0.8;
      b.group.scale.set(b.id === buildingId ? 1.1 : 1.0, b.id === buildingId ? 1.1 : 1.0, b.id === buildingId ? 1.1 : 1.0);
    });

    if (!this.orbitMode) {
      this.targetLookAt = {
        x: this.campusGroup.position.x + found.group.position.x,
        y: this.campusGroup.position.y + found.baseHeight,
        z: found.group.position.z
      };
    }
  }

  setOrbitMode(enabled) {
    this.orbitMode = enabled;
    if (this.controls) {
      this.controls.enabled = enabled;
      if (enabled) {
        this.controls.target.set(this.currentCameraTarget.x, this.currentCameraTarget.y, this.currentCameraTarget.z);
      }
    }
    if (this.canvas) {
      this.canvas.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isDesktop = this.width >= 1024;
    this.xOffset = this.isDesktop ? 2.8 : 0;

    if (this.odinEyeGroup) this.odinEyeGroup.position.x = this.xOffset;
    if (this.neuralGroup) this.neuralGroup.position.x = this.xOffset * 0.8;
    if (this.campusGroup) this.campusGroup.position.x = this.xOffset * 0.6;
    if (this.vaultGroup) this.vaultGroup.position.x = this.xOffset * 0.6;

    if (this.camera && this.renderer) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.initialized || !window.THREE) return;
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (!this.orbitMode) {
      if (this.targetCameraPos) {
        const parallaxX = this.mouse.x * 0.35;
        const parallaxY = this.mouse.y * 0.25;

        this.camera.position.x += (this.targetCameraPos.x + parallaxX - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.targetCameraPos.y + parallaxY - this.camera.position.y) * 0.05;
        this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * 0.05;

        this.currentCameraTarget.x += (this.targetLookAt.x - this.currentCameraTarget.x) * 0.05;
        this.currentCameraTarget.y += (this.targetLookAt.y - this.currentCameraTarget.y) * 0.05;
        this.currentCameraTarget.z += (this.targetLookAt.z - this.currentCameraTarget.z) * 0.05;

        this.camera.lookAt(
          this.currentCameraTarget.x,
          this.currentCameraTarget.y,
          this.currentCameraTarget.z
        );
      }
    } else {
      if (this.controls) this.controls.update();
    }

    // EYE OF ODIN Animations
    if (this.odinPupil) {
      const pupilScale = 1.0 + Math.sin(elapsedTime * 1.8) * 0.06;
      this.odinPupil.scale.set(pupilScale, pupilScale, pupilScale);
      this.odinPupil.rotation.y = elapsedTime * 0.3;
    }

    if (this.odinIrisRing) {
      this.odinIrisRing.rotation.z = -elapsedTime * 0.4;
    }

    if (this.apertureBlades) {
      const aperturePulse = Math.sin(elapsedTime * 1.5) * 0.15;
      this.apertureBlades.forEach((blade, i) => {
        blade.rotation.z = ((Math.PI * 2 * i) / 8) + 0.35 + aperturePulse;
      });
    }

    if (this.odinRings) {
      this.odinRings.forEach(r => {
        if (r.cfg.axis === 'z') r.mesh.rotation.z += r.cfg.speed * delta;
        if (r.cfg.axis === 'x') r.mesh.rotation.x += r.cfg.speed * delta;
        if (r.cfg.axis === 'y') r.mesh.rotation.y += r.cfg.speed * delta;
      });
    }

    if (this.laserReticle) {
      this.laserReticle.rotation.z = elapsedTime * 1.2;
    }

    // Orbiting Items Physics
    if (this.orbitingItems) {
      this.orbitingItems.forEach(item => {
        const angle = elapsedTime * item.speed + item.angleOffset;
        const x = Math.cos(angle) * item.radius;
        const z = Math.sin(angle) * item.radius;
        const y = Math.sin(elapsedTime * 1.4 + item.angleOffset) * 0.38;

        item.group.position.set(x, y, z);
        item.group.rotation.y = -angle + Math.PI / 2;
        item.group.rotation.x = Math.sin(elapsedTime + item.angleOffset) * 0.15;
      });
    }

    // Pulse shockwaves
    for (let i = this.pulseWaves.length - 1; i >= 0; i--) {
      const p = this.pulseWaves[i];
      p.scale += delta * 8;
      p.opacity -= delta * 0.9;
      p.mesh.scale.set(p.scale, p.scale, 1);
      p.mesh.material.opacity = Math.max(0, p.opacity);
      if (p.opacity <= 0) {
        this.scene.remove(p.mesh);
        this.pulseWaves.splice(i, 1);
      }
    }

    // Neural Nodes Animation
    if (this.neuralNodes) {
      this.neuralNodes.forEach(node => {
        node.mesh.position.y = node.initialY + Math.sin(elapsedTime * 2 + node.phase) * 0.12;
      });
    }
    if (this.neuralScannerRing) {
      this.neuralScannerRing.rotation.z = elapsedTime * 0.6;
    }

    // Campus Radar Rings
    if (this.buildingMeshes) {
      this.buildingMeshes.forEach((b, idx) => {
        const pulse = (Math.sin(elapsedTime * 3 + idx) + 1) / 2;
        b.radarRing.scale.set(1 + pulse * 0.8, 1 + pulse * 0.8, 1);
        b.radarRing.material.opacity = 0.8 - pulse * 0.6;
        b.pin.position.y = b.baseHeight + 0.8 + Math.sin(elapsedTime * 2 + idx) * 0.15;
      });
    }

    // Item Inspector Rotation
    if (this.activeInspectorItem) {
      this.activeInspectorItem.rotation.y = elapsedTime * 0.8;
    }

    // Vault Dial
    if (this.vaultWheel) {
      this.vaultWheel.rotation.z = Math.sin(elapsedTime * 0.8) * 0.5;
    }

    // Stardust Drift
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
