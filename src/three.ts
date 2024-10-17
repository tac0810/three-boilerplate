import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

const gui = new GUI();

export class Stage {
	// controls = new OrbitControls(camera, renderer.domElement);
	controls!: OrbitControls
	scene = new THREE.Scene();
	ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.1)
	directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});

	#container!: HTMLElement

	#guiContext = {
		directionalLight: {
			intensity: 0.5
		},
		ambientLight: {
			intensity: 0.1
		},
		camera: {
			position: {
				x: 0,
				y: 0,
				z: 5,
			}
		}
	}

	constructor({ container }: { container: HTMLElement }) {
		container.appendChild(this.renderer.domElement);

		this.#container = container
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.renderer.setClearColor(0x000000)

		this.camera.position.z = 5;

		this.#observeWindow()
		this.#setupLight()
		this.#setupGUI()
	}

	start() {
		this.renderer.setAnimationLoop(this.#render.bind(this))
	}

	stop() {
		this.renderer.setAnimationLoop(null)
	}

	addCube() {
		const radius = 2.5 * Math.random();
		const geometry = new THREE.BoxGeometry(Math.random(), Math.random(), Math.random());
		const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, wireframe: !true, blending: THREE.AdditiveBlending });
		const cube = new THREE.Mesh(geometry, material);

		const u = Math.random();
		const v = Math.random();

		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);

		const x = radius * Math.sin(phi) * Math.cos(theta);
		const y = radius * Math.sin(phi) * Math.sin(theta);
		const z = radius * Math.cos(phi);

		cube.position.fromArray(new THREE.Vector3(x, y, z).toArray())

		this.scene.add(cube);
	}

	#setupGUI() {
		gui.add(this.#guiContext.camera.position, 'x', -10, 10, 0.01).onChange((value: number) => {
			this.camera.position.x = value
		})
		gui.add(this.#guiContext.camera.position, 'y', -10, 10, 0.01).onChange((value: number) => {
			this.camera.position.y = value
		})
		gui.add(this.#guiContext.camera.position, 'z', -10, 10, 0.01).onChange((value: number) => {
			this.camera.position.z = value
		})

		gui.add(this.#guiContext.directionalLight, 'intensity', 0, 3, 0.01).onChange((value: number) => {
			this.directionalLight.intensity = value
		})
		gui.add(this.#guiContext.ambientLight, 'intensity', 0, 3, 0.01).onChange((value: number) => {
			this.ambientLight.intensity = value
		})

		gui.add({
			addCube: () => {
				this.addCube()
			}
		}, 'addCube')
	}

	#setupLight() {
		this.scene.add(this.directionalLight);
		this.scene.add(this.ambientLight);
	}

	#observeWindow() {
		const ro = new ResizeObserver(() => {
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		})
		ro.observe(this.#container)

		return ro;
	}

	#update() {
		this.directionalLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z)
	}

	#render() {
		this.#update()
		this.renderer.render(this.scene, this.camera);
	}
}
