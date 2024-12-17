import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";
import * as dat from "https://esm.sh/dat.gui";

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 3, 3);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// GUI setup
const gui = new dat.GUI();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    spreadSpeed: 0.001,  // Added parameter to control how fast the particles spread out
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    // Clear previous galaxy
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    if (points) scene.remove(points);

    // Geometry
    geometry = new THREE.BufferGeometry()
const positions = new Float32Array(parameters.count * 3)
const colors = new Float32Array(parameters.count * 3)
const scales = new Float32Array(parameters.count * 1)

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Radius, angle, and randomness
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        // Position
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    // Points
    points = new THREE.Points(geometry, material);
    scene.add(points);
};

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);
gui.add(parameters, 'spreadSpeed').min(0).max(0.01).step(0.0001).onFinishChange(generateGalaxy);

const animate = () => {
    // Apply rotation and outward movement to the galaxy points for spinning and spreading effect
    if (points) {
        points.rotation.y -= 0.004 * parameters.spin;  // Adjust the speed of rotation

        // Apply spreading effect: move particles outward as they spin
        const positions = points.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
            const spreadFactor = 1 + parameters.spreadSpeed * radius;
            positions[i] *= spreadFactor;
            positions[i + 1] *= spreadFactor;
            positions[i + 2] *= spreadFactor;
        }
        points.geometry.attributes.position.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

generateGalaxy();
animate();
