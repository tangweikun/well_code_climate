import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { MeshLine } from 'three.meshline';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as AmmoLib from 'three/examples/js/libs/ammo.wasm';
import {
  DEFAULT_STYLE,
  str,
  grassFragmentSource,
  groundVertexPrefix,
  bladeHeight,
  grassVertexSource,
} from './constants';
import { getDefinedMaterial } from './methods';

const wheels = [];
var wheel_fl = new THREE.Group();
var wheel_fr = new THREE.Group();
var wheel_rl = new THREE.Group();
var wheel_rr = new THREE.Group();

var cameraPosions = new THREE.Group();

// Physics variables

let Ammo;
const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const gravityConstant = -9.8;
let physicsWorld;
const rigidBodies = [];
const margin = 0.05;
let transformAux1;
// let softBodyHelpers;
const clock = new THREE.Clock();
let clickRequest = false;
let ROAM_ON = false; //漫游是否开启

let testTrain = false;
let CAMERA_DIST = 150; //60
let CAMERA_MAX_DIST = 300; //60
let TRAINLAND_MARGIN = 0; //场地向外拓展距离 150 200 330
let SKYBOX_SIZE = 2000; //天空盒大小 900 1200
let CAMERA_MAX_FAR = 3000;
let DYNAMIC_LINE_POINTS = [];
// let DYNAMIC_LINE = new MeshLine();
let AREA_TRAIN; // = new THREE.Object3D();
let FORBIDLINE_HEIGHT = 1.5; //1.2

let DLINES_H = 0.7;
let TEXT_GROUP;
let TRANSFORM_KINEMATIC;
// let TRANSFORM_KINEMATIC_X = 0;
// let TRANSFORM_KINEMATIC_Y = 0;
const kinematicBodies = [];
var tbv30;
// let isCarMove = false;
let carParent = new THREE.Group();
let carParentWrap = new THREE.Group();
let BASE_H = 0; //75;//采集地图坐标的基准（最低）高度
let BASE_H2 = 75;
// let CAR_TEST_BODY;
let POLYGON_POINTS_AREA = []; //驾校场地范围
// let IN_DRIVE_AREA = true;//是否处于驾校场地范围
let POLYGON_RAMP_POINTS = []; //爬坡阶段检测范围
let IS_CLIMB = false; //是否处于爬坡阶段
let HAS_INTO_CLIMB = false; //是否已经进入爬坡阶段
// let HAS_EXIT_CLIMB = false;//是否已经驶出爬坡阶段
let CAMERA_H_INCAR = 18; //10:位于车内;18:位于车顶
let IS_IN_CAR = 0; //0:在车外,默认;1:在车内
let PHYSICS_CAR_OBJECT; //车辆物理引擎object
// let PHYSICS_CAR_SHAPE;//车辆物理引擎shape
let PHYSICS_CAR_BODY; //车辆物理引擎body
let OPEN_PHYSICS_CAR_ANGLE = false; //开启车辆物理角度
let REMOVE_OBJECTS = [];
let FLOWER_FENCE_H = 0; //-0.3

// 箭头
let RollMat;
let RollGEOMETRY = new THREE.PlaneGeometry(40, 20);
let RollTexture;
let Rollposition;
let Rollorientation = new THREE.Matrix4(); //a new orientation matrix to offset pivot
let RolloffsetRotation = new THREE.Matrix4(); //a matrix to fix pivot rotation
let ARROW;

// 临时
let OFFSET_X = -67;
let OFFSET_Z = 32;

//共用材质
let GRASS_LIGHT_MATERIAL;
let GRASS_LIGHT_MATERIAL2;
let BRICK_STONE_MATERIAL;
let BRICK_STONE_MATERIAL2;
let BASE_GROUND_MATERIAL;
let KERBS_MATERIAL;
let PARAPET_MATERIAL; //防护矮墙
let TRAINROAD_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x000000,
  flatShading: true,
  transparent: true,
  opacity: 0.5,
}); //纹理路面
// let OBSTACLE_MATERIAL = new THREE.MeshPhongMaterial({color: 0x606060});
// let TRANSPARENT_MATERIAL = new THREE.MeshBasicMaterial({color: 0x606060, transparent: true, opacity: 0.1});
// let RAMP_MATERIAL;

const FORBIDLINE_SOLID_MATERAIL = new THREE.MeshBasicMaterial({
  color: 0xffffff, //白色 0xffb923
  side: THREE.DoubleSide,
  // lineWidth: 20//无效
});

const FORBIDLINE_ERROR_MATERAIL = new THREE.MeshBasicMaterial({
  color: 0xff0000, //红色
  side: THREE.DoubleSide,
  // lineWidth: 20//无效
});

const FORBIDLINE_CLOUD_MATERAIL = new THREE.LineDashedMaterial({
  side: THREE.DoubleSide,
  // lineWidth: 20,//无效
  color: 0x00ff00, //线段的颜色 绿色
  dashSize: 1, //短划线的大小
  // gapSize: 3,//短划线之间的距离
  scale: 1.0, // 比例越大，虚线越密；反之，虚线越疏
});

const FORBIDLINE_DOTTED_MATERAIL = new THREE.LineDashedMaterial({
  side: THREE.DoubleSide,
  // lineWidth: 20,//无效
  color: 0xffffff, //线段的颜色
  dashSize: 1, //短划线的大小
  // gapSize: 3,//短划线之间的距离
  scale: 1.0, // 比例越大，虚线越密；反之，虚线越疏
});

// 鼠标输入相关

var mouseCoords = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); //0x202020

// bullet内置宏

var DISABLE_DEACTIVATION = 4;
// var TRANSFORM_AUX = new Ammo.btTransform();
var ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);

// 车辆系统辅助

var speedometer;
var syncList = []; // 车辆系统用syncList保存事件列表,不再使用rigidBodies变量.存放用于绘制和同步物理场景的方法

// 键盘相关

var actions = {
  acceleration: false,
  braking: false,
  left: false,
  right: false,
};
var keysActions = {
  KeyW: 'acceleration',
  KeyS: 'braking',
  KeyA: 'left',
  KeyD: 'right',
};

// var maxNumObjectss = 30;

export default class App extends Component {
  lastCarPositionX = 0;
  lastCarPositionY = 0;
  lastCarPositionZ = 0;
  prevTime = 0;
  inCar = 0;

  constructor(props) {
    super(props);
    this.state = {
      winParam: window.winParam || { width: 1280, height: 800 },
      carPosition: window.carPosition || {
        // index:0,//车辆编号
        x: 0,
        y: BASE_H,
        z: 0,
        rotation: 0,
        angle: 0,
        speed: 0,
        moveState: 0,
        rotationX: 0,
        rotationZ: 0,
      },
      dynamicLines: window.dynamicLines || { data: [] },
      schoolData: window.schoolData, // || {data: []}
      cameraParam: window.cameraParam,
    };
    var w = parseInt(getQueryVariable('w'));
    var h = parseInt(getQueryVariable('h'));
    var pixelRatio = parseFloat(getQueryVariable('ratio'));
    this.winWidth = !w ? DEFAULT_STYLE.width : w;
    this.winHeight = !h ? DEFAULT_STYLE.height : h;
    this.winPixelRatio = !pixelRatio ? window.devicePixelRatio : pixelRatio;

    function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) {
          return pair[1];
        }
      }
      return false;
    }
  }

  componentDidMount() {
    const that = this;
    this.scene = new THREE.Scene();
    //欢迎
    // this.welcome();
    AmmoLib().then(function (lib) {
      Ammo = lib;
      initPhysics();
      that.initScene();
      that.scene.remove(TEXT_GROUP);
    });

    function initPhysics() {
      // Physics configuration
      const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
      const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
      const broadphase = new Ammo.btDbvtBroadphase();
      const solver = new Ammo.btSequentialImpulseConstraintSolver();
      const softBodySolver = new Ammo.btDefaultSoftBodySolver();
      physicsWorld = new Ammo.btSoftRigidDynamicsWorld(
        dispatcher,
        broadphase,
        solver,
        collisionConfiguration,
        softBodySolver,
      );
      physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
      physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));
      transformAux1 = new Ammo.btTransform();
      // softBodyHelpers = new Ammo.btSoftBodyHelpers();
      //new
      TRANSFORM_KINEMATIC = new Ammo.btTransform();
      tbv30 = new Ammo.btVector3();
    }
  }

  initScene() {
    this.count = 0;
    this.sceneSetup();
    this.initMaterial();

    var json = JSON.parse(str);
    this.updateScene(json);
    this.loadCarModel();
    this.prevTime = performance.now();
    this.startAnimationLoop();

    this.initInput();
    this.timeId = setInterval(() => {
      this.setState({
        winParam: {
          ...window.winParam,
        },
        cameraParam: {
          ...window.cameraParam,
        },
        carPosition: {
          ...window.carPosition,
        },
        dynamicLines: {
          ...window.dynamicLines,
        },
        schoolData: {
          ...window.schoolData,
        },
      });
      this.state.carPosition.x = window.carPosition.x / 100.0;
      this.state.carPosition.y = window.carPosition.z / 100.0 - BASE_H; //fix:
      this.state.carPosition.z = -window.carPosition.y / 100.0;

      this.camera.position.x = this.camera.position.x + this.state.carPosition.x - this.lastCarPositionX;
      this.camera.position.y = this.camera.position.y + this.state.carPosition.y - this.lastCarPositionY;
      this.camera.position.z = this.camera.position.z + this.state.carPosition.z - this.lastCarPositionZ;

      this.lastCarPositionX = this.state.carPosition.x;
      this.lastCarPositionY = this.state.carPosition.y;
      this.lastCarPositionZ = this.state.carPosition.z;

      // IN_DRIVE_AREA = this.isInPolygon([this.state.carPosition.x, this.state.carPosition.z], POLYGON_POINTS_AREA);
      // if(!IN_DRIVE_AREA){
      //     console.log('超出驾校范围');
      // }
      // fix:只在坡道使用
      IS_CLIMB = this.isInPolygon([this.state.carPosition.x, this.state.carPosition.z], POLYGON_RAMP_POINTS);
      if (!HAS_INTO_CLIMB && IS_CLIMB) {
        //第一次进入爬坡 && !HAS_EXIT_CLIMB
        console.log('进入爬坡');
        HAS_INTO_CLIMB = true;
        let pos = new THREE.Vector3(this.state.carPosition.x, this.state.carPosition.y, this.state.carPosition.z);
        this.updatePhysicsCar(pos);
      } else if (HAS_INTO_CLIMB && !IS_CLIMB) {
        //进入爬坡后，驶出爬坡
        console.log('进入爬坡后，驶出爬坡');
        // HAS_EXIT_CLIMB = true;
        HAS_INTO_CLIMB = false;
        this.scene.remove(PHYSICS_CAR_OBJECT);
        PHYSICS_CAR_OBJECT = null;
        physicsWorld.removeRigidBody(PHYSICS_CAR_BODY);
        syncList.splice(0, syncList.length);
      }

      if (!testTrain) {
        if (!ROAM_ON) {
          if (this.inCar === 0) {
            //车外
            this.controls.target = new THREE.Vector3(this.state.carPosition.x, 0, this.state.carPosition.z);
          } else if (this.inCar === 1) {
            //车内
            this.controls.target = new THREE.Vector3(
              this.state.carPosition.x +
                4.12 * Math.cos(-3.4 - (this.state.carPosition.rotation / 180) * Math.PI) +
                0.01,
              this.state.carPosition.y + CAMERA_H_INCAR + 0.01,
              this.state.carPosition.z +
                4.12 * Math.sin(-3.4 - (this.state.carPosition.rotation / 180) * Math.PI) +
                0.01,
            );
          }
        }
      }

      //切换场景
      if (this.state.schoolData.itemDatas) {
        console.log('切换场景');
        window.schoolData = {}; // 下次不执行
        this.updateScene(this.state.schoolData);
      }

      //fix: 恢复默认视角
      if (this.state.cameraParam.isInCar !== IS_IN_CAR) {
        IS_IN_CAR = this.state.cameraParam.isInCar;
        this.restoreCameraDefault();
      }
    }, 100);
  }

  initMaterial() {
    const loader = new THREE.TextureLoader();
    const kerbTexture = loader.load('fbx/kerb.jpg', function (texture) {
      // console.log('load kerb texture')
    });
    kerbTexture.wrapS = kerbTexture.wrapT = THREE.RepeatWrapping;
    kerbTexture.repeat.set(5, 5);
    kerbTexture.anisotropy = 16;
    kerbTexture.encoding = THREE.sRGBEncoding;
    KERBS_MATERIAL = new THREE.MeshLambertMaterial({ map: kerbTexture });

    const parapetTexture = loader.load('images/redwhite_s.png', function (texture) {
      // console.log('load redwhite_s texture')
    });
    parapetTexture.wrapS = parapetTexture.wrapT = THREE.RepeatWrapping;
    parapetTexture.repeat.set(5, 5);
    parapetTexture.anisotropy = 16;
    parapetTexture.encoding = THREE.sRGBEncoding;
    PARAPET_MATERIAL = new THREE.MeshLambertMaterial({ map: parapetTexture });

    RollMat = new THREE.MeshLambertMaterial();
    RollTexture = new THREE.TextureLoader().load('images/arrow.png', function (map) {
      RollMat.map = map;
      RollMat.needsUpdate = true;
      RollMat.transparent = true;
      RollMat.side = THREE.DoubleSide;
    });
    RollTexture.wrapS = THREE.RepeatWrapping;
    RollTexture.wrapT = THREE.RepeatWrapping;

    const grasslightTexture = loader.load('grasslight-big.jpg', function (texture) {
      // console.log('load grasslightTexture')
    });
    grasslightTexture.wrapS = grasslightTexture.wrapT = THREE.RepeatWrapping;
    grasslightTexture.repeat.set(0.01, 0.01);
    grasslightTexture.anisotropy = 16;
    grasslightTexture.encoding = THREE.sRGBEncoding; //深绿色#163402 亮绿色#598614
    GRASS_LIGHT_MATERIAL = new THREE.MeshLambertMaterial({
      map: grasslightTexture,
    });

    const grasslightTexture2 = loader.load('grasslight-big.jpg', function (texture) {
      // console.log('load grasslightTexture2')
    });
    grasslightTexture2.wrapS = grasslightTexture2.wrapT = THREE.RepeatWrapping;
    grasslightTexture2.repeat.set(1, 1);
    grasslightTexture2.anisotropy = 16;
    grasslightTexture2.encoding = THREE.sRGBEncoding; //深绿色#163402 亮绿色#598614
    GRASS_LIGHT_MATERIAL2 = new THREE.MeshLambertMaterial({
      map: grasslightTexture2,
    });

    const brickRoadTexture = loader.load('images/ground2.jpg', function (texture) {
      // console.log('load brickRoadTexture')
    });
    brickRoadTexture.repeat.set(100, 100);
    brickRoadTexture.anisotropy = 16;
    brickRoadTexture.wrapS = brickRoadTexture.wrapT = THREE.RepeatWrapping;
    brickRoadTexture.encoding = THREE.sRGBEncoding;
    BRICK_STONE_MATERIAL = new THREE.MeshLambertMaterial({
      map: brickRoadTexture,
    });

    const brickRoadTexture2 = loader.load('images/ground2.jpg', function (texture) {
      // console.log('load brickRoadTexture2')
    });
    brickRoadTexture2.repeat.set(5, 5);
    brickRoadTexture2.anisotropy = 16;
    brickRoadTexture2.wrapS = brickRoadTexture2.wrapT = THREE.RepeatWrapping;
    brickRoadTexture2.encoding = THREE.sRGBEncoding;
    BRICK_STONE_MATERIAL2 = new THREE.MeshLambertMaterial({
      map: brickRoadTexture2,
    });

    const texture = loader.load('images/ForestFloor-06_COLOR_4k.jpg', function (texture) {
      // console.log('load ForestFloor texture')
    });
    texture.repeat.set(0.001, 0.001);
    texture.anisotropy = 16;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.encoding = THREE.sRGBEncoding;
    BASE_GROUND_MATERIAL = new THREE.MeshLambertMaterial({ map: texture });
  }

  initOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); //this.mount
    //最大仰视角和俯视角
    this.controls.minPolarAngle = 0; // radians
    this.controls.maxPolarAngle = Math.PI * 0.45; // radians
    this.controls.minDistance = 0;
    this.controls.maxDistance = CAMERA_MAX_DIST;
    this.controls.enablePan = false; //禁止拖拽
    // this.controls.enableZoom = false;//禁止缩放
  }

  initInput() {
    let speed = 0;
    speedometer = document.getElementById('speedometer');
    if (speedometer) {
      speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
    }

    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('pointerdown', function (event) {
      if (testTrain) {
        console.log('鼠标点击' + event.clientX + ',' + event.clientY);
        if (!clickRequest) {
          mouseCoords.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
          clickRequest = true;
        }
      }
    });
    window.addEventListener('keydown', function (e) {
      if (ROAM_ON) return;
      var keysActions = {
        KeyW: 'acceleration',
        KeyS: 'braking',
        KeyA: 'left',
        KeyD: 'right',
      };
      var mockOffset = 200; //5
      if (keysActions[e.code]) {
        if (keysActions[e.code] === 'acceleration') {
          window.carPosition.speed = 1000;
          window.carPosition.y += mockOffset;
          // TRANSFORM_KINEMATIC_Y = -mockOffset;
          // isCarMove = true;
        } else if (keysActions[e.code] === 'braking') {
          window.carPosition.speed = -1000;
          window.carPosition.y -= mockOffset;
          // TRANSFORM_KINEMATIC_Y = mockOffset;
          // isCarMove = true;
        } else if (keysActions[e.code] === 'left') {
          window.carPosition.speed = 1000;
          window.carPosition.x -= mockOffset;
          // TRANSFORM_KINEMATIC_X = -mockOffset;
          // isCarMove = true;
        } else if (keysActions[e.code] === 'right') {
          window.carPosition.speed = -1000;
          window.carPosition.x += mockOffset;
          // TRANSFORM_KINEMATIC_X = mockOffset;
          // isCarMove = true;
        }

        actions[keysActions[e.code]] = true;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
    window.addEventListener('keyup', function (e) {
      if (ROAM_ON) return;
      if (keysActions[e.code]) {
        actions[keysActions[e.code]] = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();

    clearInterval(this.timeId);
  }

  sceneSetup = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.tmplines = [];

    // scene

    this.scene.add(makeSkySphere('images/jiaxiao_sky.jpg', SKYBOX_SIZE));

    // camera

    this.camera = new THREE.PerspectiveCamera(
      75, //拍摄距离  视野角值越大，场景中的物体越小
      width / height, // aspect ratio
      0.1, //最小范围
      CAMERA_MAX_FAR, //最大范围 test
    );
    this.camera.position.set(0, CAMERA_DIST, 0);

    // lights

    this.scene.add(new THREE.AmbientLight(0x666666));
    const light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    const d = 300;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;
    this.scene.add(light);

    // renderer

    this.renderer = new THREE.WebGLRenderer({
      antialias: true, //去锯齿
      //precision:"lowp"  //着色器的精度。可以是"highp", "mediump" 或 "lowp". 默认为"highp"，如果设备支持的话。
    });
    console.log(window.devicePixelRatio);
    console.log(this.winPixelRatio);
    var devicePixelRatio = this.winPixelRatio;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement); // mount using React ref

    // controls

    this.initOrbitControls();

    // camera positions

    var cameraIn = new THREE.Object3D();
    var cameraFront = new THREE.Object3D();
    var cameraBehind = new THREE.Object3D();
    //(0,10,-60)
    cameraFront.position.x = 0;
    cameraFront.position.y = 10;
    cameraFront.position.z = -60;
    cameraFront.name = 'cameraFront';
    cameraPosions.add(cameraFront);
    //驾驶人眼睛位置在车中(-4,10,1)
    cameraIn.position.x = -4;
    cameraIn.position.y = 10;
    cameraIn.position.z = 1;
    cameraIn.name = 'cameraIn';
    cameraPosions.add(cameraIn);
    //(0,10,60)
    cameraBehind.position.x = 0;
    cameraBehind.position.y = 10;
    cameraBehind.position.z = 60;
    cameraBehind.name = 'cameraBehind';
    cameraPosions.add(cameraBehind);
    this.scene.add(cameraPosions);

    // init 3D stuff

    function makeSkySphere(url, ballSize) {
      const ballGeo = new THREE.SphereGeometry(ballSize, 32, 16);
      const loader = new THREE.TextureLoader();
      const texture = loader.load(url);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.encoding = THREE.sRGBEncoding;
      const ballMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      let sphere = new THREE.Mesh(ballGeo, ballMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.position.y = 30;
      sphere.rotation.y = (90 * Math.PI) / 180;
      return sphere;
    }
  };

  createGrass = (json) => {
    const that = this;
    //Variables for blade mesh
    var joints = 4;
    var bladeWidth = 0.12;

    //Patch side length
    var width = 120;
    //Number of vertices on ground plane side
    var resolution = 32;
    //Distance between two ground plane vertices
    var delta = width / resolution;
    //Radius of the sphere onto which the ground plane is bended
    var radius = 120;
    //User movement speed
    // var speed = 1.5;//fix

    //The global coordinates
    //The geometry never leaves a box of width*width around (0, 0)
    //But we track where in space the camera would be globally
    var pos = new THREE.Vector2(0, 0);

    //Number of blades
    var instances = 40000;
    // if (mobile) {
    instances = 7000;
    width = 50;
    // }

    //Sun
    //Height over horizon in range [0, PI/2.0]
    var elevation = 0.25;
    //Rotation around Y axis in range [0, 2*PI]
    var azimuth = 2.0;

    // var fogFade = 0.005; //fix

    //Lighting variables for grass
    var ambientStrength = 0.6;
    var translucencyStrength = 1.4;
    var specularStrength = 0.5;
    var diffuseStrength = 2.2;
    var shininess = 256;
    var sunColour = new THREE.Vector3(1.0, 1.0, 1.0);
    var specularColour = new THREE.Vector3(1.0, 1.0, 1.0);

    //************** Ground **************
    //Ground material is a modification of the existing THREE.MeshPhongMaterial rather than one from scratch
    var groundBaseGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);
    groundBaseGeometry.lookAt(new THREE.Vector3(0, 1, 0));
    groundBaseGeometry.verticesNeedUpdate = true;

    var groundGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);
    groundGeometry.addAttribute('basePosition', groundBaseGeometry.getAttribute('position'));
    groundGeometry.lookAt(new THREE.Vector3(0, 1, 0));
    groundGeometry.verticesNeedUpdate = true;
    var groundMaterial = new THREE.MeshPhongMaterial({ color: 0x414033 }); //0x000300
    // var groundMaterial = new THREE.MeshBasicMaterial({color: 0x414033});//0x000300

    // var groundShader;//fix
    groundMaterial.onBeforeCompile = function (shader) {
      shader.uniforms.delta = { value: delta };
      shader.uniforms.posX = { value: pos.x };
      shader.uniforms.posZ = { value: pos.z };
      shader.uniforms.radius = { value: radius };
      shader.uniforms.width = { value: width };
      shader.vertexShader = groundVertexPrefix + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
                              pos.x = basePosition.x - mod(mod((delta*posX),delta) + delta, delta);
                              pos.z = basePosition.z - mod(mod((delta*posZ),delta) + delta, delta);
                              pos.y = max(0.0, placeOnSphere(pos)) - radius;
                              //pos.y += 10.0*getYPosition(vec2(basePosition.x+delta*floor(posX), basePosition.z+delta*floor(posZ)));
                              vec3 objectNormal = getNormal(pos);
                        #ifdef USE_TANGENT
                              vec3 objectTangent = vec3( tangent.xyz );
                        #endif`,
      );
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = vec3(pos);`);
      // groundShader = shader;
    };

    // var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.geometry.computeVertexNormals();
    // ground.scale.set(20, 3, 3);
    // ground.position.y = 8;
    // ground.position.z = 410;
    // this.scene.add(ground);

    //Define base geometry that will be instanced. We use a plane for an individual blade of grass
    var grassBaseGeometry = new THREE.PlaneBufferGeometry(bladeWidth, bladeHeight, 1, joints);
    grassBaseGeometry.translate(0, bladeHeight / 2, 0);

    //Define the bend of the grass blade as the combination of three quaternion rotations
    let vertex = new THREE.Vector3();
    let quaternion0 = new THREE.Quaternion();
    let quaternion1 = new THREE.Quaternion();
    let x, y, z, w, angle, sinAngle; //rotationAngle

    //Rotate around Y
    angle = 0.05;
    sinAngle = Math.sin(angle / 2.0);
    var rotationAxis = new THREE.Vector3(0, 1, 0);
    x = rotationAxis.x * sinAngle;
    y = rotationAxis.y * sinAngle;
    z = rotationAxis.z * sinAngle;
    w = Math.cos(angle / 2.0);
    quaternion0.set(x, y, z, w);

    //Rotate around X
    angle = 0.3;
    sinAngle = Math.sin(angle / 2.0);
    rotationAxis.set(1, 0, 0);
    x = rotationAxis.x * sinAngle;
    y = rotationAxis.y * sinAngle;
    z = rotationAxis.z * sinAngle;
    w = Math.cos(angle / 2.0);
    quaternion1.set(x, y, z, w);

    //Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1);

    //Rotate around Z
    angle = 0.1;
    sinAngle = Math.sin(angle / 2.0);
    rotationAxis.set(0, 0, 1);
    x = rotationAxis.x * sinAngle;
    y = rotationAxis.y * sinAngle;
    z = rotationAxis.z * sinAngle;
    w = Math.cos(angle / 2.0);
    quaternion1.set(x, y, z, w);

    //Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1);

    let quaternion2 = new THREE.Quaternion();

    //Bend grass base geometry for more organic look
    for (let v = 0; v < grassBaseGeometry.attributes.position.array.length; v += 3) {
      quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      vertex.x = grassBaseGeometry.attributes.position.array[v];
      vertex.y = grassBaseGeometry.attributes.position.array[v + 1];
      vertex.z = grassBaseGeometry.attributes.position.array[v + 2];
      let frac = vertex.y / bladeHeight;
      quaternion2.slerp(quaternion0, frac);
      vertex.applyQuaternion(quaternion2);
      grassBaseGeometry.attributes.position.array[v] = vertex.x;
      grassBaseGeometry.attributes.position.array[v + 1] = vertex.y;
      grassBaseGeometry.attributes.position.array[v + 2] = vertex.z;
    }

    grassBaseGeometry.computeFaceNormals();
    grassBaseGeometry.computeVertexNormals();
    // var baseMaterial = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    // var baseBlade = new THREE.Mesh(grassBaseGeometry, baseMaterial);
    //Show grass base geometry
    //scene.add(baseBlade);

    var instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.index = grassBaseGeometry.index;
    instancedGeometry.attributes.position = grassBaseGeometry.attributes.position;
    instancedGeometry.attributes.uv = grassBaseGeometry.attributes.uv;
    instancedGeometry.attributes.normal = grassBaseGeometry.attributes.normal;
    // Each instance has its own data for position, orientation and scale
    var indices = [];
    var offsets = [];
    var scales = [];
    var halfRootAngles = [];
    //For each instance of the grass blade
    for (let i = 0; i < instances; i++) {
      indices.push(i / instances);
      //Offset of the roots
      let x = Math.random() * width - width / 2;
      let z = Math.random() * width - width / 2;
      let y = 0;
      offsets.push(x, y, z);
      //Random orientation
      let angle = Math.PI - Math.random() * (2 * Math.PI);
      halfRootAngles.push(Math.sin(0.5 * angle), Math.cos(0.5 * angle));
      //Define variety in height
      if (i % 3 !== 0) {
        scales.push(2.0 + Math.random() * 1.25);
      } else {
        scales.push(2.0 + Math.random());
      }
    }
    var offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
    var scaleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(scales), 1);
    var halfRootAngleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngles), 2);
    var indexAttribute = new THREE.InstancedBufferAttribute(new Float32Array(indices), 1);
    instancedGeometry.setAttribute('offset', offsetAttribute);
    instancedGeometry.setAttribute('scale', scaleAttribute);
    instancedGeometry.setAttribute('halfRootAngle', halfRootAngleAttribute);
    instancedGeometry.setAttribute('index', indexAttribute);
    //Get alpha map and blade texture
    //These have been taken from "Realistic real-time grass rendering" by Eddie Lee, 2010
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    var texture = loader.load('grass/blade_diffuse.jpg');
    var alphaMap = loader.load('grass/blade_alpha.jpg');
    //Define the material, specifying attributes, uniforms, shaders etc.
    var grassMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        time: { type: 'float', value: 0 },
        delta: { type: 'float', value: delta },
        posX: { type: 'float', value: pos.x },
        posZ: { type: 'float', value: pos.z },
        radius: { type: 'float', value: radius },
        width: { type: 'float', value: width },
        map: { value: texture },
        alphaMap: { value: alphaMap },
        sunDirection: {
          type: 'vec3',
          value: new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth)),
        },
        // cameraPosition: {type: 'vec3', value: this.camera.position},
        ambientStrength: { type: 'float', value: ambientStrength },
        translucencyStrength: { type: 'float', value: translucencyStrength },
        diffuseStrength: { type: 'float', value: diffuseStrength },
        specularStrength: { type: 'float', value: specularStrength },
        shininess: { type: 'float', value: shininess },
        lightColour: { type: 'vec3', value: sunColour },
        specularColour: { type: 'vec3', value: specularColour },
      },
      vertexShader: grassVertexSource,
      fragmentShader: grassFragmentSource,
      side: THREE.DoubleSide,
    });
    //草
    var grass = new THREE.Mesh(instancedGeometry, grassMaterial);
    grass.name = 'grass';
    grass.scale.set(1.2, 1.2, 1.2);
    //平地
    var ground = new THREE.Mesh(groundGeometry, GRASS_LIGHT_MATERIAL2); //groundMaterial
    ground.geometry.computeVertexNormals();
    ground.scale.set(1.2, 1.2, 1.2);

    addGrass(grass, 127 - 90, 4, 116);
    addGrassGround(ground, 127 - 90, 4, 116);
    addGrass(grass, 127, 4, 116);
    addGrassGround(ground, 127, 4, 116);
    addGrass(grass, 127 + 90, 4, 116);
    addGrassGround(ground, 127 + 90, 4, 116);

    function addGrass(originGrass, x, y, z) {
      var grass = originGrass.clone();
      grass.position.set(x, y, z);
      that.scene.add(grass);
    }

    function addGrassGround(origin, x, y, z) {
      var ground = origin.clone();
      ground.position.set(x, 0.5, z);
      that.scene.add(ground);
    }
  };

  updateScene = (json) => {
    const that = this;
    // city

    // DriverSchool
    if (AREA_TRAIN) {
      console.log('clear scene');

      // window.cancelAnimationFrame(this.requestID);
      this.scene.remove(AREA_TRAIN);
      this.scene.traverse(function (e) {
        if (e.name === 'tree' || e.name === 'text' || e.name === 'obstacle' || e.name === 'grass') {
          // || e instanceof THREE.Mesh && e !== plane
          REMOVE_OBJECTS.push(e);
        }
      });
      for (let i = 0; i < REMOVE_OBJECTS.length; i++) {
        this.scene.remove(REMOVE_OBJECTS[i]);
      }
      REMOVE_OBJECTS.splice(0, REMOVE_OBJECTS.length);
      // AREA_TRAIN.geometry.dispose();//fix：Possible Unhandled Promise Rejection: TypeError: Cannot read property 'dispose' of undefined
      // AREA_TRAIN.material.dispose();
      AREA_TRAIN = null;
      AREA_TRAIN = new DriverSchool().createTrainArea(json);
      this.scene.add(AREA_TRAIN);
    } else {
      console.log('createTrainArea');
      AREA_TRAIN = new DriverSchool().createTrainArea(json);
      // AREA_TRAIN.rotation.y = Math.PI * 0.5;//食堂 调整角度
      this.scene.add(AREA_TRAIN);
    }

    //////////////////////////////////////////////////////////////////////////////////
    //	    robot training								//
    //////////////////////////////////////////////////////////////////////////////////
    function DriverSchool() {
      // build the base geometry for each building
      var _geometry = new THREE.BoxGeometry(1, 1, 1);
      // translate the geometry to place the pivot point at the bottom instead of the center
      _geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0)); //0, 0.5, 0
      // get rid of the bottom face - it is never seen
      _geometry.faces.splice(3, 1);
      _geometry.faceVertexUvs[0].splice(3, 1);
      var buildingMesh = new THREE.Mesh(_geometry);
      // var brickRoadW = 100 //砖石路面宽度（砖石地外边缘与路肩的距离）
      // var kerbH = 1;//路肩高度
      // var kerbW = 3;//路肩宽度
      var wallH = 30; //围墙高度
      // var wallW = 3;//围墙宽度
      var outW = TRAINLAND_MARGIN; //场地向外拓展距离
      var outWofBase = outW + 1000;

      // 环境配置

      this.createBuilding = function () {
        return buildingMesh;
      };

      this.createTrainArea = function (json) {
        var object3d = new THREE.Object3D();

        var forbidLine = this.createForbidLine(json);
        object3d.add(forbidLine);

        this.createTrainRoad(json);

        var brickRoad = this.createBrickRoad(json);
        object3d.add(brickRoad);
        var wall = this.createWall(json);
        object3d.add(wall);

        this.creatTrees(json);

        var hasObstacle = false;
        for (let i = 0; i < json.itemDatas.length; i++) {
          if (json.itemDatas[i].itemID === 20300) {
            hasObstacle = true;
            var obstacle = this.createObstacle(json.itemDatas[i]);
            object3d.add(obstacle);
          }
        }
        if (hasObstacle) {
          // that.createGrass(json);
          var flowerBed = this.createFlowerBed(json);
          object3d.add(flowerBed);
          var flowerFence = this.createFlowerFence(json);
          object3d.add(flowerFence);
        }
        return object3d;
      };

      this.createForbidLine = function (jsObject) {
        var object3d = new THREE.Object3D();
        var solidLineGeometry = new THREE.Geometry();
        var errorLineGeometry = new THREE.Geometry();
        // var cloudLineGeometry = new THREE.Geometry();
        // var dottedLineGeometry = new THREE.Geometry();
        for (let i = 0; i < jsObject.itemDatas.length; i++) {
          function drawItem(itemData) {
            for (let i = 0; i < itemData.drawLines.length; i++) {
              function drawItemLine(lineData) {
                //实线处理
                var geometry = new THREE.Geometry();
                // if (itemData.itemID === 20300) return;
                if (itemData.itemID === 20300) {
                  //fieldCode 6,7 直角转弯20700  8上坡20300
                  if (lineData.index === -1) lineData.endZ = lineData.startZ = 7500;
                  geometry.vertices.push(
                    new THREE.Vector3(
                      lineData.startX / 100.0,
                      lineData.startZ / 100.0 - BASE_H2 + 0.4,
                      -lineData.startY / 100.0,
                    ),
                  );
                  geometry.vertices.push(
                    new THREE.Vector3(
                      lineData.endX / 100.0,
                      lineData.endZ / 100.0 - BASE_H2 + 0.4,
                      -lineData.endY / 100.0,
                    ),
                  );
                } else {
                  geometry.vertices.push(
                    new THREE.Vector3(lineData.startX / 100.0, FORBIDLINE_HEIGHT, -lineData.startY / 100.0),
                  );
                  geometry.vertices.push(
                    new THREE.Vector3(lineData.endX / 100.0, FORBIDLINE_HEIGHT, -lineData.endY / 100.0),
                  );
                }
                var line = new THREE.Line(geometry, undefined);
                line.updateMatrix();
                //虚线处理
                let points = [];
                points.push(lineData.startX / 100.0, FORBIDLINE_HEIGHT, -lineData.startY / 100.0);
                points.push(lineData.endX / 100.0, FORBIDLINE_HEIGHT, -lineData.endY / 100.0);

                if (lineData.type === 0) {
                  //实线
                  solidLineGeometry.merge(line.geometry, line.matrix);
                } else if (lineData.type === 1) {
                  //错误线
                  errorLineGeometry.merge(line.geometry, line.matrix);
                } else if (lineData.type === 2) {
                  //云线
                  // cloudLineGeometry.merge(line.geometry, line.matrix)
                  line = new THREE.Line(geometry, FORBIDLINE_CLOUD_MATERAIL);
                  line.computeLineDistances(); //不可或缺的，若无，则线段不能显示为虚线
                  object3d.add(line);
                } else if (lineData.type === 3) {
                  //虚线
                  // dottedLineGeometry.merge(line.geometry, line.matrix)
                  line = new THREE.Line(geometry, FORBIDLINE_DOTTED_MATERAIL);
                  line.computeLineDistances(); //不可或缺的，若无，则线段不能显示为虚线
                  object3d.add(line);
                }
              }

              drawItemLine(itemData.drawLines[i]);
            }
          }

          drawItem(jsObject.itemDatas[i]);
        }

        var solidLine = new THREE.LineSegments(solidLineGeometry, FORBIDLINE_SOLID_MATERAIL);
        object3d.add(solidLine);

        var errorLine = new THREE.LineSegments(errorLineGeometry, FORBIDLINE_CLOUD_MATERAIL);
        object3d.add(errorLine);

        // var cloudLine = new THREE.LineSegments(cloudLineGeometry, FORBIDLINE_CLOUD_MATERAIL)
        // object3d.add(cloudLine)

        // var dottedLine = new THREE.LineSegments(dottedLineGeometry, FORBIDLINE_DOTTED_MATERAIL)
        // object3d.add(dottedLine)

        return object3d;
      };

      this.createBrickRoad = function (jsObject) {
        let list = []; // 用来装点位的数组
        var mnX = jsObject.startX / 100.0 - outW;
        var mxX = jsObject.endX / 100.0 + outW;
        var mnY = jsObject.startY / 100.0 - outW;
        var mxY = jsObject.endY / 100.0 + outW;
        list.push(new THREE.Vector2(mnX, mnY));
        list.push(new THREE.Vector2(mxX, mnY));
        list.push(new THREE.Vector2(mxX, mxY));
        list.push(new THREE.Vector2(mnX, mxY));

        POLYGON_POINTS_AREA[0] = [mnX, mnY];
        POLYGON_POINTS_AREA[1] = [mxX, mnY];
        POLYGON_POINTS_AREA[2] = [mxX, mxY];
        POLYGON_POINTS_AREA[3] = [mnX, mxY];

        // 用这些点位生成一个 Geometry
        // let brickRoadGeometry = new THREE.ShapeGeometry(new THREE.Shape(list));

        // 刚体

        var sx = mxX - mnX; //40;
        var sy = 0.1;
        var sz = mxY - mnY; //16;
        pos.set(0, sy * 0.5, 0);
        quat.set(0, 0, 0, 1); //同时修改图像和物理 -1, 0, 0, 1
        const brickRoadMesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), BRICK_STONE_MATERIAL);
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(margin);
        that.createRigidBody(brickRoadMesh, shape, 0, pos, quat, undefined);
        brickRoadMesh.castShadow = true;
        brickRoadMesh.receiveShadow = true;

        //fix:地平面

        let list2 = []; // 用来装点位的数组
        mnX = jsObject.startX / 100.0 - outWofBase;
        mxX = jsObject.endX / 100.0 + outWofBase;
        mnY = jsObject.startY / 100.0 - outWofBase;
        mxY = jsObject.endY / 100.0 + outWofBase;
        list2.push(new THREE.Vector2(mnX, mnY));
        list2.push(new THREE.Vector2(mxX, mnY));
        list2.push(new THREE.Vector2(mxX, mxY));
        list2.push(new THREE.Vector2(mnX, mxY));
        let baseGroundGeometry = new THREE.ShapeGeometry(new THREE.Shape(list2));
        var baseGroundMesh = new THREE.Mesh(baseGroundGeometry, BASE_GROUND_MATERIAL);
        baseGroundMesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
        baseGroundMesh.position.y = -0.5;
        that.scene.add(baseGroundMesh);
        return brickRoadMesh;
      };

      this.createTrainRoad = function (jsObject) {
        let trainRoadGeometry = new THREE.Geometry();
        for (let i = 0; i < jsObject.itemDatas.length; i++) {
          function drawItem(itemData) {
            // let list = [];// 用来装点位的数组
            if (itemData.itemID === 20300) {
              // 初始化几何形状
              var geometry = new THREE.Geometry();
              // 设置顶点位置
              if (itemData.pointList.length === 0) return;
              for (let i = 0; i < itemData.pointList.length; i++) {
                geometry.vertices.push(
                  new THREE.Vector3(
                    itemData.pointList[i].point.x / 100.0,
                    itemData.pointList[i].point.y / 100.0,
                    itemData.pointList[i].point.z / 100.0 - BASE_H2 + 0.3,
                  ),
                ); //1号点高度7498
                // console.log(itemData.pointList[i].point);
              }
              var tmpx = (itemData.pointList[4].point.x + itemData.pointList[5].point.x) / 2.0;
              creatStopSign(
                new THREE.Vector3(
                  tmpx / 100.0,
                  itemData.pointList[5].point.z / 100.0 - BASE_H2 + 5,
                  -itemData.pointList[5].point.y / 100.0,
                ),
              );
              // creatShangPoSign(new THREE.Vector3(itemData.pointList[0].point.x / 100.0,
              //     itemData.pointList[0].point.z / 100.0 - BASE_H2 + 5, -itemData.pointList[0].point.y / 100.0));

              // 设置顶点连接情况
              geometry.faces.push(new THREE.Face3(0, 8, 7));
              geometry.faces.push(new THREE.Face3(7, 11, 0));

              let mesh = new THREE.Mesh(geometry, TRAINROAD_MATERIAL);
              mesh.name = 'obstacle';
              mesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
              that.scene.add(mesh);
            }

            if (itemData.point) {
              //添加文字
              var textInMesh = createTextInMesh(' ' + itemData.fieldCode.toString() + ' ', {
                fontsize: 100, //20
                borderColor: { r: 255, g: 255, b: 255, a: 1 } /* 边框透明 */,
                backgroundColor: {
                  r: 255,
                  g: 255,
                  b: 255,
                  a: 0,
                } /* 背景颜色透明 */,
                fillStyle: { r: 255, g: 255, b: 255, a: 1.0 } /* 字体颜色 */,
              });
              textInMesh.name = 'text';
              textInMesh.scale.set(2.3, 2.3, 0); //3, 3, 0
              textInMesh.position.x = itemData.point.x / 100.0 + 8;
              if (itemData.itemID === 20300) {
                textInMesh.position.y = 6;
                textInMesh.rotation.y = (6 * Math.PI) / 180;
              } else {
                textInMesh.position.y = 0.6;
              }
              textInMesh.position.z = -itemData.point.y / 100.0;
              textInMesh.rotation.x = -Math.PI / 2;
              that.scene.add(textInMesh);
            }
          }

          drawItem(jsObject.itemDatas[i]);

          function createTextInMesh(message, parameters) {
            if (parameters === undefined) parameters = {};

            /* 字体大小 */
            var fontsize = parameters.hasOwnProperty('fontsize') ? parameters['fontsize'] : 18;

            /* 边框厚度 */
            var borderThickness = parameters.hasOwnProperty('borderThickness') ? parameters['borderThickness'] : 4;

            /* 边框颜色 */
            var borderColor = parameters.hasOwnProperty('borderColor')
              ? parameters['borderColor']
              : { r: 0, g: 0, b: 0, a: 1.0 };

            /* 背景颜色 */
            var backgroundColor = parameters.hasOwnProperty('backgroundColor')
              ? parameters['backgroundColor']
              : { r: 255, g: 255, b: 255, a: 1.0 };

            /* 创建画布 */
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            var fontface = parameters.hasOwnProperty('fontface') ? parameters['fontface'] : 'Arial';
            /* 字体加粗 */
            context.font = 'Bold ' + fontsize + 'px ' + fontface;

            /* 获取文字的大小数据，高度取决于文字的大小 */
            var metrics = context.measureText(message);
            var textWidth = metrics.width;

            /* 背景颜色 */
            context.fillStyle =
              'rgba(' +
              backgroundColor.r +
              ',' +
              backgroundColor.g +
              ',' +
              backgroundColor.b +
              ',' +
              backgroundColor.a +
              ')';

            /* 边框的颜色 */
            context.strokeStyle =
              'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
            context.lineWidth = borderThickness;

            /* 绘制圆角矩形 */
            roundRect(
              context,
              borderThickness / 2,
              borderThickness / 2,
              textWidth + borderThickness,
              fontsize * 1.4 + borderThickness,
              30,
            ); //r 圆角半径 6

            /* 字体颜色 */
            var fillStyle = parameters.hasOwnProperty('fillStyle')
              ? parameters['fillStyle']
              : { r: 0, g: 0, b: 0, a: 1.0 };
            context.fillStyle = 'rgba(' + fillStyle.r + ',' + fillStyle.g + ',' + fillStyle.b + ',' + fillStyle.a + ')'; //fix
            context.fillText(message, borderThickness, fontsize + borderThickness);

            /* 画布内容用于纹理贴图 */
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            let material = new THREE.MeshBasicMaterial({
              map: texture,
              flatShading: true,
              transparent: true,
              opacity: 1,
            });
            var geometry = new THREE.PlaneGeometry(15, 5);
            let textMesh1 = new THREE.Mesh(geometry, material);
            return textMesh1;
          }

          /* 绘制圆角矩形 */
          function roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          //停止标志
          function creatStopSign(pos) {
            const loader = new OBJLoader();
            new MTLLoader().load('signs/StopSign.mtl', function (materials) {
              loader.setMaterials(materials);
              loader.load('signs/StopSign.obj', function (object) {
                object.scale.set(3, 3, 3);
                object.position.set(pos.x, pos.y, pos.z);
                object.name = 'obstacle';
                that.scene.add(object);
              });
            });
          }
        }

        // 恢复高度 如果你需要 可以改成原本高度,也可以你随意的
        for (let i = 0; i < trainRoadGeometry.vertices.length; i++) {
          trainRoadGeometry.vertices[i].z = 0.3;
        }
        let mesh = new THREE.Mesh(trainRoadGeometry, TRAINROAD_MATERIAL);
        mesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
        return mesh;
      };

      this.createFlowerBed = function (jsObject) {
        let flowerBedGeometry = new THREE.Geometry();
        // console.log(jsObject.grassPoints.length)
        for (let i = 0; i < jsObject.grassPoints.length; i++) {
          function drawItem(points) {
            // console.log(points.length)
            let list = []; // 用来装点位的数组
            if (points.length === 0) return;
            for (let i = 0; i < points.length; i++) {
              list.push(new THREE.Vector2(points[i].x / 100.0, points[i].y / 100.0));
            }
            // 用这些点位生成一个 Geometry
            let shapeGeometry = new THREE.ShapeGeometry(new THREE.Shape(list));
            let mesh = new THREE.Mesh(shapeGeometry, undefined);
            flowerBedGeometry.merge(mesh.geometry, mesh.matrix);
          }

          drawItem(jsObject.grassPoints[i]);
        }

        // 恢复高度 如果你需要 可以改成原本高度,也可以你随意的
        for (let i = 0; i < flowerBedGeometry.vertices.length; i++) {
          flowerBedGeometry.vertices[i].z = 1.1;
        }
        // createContainer(new THREE.Vector3(-95, 0, 67), new THREE.Vector3(200, 0, -270));
        createStationBus(
          new THREE.Vector3(-92 + OFFSET_X, 0, 87 + OFFSET_Z),
          new THREE.Vector3(200 + OFFSET_X, 0, -240 + OFFSET_Z),
        );
        // createBarreraPeaje(new THREE.Vector3(0, 0, 0));
        // createTrafficCone(new THREE.Vector3(0, 0, 0));
        // createWoodSign(new THREE.Vector3(0, 100, 0));
        // createPlasticJerseyBarricade(new THREE.Vector3(0, 0, 0));
        // createHedge(new THREE.Vector3(0, 0, 0));
        // createGate(new THREE.Vector3(0, 0, 0));
        // createShortTree(new THREE.Vector3(0, 0, 0));
        // createShortTree2(new THREE.Vector3(0, 0, 0));

        let mesh = new THREE.Mesh(flowerBedGeometry, GRASS_LIGHT_MATERIAL);
        mesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
        return mesh;

        function createStationBus(pos, pos1) {
          const loader = new OBJLoader();
          new MTLLoader().load('buildings/stationBus.mtl', function (materials) {
            loader.setMaterials(materials);
            loader.load('buildings/stationBus.obj', function (object) {
              object.scale.set(3.5, 4, 6);
              object.position.set(pos.x, pos.y, pos.z);
              object.name = 'obstacle';
              that.scene.add(object);

              var object2 = object.clone();
              object2.scale.set(6, 6, 6);
              object2.position.set(pos1.x, pos1.y, pos1.z);
              that.scene.add(object2);
            });
          });
        }
      };

      this.createFlowerFence = function (jsObject) {
        var object3d = new THREE.Object3D();
        var kerbGeometry = new THREE.BoxGeometry(1, 1, 1);
        kerbGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
        // var kerbMesh = new THREE.Mesh(kerbGeometry)
        // var kerbsGeometry = new THREE.Geometry();
        for (let i = 0; i < jsObject.grassPoints.length; i++) {
          function drawItem(points) {
            for (let i = 0; i < points.length - 1; i++) {
              var item = that.createCylinderByTwoPoints2(
                new THREE.Vector3(points[i].x / 100.0, FLOWER_FENCE_H, -points[i].y / 100.0),
                new THREE.Vector3(points[i + 1].x / 100.0, FLOWER_FENCE_H, -points[i + 1].y / 100.0),
              );
              object3d.add(item);
            }
            item = that.createCylinderByTwoPoints2(
              new THREE.Vector3(
                points[points.length - 1].x / 100.0,
                FLOWER_FENCE_H,
                -points[points.length - 1].y / 100.0,
              ),
              new THREE.Vector3(points[0].x / 100.0, FLOWER_FENCE_H, -points[0].y / 100.0),
            );
            object3d.add(item);
          }

          drawItem(jsObject.grassPoints[i]);
        }
        return object3d;
      };

      this.createWall = function (jsObject) {
        var wallGeometry = new THREE.BoxGeometry(1, 1, 1);
        wallGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
        var mnX = jsObject.startX / 100.0 - outW;
        var mxX = jsObject.endX / 100.0 + outW;
        var mnY = jsObject.startY / 100.0 - outW;
        var mxY = jsObject.endY / 100.0 + outW;

        // build the mesh
        // 纹理
        const wallTextloader = new THREE.TextureLoader();
        const wallTexture = wallTextloader.load('images/concrete_panel_04_diffuse.png');
        wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(300, 3); //4,4
        wallTexture.anisotropy = 16;
        wallTexture.encoding = THREE.sRGBEncoding;
        var wallsMaterial = new THREE.MeshLambertMaterial({ map: wallTexture });

        var object3d = new THREE.Object3D();
        //(mnX,mnY) (mnX,mxY)
        var geometry = new THREE.PlaneGeometry(mxY - mnY, wallH);
        let mesh = new THREE.Mesh(geometry, wallsMaterial);
        mesh.position.x = mnX;
        mesh.position.y = wallH / 2.0;
        mesh.lookAt(new THREE.Vector3(1, 0, 0)); //调正位面
        object3d.add(mesh);
        //(mnX,mxY) (mxX,mxY)
        var geometry2 = new THREE.PlaneGeometry(mxX - mnX, wallH);
        let mesh2 = new THREE.Mesh(geometry2, wallsMaterial);
        mesh2.position.y = wallH / 2.0;
        mesh2.position.z = -mnY;
        mesh2.lookAt(new THREE.Vector3(0, 0, 1)); //调正位面
        object3d.add(mesh2);
        //(mxX,mxY) (mxX,mnY)
        let mesh3 = new THREE.Mesh(geometry, wallsMaterial);
        mesh3.position.x = -mnX;
        mesh3.position.y = wallH / 2.0;
        mesh3.lookAt(new THREE.Vector3(-1, 0, 0)); //调正位面
        object3d.add(mesh3);
        //(mxX,mnY) (mnX,mnY)
        let mesh4 = new THREE.Mesh(geometry2, wallsMaterial);
        mesh4.position.y = wallH / 2.0;
        mesh4.position.z = mnY;
        mesh4.lookAt(new THREE.Vector3(0, 0, -1)); //调正位面
        object3d.add(mesh4);
        // */
        object3d.add(createBrickIronWall(mnX, mnY, mxX, mxY)); //fix

        return object3d;

        function createBrickIronWall(mnX, mnY, mxX, mxY) {
          var object3d = new THREE.Object3D();
          const offset = 50.5;
          // 砖石栏杆墙
          new FBXLoader().load('wall/wall.fbx', function (object) {
            object.scale.set(5, 5, 5);
            object.name = 'obstacle';
            for (let x = mnX; x < mxX; ) {
              addWall(object, x, 0, mnY);
              x += offset;
            }
            for (let x = mnX; x < mxX; ) {
              addWall(object, x, 0, mxY);
              x += offset;
            }

            var wallNS = object.clone();
            wallNS.rotation.y = Math.PI / 2.0;

            for (let y = mnY; y < mxY; ) {
              addWall(wallNS, mnX, 0, y);
              y += offset;
            }
            for (let y = mnY; y < mxY; ) {
              addWall(wallNS, mxX, 0, y);
              y += offset;
            }

            function addWall(origin, posX, posY, posZ) {
              var wall = origin.clone();
              wall.position.set(posX, posY, posZ);
              object3d.add(wall);
            }
          });
          // });
          return object3d;
        }
      };

      this.createObstacle = function (itemData) {
        var object3d = new THREE.Object3D();
        object3d.name = 'obstacle';

        for (let i = 0; i < itemData.otherPointList.length - 1; i++) {
          if (i === 3) continue;
          drawBarrier(itemData.otherPointList[i], itemData.otherPointList[i + 1]);
        }

        var offsetX = 19;
        var offsetZ = 6; //13
        POLYGON_RAMP_POINTS[0] = [
          itemData.otherPointList[0].x / 100.0 + offsetX,
          -itemData.otherPointList[0].y / 100.0 - offsetZ,
        ];
        POLYGON_RAMP_POINTS[1] = [
          itemData.otherPointList[3].x / 100.0 - offsetX,
          -itemData.otherPointList[3].y / 100.0 - offsetZ,
        ];
        POLYGON_RAMP_POINTS[2] = [
          itemData.otherPointList[4].x / 100.0 - offsetX,
          -itemData.otherPointList[4].y / 100.0 + offsetZ,
        ];
        POLYGON_RAMP_POINTS[3] = [
          itemData.otherPointList[7].x / 100.0 + offsetX,
          -itemData.otherPointList[7].y / 100.0 + offsetZ,
        ];
        //temp:绘制坡道检测区域
        that.drawSLinesFromArr(
          POLYGON_RAMP_POINTS,
          'obstacle',
          new THREE.LineDashedMaterial({
            side: THREE.DoubleSide,
            // lineWidth: 20,//无效
            color: 0xffffff, //线段的颜色
            dashSize: 1, //短划线的大小
            // gapSize: 3,//短划线之间的距离
            scale: 1.0, // 比例越大，虚线越密；反之，虚线越疏
            transparent: true,
            opacity: 0.5,
          }),
        );

        function drawBarrier(p1, p2) {
          var item = that.createCylinderByTwoPoints(
            new THREE.Vector3(p1.x / 100.0, p1.z / 100.0 - BASE_H2, -p1.y / 100.0),
            new THREE.Vector3(p2.x / 100.0, p2.z / 100.0 - BASE_H2, -p2.y / 100.0),
          );
          object3d.add(item);
        }

        var ramp = new THREE.Group();
        var offsetx = OFFSET_X;
        var obstacleZ = 246 + OFFSET_Z;
        var obstacleW = 72;
        //上坡
        pos.set(230 + offsetx, -2.0, obstacleZ);
        quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (-4.4 * Math.PI) / 180);
        const obstacleUp = createParalellepiped(
          158,
          15,
          obstacleW,
          0,
          pos,
          combineRotation(quat),
          BRICK_STONE_MATERIAL2,
        );
        obstacleUp.castShadow = true;
        obstacleUp.receiveShadow = true;
        ramp.add(obstacleUp);
        //坡顶
        pos.set(126 + offsetx, 4.03, obstacleZ - 4.1);
        quat.setFromAxisAngle(new THREE.Vector3(0, 0, 0), (4.7 * Math.PI) / 180);
        const obstacleTop = createParalellepiped(
          12 + 40,
          15,
          obstacleW,
          0,
          pos,
          combineRotation(quat),
          BRICK_STONE_MATERIAL2,
        );
        obstacleTop.castShadow = true;
        obstacleTop.receiveShadow = true;
        ramp.add(obstacleTop);
        //下坡
        pos.set(35 + offsetx, -1.4, obstacleZ - 7.6);
        quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (4.7 * Math.PI) / 180);
        const obstacleDown = createParalellepiped(
          131.8,
          15,
          obstacleW,
          0,
          pos,
          combineRotation(quat),
          BRICK_STONE_MATERIAL2,
        );
        obstacleDown.castShadow = true;
        obstacleDown.receiveShadow = true;
        ramp.add(obstacleDown);
        object3d.add(ramp);
        return object3d;

        function combineRotation(quaternionZ) {
          let quaternion0 = new THREE.Quaternion();
          let x, y, z, w, angle, sinAngle;

          //Rotate around Y y轴是竖直方向 逆时针旋转为正
          angle = (-2.3 * Math.PI) / 180.0;
          sinAngle = Math.sin(angle / 2.0);
          var rotationAxis = new THREE.Vector3(0, 1, 0);
          x = rotationAxis.x * sinAngle;
          y = rotationAxis.y * sinAngle;
          z = rotationAxis.z * sinAngle;
          w = Math.cos(angle / 2.0);
          quaternion0.set(x, y, z, w);
          quaternion0.multiply(quaternionZ);
          return quaternion0;
        }

        function createParalellepiped(sx, sy, sz, mass, pos, quat, material) {
          const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
          const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
          shape.setMargin(margin);
          that.createRigidBody(threeObject, shape, mass, pos, quat, undefined);
          return threeObject;
        }
      };

      this.creatTrees = function (jsObject) {
        var mnX = jsObject.startX / 100.0 - outW / 2.0;
        var mxX = jsObject.endX / 100.0 + outW / 2.0;
        var mnY = jsObject.startY / 100.0 - outW / 2.0;
        var mxY = jsObject.endY / 100.0 + outW / 2.0;

        const mtlLoader = new MTLLoader();
        const loader = new OBJLoader();

        mtlLoader.load('trees/Tree.mtl', function (materials) {
          loader.setMaterials(materials);
          loader.load(
            'trees/Tree.obj',
            function (object) {
              object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                  //child.material.shininess=0;
                  //在加载树木模型时，树叶的材质必须是透明的
                  child.material.transparent = true;
                  // child.shading=THREE.FlatShading
                }
              });

              object.scale.set(30, 30, 30);
              object.name = 'tree';
              var tree1 = object,
                tree2 = object.clone(),
                tree3 = object.clone(),
                tree4 = object.clone();

              tree1.position.set(mnX, 0, mnY);
              that.scene.add(tree1);

              tree2.position.set(mnX, 0, mxY);
              that.scene.add(tree2);

              tree3.position.set(mxX, 0, mnY);
              that.scene.add(tree3);

              tree4.position.set(mxX, 0, mxY);
              that.scene.add(tree4);
            },
            undefined,
            undefined,
          );
        });
      };
    }
  };

  loadCarModel = () => {
    const that = this;

    loadFBXCar();

    function loadFBXCar() {
      const loader = new FBXLoader();
      var carModel, fl, fr, rl, rr;
      loader.load('fbx/car.fbx', function (object) {
        loadbody_FBX(object);
        let offset = -3.8; //车中心从车头天线位置移动到车中心位置的位移偏差
        //轮子：R_U左前;L_U右前;R_D左后;L_D右后
        loadfl_FBX(object.getObjectByName('R_U'), -7, 3.05, -9 + offset);
        loadfr_FBX(object.getObjectByName('L_U'), 7, 3.05, -9 + offset);
        loadrl_FBX(object.getObjectByName('R_D'), -7, 3.05, 16 + offset);
        loadrr_FBX(object.getObjectByName('L_D'), 7, 3.05, 16 + offset);
      });

      function loadbody_FBX(object) {
        carModel = object;
        carParent.add(carModel);

        carParentWrap.add(carParent);
        that.scene.add(carParentWrap);
        that.model = carParentWrap;
      }

      //轮子：R_U左前;L_U右前;R_D左后;L_D右后
      function loadfl_FBX(object, x, y, z) {
        that.scene.add(object);
        fl = object;
        var wrapper = new THREE.Group();
        wrapper.position.set(x, y, z); //y是高度，z是y方向的值
        wrapper.add(fl);
        fl.position.set(-x, -y, -z);
        wheels.push(wrapper);
        wrapper.position.set(0, 0, 0);
        wheel_fl.add(wrapper);
        wheel_fl.position.set(x, y, z);
        carParent.add(wheel_fl);
      }

      function loadfr_FBX(object, x, y, z) {
        that.scene.add(object);
        fr = object;
        var wrapper = new THREE.Group();
        wrapper.position.set(x, y, z);
        wrapper.add(fr);
        fr.position.set(-x, -y, -z);
        wheels.push(wrapper);
        wrapper.position.set(0, 0, 0);
        wheel_fr.add(wrapper);
        wheel_fr.position.set(x, y, z);
        carParent.add(wheel_fr);
      }

      function loadrl_FBX(object, x, y, z) {
        that.scene.add(object);
        rl = object;
        wheel_rl.position.set(x, y, z);
        wheel_rl.add(rl);
        rl.position.set(-x, -y, -z);
        wheels.push(wheel_rl);

        carParent.add(wheel_rl);
      }

      function loadrr_FBX(object, x, y, z) {
        that.scene.add(object);
        rr = object;
        wheel_rr.position.set(x, y, z);
        wheel_rr.add(rr);
        rr.position.set(-x, -y, -z);
        wheels.push(wheel_rr);
        carParent.add(wheel_rr);
      }
    }
  };

  updatePhysicsCar = (pos) => {
    var sx = 25;
    var sy = 12;
    var sz = 16; //40
    const carMesh = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x3485fb,
        transparent: true,
        opacity: 0.0,
      }),
    ); //fix new THREE.MeshPhongMaterial({color: 0x861d1f})
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    // const carMesh = new THREE.Mesh(new THREE.SphereGeometry(sy * 1, 32, 16),
    //     new THREE.MeshBasicMaterial({color: 0x3485fb, transparent: true, opacity: 0.5}));//new THREE.MeshPhongMaterial({color: 0x861d1f})
    // const shape = new Ammo.btSphereShape(sy * 1);
    shape.setMargin(margin);
    if (!PHYSICS_CAR_OBJECT) {
      //     this.scene.remove(PHYSICS_CAR_OBJECT);
      //     physicsWorld.addRigidBody(PHYSICS_CAR_BODY);
      this.createCar(carMesh, shape, new THREE.Vector3(pos.x, pos.y + sy * 0.5, pos.z), ZERO_QUATERNION); //(0, sy * 0.5, 5 - 3.8)
    }
  };

  createCar = (threeObject, physicsShape, pos, quat) => {
    const that = this;
    let mass = 10000;
    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(1);
    PHYSICS_CAR_OBJECT = threeObject;
    this.scene.add(threeObject);
    if (mass > 0) {
      body.setActivationState(DISABLE_DEACTIVATION);
    }
    PHYSICS_CAR_BODY = body;
    physicsWorld.addRigidBody(body);

    let offsetX = 0;
    let offsetZ = 0;
    let offsetX2 = 0;
    let offsetZ2 = 0;
    let lastX = this.state.carPosition.x;
    let lastZ = this.state.carPosition.z;

    let lastPhysX = 0;
    let lastPhysZ = 0;

    // 将键盘输入,物理和绘制同步
    function sync(dt) {
      offsetX = that.state.carPosition.x - lastX; //会累积误差
      offsetZ = that.state.carPosition.z - lastZ;

      offsetX2 = that.state.carPosition.x - lastPhysX; //计算虚实的差值，需要虚实的初始位置一致，现在physics的origin (0, 6, 1.2)，会飘走。。。
      offsetZ2 = that.state.carPosition.z - lastPhysZ;

      offsetX = offsetX + offsetX2 / 10.0; //修正
      offsetZ = offsetZ + offsetZ2 / 10.0;

      lastX = that.state.carPosition.x;
      lastZ = that.state.carPosition.z;
      // console.log(dt+','+offsetX +','+offsetZ+','+offsetX2 +','+offsetZ2)

      body.getLinearVelocity().normalize();
      body.setLinearVelocity(new Ammo.btVector3(offsetX / dt, -5, offsetZ / dt));
      const ms2 = body.getMotionState();
      if (ms2) {
        // transformAux1.setOrigin(new Ammo.btVector3(offsetx, 6, offsetz));
        // ms.setWorldTransform(transformAux1);//important

        ms2.getWorldTransform(transformAux1); //把刚体的矩阵位置存放到btTransform中
        const p = transformAux1.getOrigin();
        const q = transformAux1.getRotation();
        threeObject.position.set(p.x(), p.y(), p.z());
        if (window.carPosition) {
          threeObject.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }

        if (IS_CLIMB) {
          if (that.model) {
            that.model.position.y = p.y() - 6;
          }
          if (OPEN_PHYSICS_CAR_ANGLE) {
            const quaternion = new THREE.Quaternion(q.x(), q.y(), q.z(), q.w());
            var quat = new THREE.Quaternion(0, 0, 0, 1);
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (90 * Math.PI) / 180);
            quaternion.multiply(quat);
            carParent.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
          }
        }
        lastPhysX = p.x();
        lastPhysZ = p.z();
      }
      if (speedometer) {
        //更新速度
        var speed = 3.6 * body.getLinearVelocity().length();
        speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
      }
    }

    syncList.push(sync);
  };

  createRigidBody = (threeObject, physicsShape, mass, pos, quat, name) => {
    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    if (name === 'test') {
      // CAR_TEST_BODY = threeObject;
      body.setFriction(0.0);
    }
    threeObject.userData.physicsBody = body;
    threeObject.name = name;
    this.scene.add(threeObject);
    if (mass > 0) {
      rigidBodies.push(threeObject);
      // Disable deactivation
      body.setActivationState(DISABLE_DEACTIVATION);
    }
    physicsWorld.addRigidBody(body);
    return body;
  };

  createRigidBodyTest = (threeObject, physicsShape, mass, pos, quat, name) => {
    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    threeObject.userData.physicsBody = body;
    threeObject.name = name;
    this.scene.add(threeObject);
    if (mass > 0) {
      const CF_KINEMATIC_OBJECT = 2;
      body.setCollisionFlags(body.getCollisionFlags() | CF_KINEMATIC_OBJECT); //test
      rigidBodies.push(threeObject);
      // Disable deactivation
      body.setActivationState(DISABLE_DEACTIVATION);
    }
    physicsWorld.addRigidBody(body);
    return body;
  };

  isInPolygon = (checkPoint, polygonPoints) => {
    var counter = 0;
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];

    for (i = 1; i <= pointCount; i++) {
      p2 = polygonPoints[i % pointCount];
      if (checkPoint[0] > Math.min(p1[0], p2[0]) && checkPoint[0] <= Math.max(p1[0], p2[0])) {
        if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
          if (p1[0] !== p2[0]) {
            xinters = ((checkPoint[0] - p1[0]) * (p2[1] - p1[1])) / (p2[0] - p1[0]) + p1[1];
            if (p1[1] === p2[1] || checkPoint[1] <= xinters) {
              counter++;
            }
          }
        }
      }
      p1 = p2;
    }
    if (counter % 2 === 0) {
      return false;
    } else {
      return true;
    }
  };

  welcome = () => {
    const that = this;
    new TTFLoader().load('ttf/Calibri.ttf', function (json) {
      let text = 'Robot Coach';
      that.createText(new THREE.Font(json), text, 30);
    });
  };

  createText = (font, text, hover) => {
    const height = 2,
      size = 4, //7
      // hover = 30,//悬浮高度
      curveSegments = 4,
      bevelThickness = 0.2, //斜面厚度
      bevelSize = 0.1;
    let textGeo = new THREE.TextGeometry(text, {
      font: font,
      size: size,
      height: height,
      curveSegments: curveSegments,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: true,
    });
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();
    const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
    let material = new THREE.MeshPhongMaterial({
      color: 0xffff03,
      flatShading: true,
    });
    let textMesh1 = new THREE.Mesh(textGeo, material);
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;
    textMesh1.rotation.x = -Math.PI / 2;

    textMesh1.rotation.y = 0;
    textMesh1.rotation.z = 0;

    TEXT_GROUP = new THREE.Group();
    TEXT_GROUP.position.x = 0;
    TEXT_GROUP.position.y = 0;
    TEXT_GROUP.position.z = 0;
    this.scene.add(TEXT_GROUP);
    TEXT_GROUP.add(textMesh1);
  };

  startAnimationLoop = () => {
    const that = this;
    this.count += 1;

    if (this.model) {
      this.model.position.x = this.state.carPosition.x;
      this.model.position.y = this.state.carPosition.y; //fix：平地上也使用gps高度
      this.model.position.z = this.state.carPosition.z;
      this.model.rotation.y = (this.state.carPosition.rotation / 180) * Math.PI;
      carParent.rotation.x = (this.state.carPosition.rotationX / 180) * Math.PI; //仰角
      carParent.rotation.z = (-this.state.carPosition.rotationZ / 180) * Math.PI; //横滚角度
    }

    const time = performance.now();
    const delta = (time - this.prevTime) / 1000.0;
    for (let i = 0; i < wheels.length; i++) {
      if (this.state.carPosition.moveState === 1) {
        wheels[i].rotation.x -= (delta * this.state.carPosition.speed) / 100.0;
      } else if (this.state.carPosition.moveState === 2) {
        wheels[i].rotation.x += (delta * this.state.carPosition.speed) / 100.0;
      } else {
        wheels[i].rotation.x -= (delta * this.state.carPosition.speed) / 100.0;
      }
    }
    this.prevTime = time;
    //前轮转动
    wheel_fl.rotation.y = (-this.state.carPosition.angle / 180) * Math.PI;
    wheel_fr.rotation.y = (-this.state.carPosition.angle / 180) * Math.PI;

    // mirrorGroup.position.x = this.state.carPosition.x;
    // mirrorGroup.position.z = this.state.carPosition.z;
    // mirrorGroup.rotation.y = this.state.carPosition.rotation / 180 * Math.PI;

    cameraPosions.position.x = this.state.carPosition.x;
    cameraPosions.position.z = this.state.carPosition.z;
    cameraPosions.rotation.y = (this.state.carPosition.rotation / 180) * Math.PI;

    // const points = GeometryUtils.hilbert2D(new THREE.Vector3( 0, 0, 0 ), 10, 3);
    // drawDynamicLine(points)

    for (let i = 0; i < this.tmplines.length; i++) {
      this.scene.remove(this.tmplines[i]); //清除模型
      this.tmplines[i].material.dispose();
      this.tmplines[i].geometry.dispose();
      this.tmplines[i] = null;
    }
    this.tmplines.splice(0, this.tmplines.length);
    if (this.state.dynamicLines) {
      drawDynamicLines(this.state.dynamicLines);
    }

    const deltaTime = clock.getDelta();
    updatePhysics(deltaTime);
    processClick();

    RollTexture.offset.x -= 0.01;

    this.renderer.render(this.scene, this.camera);
    // mStats.update();
    if (ROAM_ON) {
      this.controls.update(deltaTime);
    }
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);

    function updatePhysics(deltaTime) {
      // Step world
      physicsWorld.stepSimulation(deltaTime, 10); //模拟运动

      // Update rigid bodies
      for (let i = 0, il = rigidBodies.length; i < il; i++) {
        const objThree = rigidBodies[i];
        const objPhys = objThree.userData.physicsBody;
        if (objThree.name !== 'test') {
          const ms = objPhys.getMotionState();
          if (ms) {
            ms.getWorldTransform(transformAux1); //把刚体的矩阵位置存放到btTransform中
            const p = transformAux1.getOrigin();
            const q = transformAux1.getRotation();
            if (objThree.name === 'car') {
              objThree.position.set(p.x(), p.y() - 6, p.z());
            } else {
              objThree.position.set(p.x(), p.y(), p.z());
            }
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
          }
        }
      }

      for (var i = 0; i < syncList.length; i++) syncList[i](deltaTime);
    }

    function processClick() {
      if (clickRequest) {
        raycaster.setFromCamera(mouseCoords, that.camera);

        // Creates a ball
        const ballMass = 3; //0
        const ballRadius = 0.4;

        const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 18, 16), ballMaterial);
        ball.castShadow = true;
        ball.receiveShadow = true;
        const ballShape = new Ammo.btSphereShape(ballRadius);
        ballShape.setMargin(margin);
        pos.copy(raycaster.ray.direction);
        pos.add(raycaster.ray.origin);
        quat.set(0, 0, 0, 1);
        const ballBody = that.createRigidBody(ball, ballShape, ballMass, pos, quat, undefined);
        ballBody.setFriction(0.0); //0.5

        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(14);
        ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));

        clickRequest = false;
      }
    }

    //画轨迹线
    function drawDynamicLines(jsObject) {
      if (!jsObject.dlines) return;
      for (let i = 0; i < jsObject.dlines.length; i++) {
        var type = jsObject.dlines[i].type;
        var color = jsObject.dlines[i].color;
        var points = jsObject.dlines[i].points;
        for (let i = 0; i < points.length; i++) {
          drawDynamicLine(points[i], getDefinedMaterial(type, color));
        }
        if (jsObject.point) {
          that.updateRollPlane(
            carParentWrap.position,
            new THREE.Vector3(jsObject.point.x / 100.0, 1.0, -jsObject.point.y / 100.0),
          );
        }
      }
    }

    //画轨迹线
    function drawDynamicLine(points, material) {
      //使用MeshLine
      DYNAMIC_LINE_POINTS.splice(0, DYNAMIC_LINE_POINTS.length);
      for (let i = 0; i < points.length; i++) {
        DYNAMIC_LINE_POINTS.push(points[i].x / 100.0, 1.0, -points[i].y / 100.0); //y = points[i].z/ 100.0
      }
      var line = new MeshLine();
      line.setPoints(DYNAMIC_LINE_POINTS);
      const mesh = new THREE.Mesh(line, material);
      mesh.position.y = DLINES_H;
      that.scene.add(mesh);
      that.tmplines.push(mesh);
      line.dispose(); //清除存储模型的变量
      line = null;
    }
  };

  test = () => {
    function createSelfDefineShape() {
      // 初始化几何形状
      var geometry = new THREE.Geometry();
      // 设置顶点位置
      // 顶部4顶点
      geometry.vertices.push(new THREE.Vector3(-1, 2, -1));
      geometry.vertices.push(new THREE.Vector3(1, 2, -1));
      geometry.vertices.push(new THREE.Vector3(1, 2, 1));
      geometry.vertices.push(new THREE.Vector3(-1, 2, 1));
      // 底部4顶点
      geometry.vertices.push(new THREE.Vector3(-2, 0, -2));
      geometry.vertices.push(new THREE.Vector3(2, 0, -2));
      geometry.vertices.push(new THREE.Vector3(2, 0, 2));
      geometry.vertices.push(new THREE.Vector3(-2, 0, 2));
      // 设置顶点连接情况
      // 顶面
      geometry.faces.push(new THREE.Face3(0, 1, 3));
      geometry.faces.push(new THREE.Face3(1, 2, 3));
      // 底面
      geometry.faces.push(new THREE.Face3(4, 5, 6));
      geometry.faces.push(new THREE.Face3(5, 6, 7));
      // 四个侧面
      geometry.faces.push(new THREE.Face3(1, 5, 6));
      geometry.faces.push(new THREE.Face3(6, 2, 1));
      geometry.faces.push(new THREE.Face3(2, 6, 7));
      geometry.faces.push(new THREE.Face3(7, 3, 2));
      geometry.faces.push(new THREE.Face3(3, 7, 0));
      geometry.faces.push(new THREE.Face3(7, 4, 0));
      geometry.faces.push(new THREE.Face3(0, 4, 5));
      geometry.faces.push(new THREE.Face3(0, 5, 1));

      let mesh = new THREE.Mesh(geometry, TRAINROAD_MATERIAL);
      mesh.scale.set(10, 10, 10);
      return mesh;
    }

    this.scene.add(createSelfDefineShape());
    // window.requestAnimationFrame(this.render.bind(this))
  };

  testLineFromPoint = (x, y) => {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(x, 0.0, -y));
    geometry.vertices.push(new THREE.Vector3(x, 20.0, -y));
    var line = new THREE.Line(geometry, FORBIDLINE_ERROR_MATERAIL);
    line.computeLineDistances();
    this.scene.add(line);
  };

  drawStaticLine_Array = (points, material) => {
    //使用MeshLine
    let v3Points = [];
    for (let i = 0; i < points.length; i++) {
      v3Points.push(points[i][0], 1.0, points[i][1]);
    }
    v3Points.push(points[0][0], 1.0, points[0][1]); //loop
    var line = new MeshLine();
    line.setPoints(v3Points);
    const mesh = new THREE.Mesh(line, material);
    this.scene.add(mesh);
    line.dispose(); //清除存储模型的变量
    line = null;
  };

  drawSLinesFromArr = (points, name, material) => {
    var geometry = new THREE.Geometry();
    for (let i = 0; i < points.length; i++) {
      geometry.vertices.push(new THREE.Vector3(points[i][0], 1.0, points[i][1]));
    }
    geometry.vertices.push(new THREE.Vector3(points[0][0], 1.0, points[0][1])); //loop
    var line = new THREE.Line(geometry, material);
    line.name = name;
    this.scene.add(line);
  };

  createCylinderByTwoPoints = (vstart, vend) => {
    var distance = vstart.distanceTo(vend);
    let radius = 2.5;
    var cylinder = new THREE.CylinderGeometry(radius, radius, distance, 4, 4, false);
    var mesh = new THREE.Mesh(cylinder, PARAPET_MATERIAL);
    let quaternion = new THREE.Quaternion();
    var dir = new THREE.Vector3().copy(vend).sub(vstart).normalize();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    let quaternion0 = new THREE.Quaternion();
    let x, y, z, w, angle, sinAngle;
    //Rotate around Y y轴是竖直方向 逆时针旋转为正
    angle = (45.0 * Math.PI) / 180.0;
    sinAngle = Math.sin(angle / 2.0);
    var rotationAxis = new THREE.Vector3(0, 1, 0);
    x = rotationAxis.x * sinAngle;
    y = rotationAxis.y * sinAngle;
    z = rotationAxis.z * sinAngle;
    w = Math.cos(angle / 2.0);
    quaternion0.set(x, y, z, w);
    quaternion.multiply(quaternion0);
    mesh.applyQuaternion(quaternion);
    var middle = new THREE.Vector3().copy(vstart).lerp(vend, 0.5);
    mesh.position.copy(middle);
    mesh.position.y += radius / 2.0;
    return mesh;
  };

  createCylinderByTwoPoints2 = (vstart, vend) => {
    var HALF_PI = Math.PI * 0.5;
    var distance = vstart.distanceTo(vend);
    var position = vend.clone().add(vstart).divideScalar(2);
    var cylinder = new THREE.CylinderGeometry(1.5, 1.5, distance, 4, 4, false);
    var orientation = new THREE.Matrix4(); //a new orientation matrix to offset pivot
    var offsetRotation = new THREE.Matrix4(); //a matrix to fix pivot rotation
    // var offsetPosition = new THREE.Matrix4(); //a matrix to fix pivot position
    orientation.lookAt(vstart, vend, new THREE.Vector3(0, 1, 0)); //look at destination
    offsetRotation.makeRotationX(HALF_PI); //rotate 90 degs on X
    orientation.multiply(offsetRotation); //combine orientation with rotation transformations
    cylinder.applyMatrix4(orientation);
    var mesh = new THREE.Mesh(cylinder, KERBS_MATERIAL);
    mesh.position.set(position.x, position.y, position.z);
    return mesh;
  };

  handleWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    // Note that after making changes to most of camera properties you have to call
    // .updateProjectionMatrix for the changes to take effect.
    this.camera.updateProjectionMatrix();
  };

  render() {
    const style = {
      position: 'relative',
      width: this.winWidth,
      height: this.winHeight,
    };
    return <div style={style} ref={(mount) => (this.mount = mount)}></div>;
  }

  restoreCameraDefault() {
    //camera
    this.camera.position.set(this.state.carPosition.x, CAMERA_DIST, this.state.carPosition.z);
    //相机朝向
    this.camera.rotation.x = (-90 / 180) * Math.PI; //摄像机朝上朝下
    this.camera.rotation.y = 0; //摄像机前后向旋转
    this.camera.rotation.z = 0; //摄像机手部旋转
  }

  addRollPlane = (vstart, vend) => {
    var distance = vstart.distanceTo(vend);
    if (distance < 90) return; //不显示阈值
    ARROW = new THREE.Mesh(RollGEOMETRY, RollMat);
    Rollposition = vend.clone().add(vstart).divideScalar(2);
    Rollorientation.lookAt(vstart, vend, new THREE.Vector3(0, 0, 1)); //look at destination
    RolloffsetRotation.makeRotationY(Math.PI * 0.5);
    Rollorientation.multiply(RolloffsetRotation); //combine orientation with rotation transformations
    ARROW.applyMatrix4(Rollorientation);
    ARROW.position.set(Rollposition.x, Rollposition.y + 0.5, Rollposition.z);
    this.scene.add(ARROW);
  };

  updateRollPlane = (vstart, vend) => {
    if (!ARROW) {
      this.addRollPlane(vstart, vend);
    } else {
      this.scene.remove(ARROW);
      ARROW = null;
    }
  };
}
