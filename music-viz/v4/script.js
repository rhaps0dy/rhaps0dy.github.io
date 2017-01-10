var camera, scene, stats, emitters, analyser, renderer, delta = 1, windowHalfX, windowHalfY, heightMap, group, rotXGroup, uniforms, skyBox;
(function(window, $, THREE, SPARKS) {
    var FFT_SIZE = 256;
    var BUFFER_SIZE = FFT_SIZE / 2;
    var HISTORY_LEN = 256;
    function init() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 40, -250);
        camera.lookAt(new THREE.Vector3(0, 80, 0));
        scene = new THREE.Scene();
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 0, 10, 10);
        directionalLight.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        directionalLight.position.normalize();
        scene.add( directionalLight );

        var pointLight = new THREE.PointLight( 0xffffff, 2, 1000 );
        pointLight.position.set( 0, 100, 0 );
        scene.add( pointLight );
        rotXGroup = new THREE.Group()
        rotXGroup.rotation.x = -0.5;
        group = new THREE.Group();
        group.rotation.y = 0.0;
        scene.add(rotXGroup);
        rotXGroup.add(group);

        targRotY = targRotYDown = rotXGroup.rotation.x;
        targRotX = targRotXDown = group.rotation.y;

        heightMap = new Float32Array(BUFFER_SIZE * HISTORY_LEN);
        var heightTex = new THREE.DataTexture(heightMap,
            BUFFER_SIZE, HISTORY_LEN, THREE.AlphaFormat, THREE.FloatType);
        heightTex.needsUpdate = true
        var plane = new THREE.PlaneBufferGeometry(BUFFER_SIZE, HISTORY_LEN, BUFFER_SIZE, HISTORY_LEN);
        var gcoord = document.getElementById('gcoord').textContent;
        var vshad = gcoord + document.getElementById('heightmapvshader').textContent;
        var fshad = gcoord + document.getElementById('heightmapfshader').textContent;
        uniforms = {
            heightMap: { type: "t", value: heightTex },
            i: { type: "f", value: 0.0 },
        };
        var wavesMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            attributes: {},
            vertexShader: vshad,
            fragmentShader: fshad,
            depthWrite: true,
            transparent: false,
        });
        var waves = new THREE.Mesh(plane, wavesMaterial);
        waves.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI/2);
        waves.position.set(0, 0, HISTORY_LEN*0.25);
        waves.scale.set(4, 2, 100);
        group.add(waves);

        var cloudsMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            attributes: {},
            vertexShader: document.getElementById('cloudsvshader').textContent,
            fragmentShader: document.getElementById('cloudsfshader').textContent,
            depthWrite: true,
            transparent: false,
        });
        var imagePrefix = "/img/clouds/";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".jpg";
	var skyGeometry = new THREE.BoxGeometry( 5000, 5000, 5000 );	
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	group.add(light);
	group.add( skyBox );
        
        // End Particles

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById('container').appendChild( renderer.domElement );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mousewheel', onMouseWheel, false );
        document.addEventListener( 'DOMMouseScroll', onMouseWheel, false );
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
        document.addEventListener( 'touchmove', onDocumentMouseMove, false );
        document.addEventListener( 'touchstart', onDocumentMouseDown, false );
        document.addEventListener( 'touchend', onDocumentMouseUp, false );
        window.addEventListener( 'resize', onWindowResize, false);
    }
    
    function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
    }
    
    var speed = 50;
    var clock = new THREE.Clock();
    var targRotX, targRotY;

    var fft = new Float32Array(BUFFER_SIZE);
    function render() {
        delta = speed * clock.getDelta();
        
        if(targRotY > -0.15) targRotY = -0.15;
        else if(targRotY < -2.88) targRotY = -2.88;
        rotXGroup.rotation.x += ( targRotY - rotXGroup.rotation.x ) * 0.05;
        group.rotation.y += ( targRotX - group.rotation.y ) * 0.05;
        skyBox.rotation.y -= delta / 1000;

        uniforms.heightMap.value.needsUpdate = true;
        uniforms.i.value.needsUpdate = true;

        var curInd = uniforms.i.value|0;

        analyser.getFloatFrequencyData(fft);
        // heightmap is negative
        for(var i=0; i<BUFFER_SIZE; i++)
            heightMap[curInd * BUFFER_SIZE + i] = 1 + fft[i] * (2 / 190);

        uniforms.i.value = (curInd + 1) % HISTORY_LEN;

        renderer.clear();
        renderer.render( scene, camera );
    }

    function onload() {
        var audio = $("audio")[0];
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var audioSource = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fft = FFT_SIZE;
        audioSource.connect(analyser);
        audioSource.connect(audioCtx.destination);
        audio.play();
        init();
        animate();
    };
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
    }


    var mouseDownX, mouseDownY, targRotXDown, targRotYDown;
    mouseDownX = mouseDownY = null;

    function onDocumentMouseDown( event ) {
        event.preventDefault();
        mouseDownX = event.clientX - windowHalfX;
        mouseDownY = event.clientY - windowHalfY;
        targRotXDown = targRotX;
        targRotYDown = targRotY;
    }

    function onDocumentMouseUp( event ) {
        event.preventDefault();
        mouseDownX = mouseDownY = null;
    }

    function onDocumentMouseMove( event ) {
        var mouseX = event.clientX - windowHalfX;
        var mouseY = event.clientY - windowHalfY;

        if(mouseDownX !== null)
            targRotX = targRotXDown + (mouseX - mouseDownX) * 0.01;
        if(mouseDownY !== null)
            targRotY = targRotYDown + (mouseY - mouseDownY) * 0.01;

    }

    function onMouseWheel(event) {
        var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        camera.position.z += delta * 10;
    }
    window.addEventListener('load', onload, false);
})(window, jQuery, THREE, SPARKS)
