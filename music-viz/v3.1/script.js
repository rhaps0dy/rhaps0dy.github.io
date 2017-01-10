(function(window) {
    var CircularBuffer = function ctor(length) {
        length = length || 60;
        this._arr = new Float32Array(length);
        this._i = 0;
        this._length = length;
    };

    CircularBuffer.prototype = {
        put: function put(v) {
            this._arr[this._i] = v;
            this._i = (this._i + 1) % this._length;
        },

        get: function get(i) {
            i = this._i + i;
            while(i < 0)
                i += this._length;
            return this._arr[i % this._length];
        },
        length: function length() {
            return this._length;
        }
    };

    window.CircularBuffer = CircularBuffer;
})(window);

//from base64 import b64encode; open('b64', 'wb').write(b64encode(open('z3lightw.mid', 'rb').read()))
(function(window, $, THREE, SPARKS) {
    function star(ctx, x, y, r, p, m) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        for (var i = 0; i < p*2; i+=2) {
            var angle = Math.PI / p * (i+1);
            var rad = r * m;
            var lx = x + Math.cos(angle) * rad;
            var ly = y + Math.sin(angle) * rad;
            ctx.lineTo(lx, ly);
            angle = Math.PI / p * (i+2);
            rad = r;
            var lx = x + Math.cos(angle) * rad;
            var ly = y + Math.sin(angle) * rad;
            ctx.lineTo(lx, ly);
        }
        ctx.fill();
        ctx.restore();
    }
    function generateSprite() {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;

        var context = canvas.getContext( '2d' );
        var gradient = context.createRadialGradient( canvas.width / 2,
                                                     canvas.height / 2,
                                                     0,
                                                     canvas.width / 2,
                                                     canvas.height / 2,
                                                     canvas.width / 2 );

        gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
        gradient.addColorStop( 0.2, 'rgba(255,255,255,1)' );
        gradient.addColorStop( 0.4, 'rgba(200,200,200,0.5)' );
        gradient.addColorStop( 1, 'rgba(0,0,0,0)' );

        context.fillStyle = gradient;
//        star(context, canvas.width/2, canvas.height/2, (canvas.width + canvas.height)/4, 9, 0.2);
        context.arc( 64, 64, 60, 0, Math.PI * 2, false) ;
        context.fill();

/*        document.body.appendChild(canvas);
        canvas.style.position = "absolute";
        canvas.style.top = canvas.style.left = 0; */
        return canvas;
    }

    var FFT_SIZE = 256;
    var BUFFER_SIZE = FFT_SIZE / 2;
    var camera, scene, attributes, uniforms, sparksEmitter, stats, emitters, analyser, renderer, delta = 1, windowHalfX, windowHalfY, heightTex, waveformTex, heightMap, waveform, group, rotXGroup;
    function init() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 40, 350);
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
        rotXGroup.rotation.x = 0.33;
        group = new THREE.Group();
        group.rotation.y = -0.4;
        scene.add(rotXGroup);
        rotXGroup.add(group);

        targRotY = targRotYDown = rotXGroup.rotation.x;
        targRotX = targRotXDown = group.rotation.y;
        
        var Pool = {
            __pools: [],
            get: function() {
                if ( this.__pools.length > 0 ) {
                    return this.__pools.pop();
                }
                console.log( "pool ran out!" );
                return null;
            },
            add: function( v ) {
                this.__pools.push( v );
            }
        };

        var particlesLength = 70000;
        var particles = new THREE.Geometry();
        for ( i = 0; i < particlesLength; i ++ ) {

            particles.vertices.push(new THREE.Vector3( Math.random() * 200 - 100
                                                     , Math.random() * 100 + 150
                                                     , Math.random() * 50 ));
            Pool.add( i );
        }

        var sprite = generateSprite();
        texture = new THREE.Texture(sprite);
        texture.needsUpdate = true;

        attributes = {
            size: { type: 'f', value: [] },
            pcolor: { type: 'c', value: [] }
        };
        uniforms = {
            texture: { type: 't', value: texture }
        };
        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            attributes: attributes,

            vertexShader: document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });
        particleCloud = new THREE.PointCloud( particles, shaderMaterial );
        var vertices = particleCloud.geometry.vertices;
        var values_size = attributes.size.value;
        var values_color = attributes.pcolor.value;

        for(var v = 0; v < vertices.length; v++) {
            values_size[v] = 50;
            values_color[v] = new THREE.Color(0x000000);
            var inf = Number.POSITIVE_INFINITY;
            particles.vertices[v].set(inf, inf, inf);
        }

        group.add(particleCloud);
        particleCloud.y = 800;

        // Scene geometry
        var WALL_LEN = 250;
        var plane = new THREE.PlaneBufferGeometry(WALL_LEN*3.0, WALL_LEN*2.2, 256, 256);
        var verts = plane.attributes.position.array;
        for(var i=1; i<verts.length; i+=3)
            verts[i] -= WALL_LEN * 0.4;
        for(var i=0; i<verts.length; i+=3)
            verts[i] += WALL_LEN * 0.4;
        plane.attributes.position.needsUpdate = true;
        
        heightMap = new Float32Array(BUFFER_SIZE);
        heightTex = new THREE.DataTexture(heightMap,
            BUFFER_SIZE, 1, THREE.AlphaFormat, THREE.FloatType);
        heightTex.needsUpdate = true
        waveform = new Float32Array(BUFFER_SIZE);
        waveformTex = new THREE.DataTexture(waveform,
            BUFFER_SIZE, 1, THREE.AlphaFormat, THREE.FloatType);
        waveformTex.needsUpdate = true
        var gcoord =  document.getElementById('gcoord').textContent;;
        var vshad = gcoord + document.getElementById('heightmapvshader').textContent;
        var fshad = gcoord + document.getElementById('heightmapfshader').textContent;
        var wavesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                heightMap: { type: "t", value: heightTex },
                waveform: { type: "t", value: waveformTex }
            },
            attributes: {},
            vertexShader: vshad,
            fragmentShader: fshad,
            depthWrite: true,
            transparent: false,
            doubleSided: true
        });
        var waves = new THREE.Mesh(plane, wavesMaterial);
        waves.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI/2);
        waves.position.set(0, 0, 0);
        group.add(waves);

        var square = new THREE.PlaneBufferGeometry(WALL_LEN, WALL_LEN, 1, 1);
        var cover = new THREE.ImageUtils.loadTexture(songData.cover_url);
        var coverMaterial = new THREE.MeshLambertMaterial({map: cover});
        var cover = new THREE.Mesh(square, coverMaterial);
        cover.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI/2);
        cover.position.set(-WALL_LEN * 1.25, WALL_LEN * 0.65, -WALL_LEN * 0.2);
        group.add(cover);
        var floor = new THREE.Mesh(square, new THREE.MeshPhongMaterial({color: 0xad7c2b,
                                                                        side: THREE.DoubleSide}));
        floor.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI/2);
        floor.position.set(0, 0, 0);
        floor.scale.set(10, 10, 10);
        group.add(floor);
        var textGrey = new THREE.MeshFaceMaterial( [
                new THREE.MeshPhongMaterial({color: 0xdedede, shading: THREE.FlatShading}),
                new THREE.MeshPhongMaterial({color: 0xdedede, shading: THREE.SmoothShading})
        ] );
        var songName3d = new THREE.TextGeometry(songData.name, {
            size: WALL_LEN / 4.5,
            height: WALL_LEN / 25,
            curveSegments: 4,
            font: "optimer",
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1.5,
            bevelSegments: 3,
            material: 0,
            extrudeMaterial: 1
        });
        songName3d.computeVertexNormals();
        songName3d.computeBoundingBox();
        var songCenterOffset = -0.5 * (songName3d.boundingBox.max.x - songName3d.boundingBox.min.x);
        var songNameMesh = new THREE.Mesh(songName3d, textGrey);
        songNameMesh.position.set(songCenterOffset, 130, -WALL_LEN);
        group.add(songNameMesh);
        var textBlue = new THREE.MeshFaceMaterial( [
                new THREE.MeshPhongMaterial({color: 0x27598f, shading: THREE.FlatShading}),
                new THREE.MeshPhongMaterial({color: 0x27598f, shading: THREE.SmoothShading})
        ] );
        var artistName3d = new THREE.TextGeometry(songData.artist, {
            size: WALL_LEN / 7,
            height: WALL_LEN / 35,
            curveSegments: 4,
            font: "optimer",
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1.5,
            bevelSegments: 3,
            material: 0,
            extrudeMaterial: 1
        });
        artistName3d.computeVertexNormals();
        artistName3d.computeBoundingBox();
        var artistNameMesh = new THREE.Mesh(artistName3d, textBlue);
        var artistCenterOffset = -0.5 * (artistName3d.boundingBox.max.x - artistName3d.boundingBox.min.x);
        artistNameMesh.position.set(artistCenterOffset, 60, -WALL_LEN * 0.75);
        group.add(artistNameMesh);
        var coverWallMesh = new THREE.Mesh(square, new THREE.MeshPhongMaterial({color: 0x4888f0}));
        coverWallMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI/2);
        coverWallMesh.position.set(-WALL_LEN*1.3, 0, 0);
        coverWallMesh.scale.set(30, 30, 30);
        group.add(coverWallMesh);
        var lettersWallMesh = new THREE.Mesh(square, new THREE.MeshPhongMaterial({color: 0x222222}));
        lettersWallMesh.position.set(0, 0, -WALL_LEN);
        lettersWallMesh.scale.set(30, 30, 30);
        group.add(lettersWallMesh);


        var hue = 0;

    var setTargetParticle = function() {
        var target = Pool.get();
        values_size[target] = 2 + Math.random() * 5;
        return target;
    };

        var dhue = 0.0003;
    var onParticleCreated = function( p ) {
    var position = p.position;
        p.target.position = position;

        var target = p.target;
        if ( target ) {
            hue += dhue * delta;
            if ( hue > 0.15 || hue < 0.0 )
                dhue = -dhue;
            particles.vertices[ target ] = p.position;
            values_color[ target ].setHSL( hue, 1, 0.5 );
        };
    };

    var onParticleDead = function( particle ) {
        var target = particle.target;
        if ( target ) {
            // Hide the particle
            particles.vertices[ target ].set(0, -10000, 0);
            values_size[target] = 0;
            // Mark particle system as available by returning to pool
            Pool.add( particle.target );
        }
    };

        function createEmitter(emitterpos, speed) {
            sparksEmitter = new SPARKS.Emitter( new SPARKS.SteadyCounter( 500 ) );
            sparksEmitter.addInitializer( new SPARKS.Position( new SPARKS.LineZone( emitterpos, (new THREE.Vector3(0, 3, 0).add(emitterpos) ) ) ));
            sparksEmitter.addInitializer( new SPARKS.Lifetime( 0.4, 1.7 ) );
            sparksEmitter.addInitializer( new SPARKS.Target( null, setTargetParticle ) );

            sparksEmitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( speed ) ) );

            sparksEmitter.addAction( new SPARKS.Age() );
            sparksEmitter.addAction( new SPARKS.Accelerate( 0, -250, 0 ) );
            sparksEmitter.addAction( new SPARKS.Move() );
            sparksEmitter.addAction( new SPARKS.RandomDrift( 1500, 500, 1500 ) );

            sparksEmitter.addCallback( "created", onParticleCreated );
            sparksEmitter.addCallback( "dead", onParticleDead );
            sparksEmitter.stopEmitting();
            sparksEmitter.start();
            return sparksEmitter;
        }

        emitters = [];
        var n = 28;
        var ang = 2*Math.PI / n;
        var frad = 40;
        var srad = 60;
        emitters.push(createEmitter(new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, 0, 0)));
        
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

    var lastWasBeat = false;
    var circBuf = new CircularBuffer(21);
    function render() {
        delta = speed * clock.getDelta();
        
        particleCloud.geometry.verticesNeedUpdate = true;
        attributes.size.needsUpdate = true;
        attributes.pcolor.needsUpdate = true;
        heightTex.needsUpdate = true;
        waveformTex.needsUpdate = true;


        rotXGroup.rotation.x += ( targRotY - rotXGroup.rotation.x ) * 0.05;
        group.rotation.y += ( targRotX - group.rotation.y ) * 0.05;
        
        renderer.clear();
        
        renderer.render( scene, camera );
        analyser.getFloatFrequencyData(heightMap);
        analyser.getFloatTimeDomainData(waveform);
        // heightmap is negative
        for(var i=0; i<BUFFER_SIZE; i++)
            heightMap[i] = 1 + heightMap[i] * (2 / 190);

        var old = circBuf.get(-20);
        var cur = heightMap[5];
//        for(var i=10; i<15; i++)
//            cur += heightMap[i];
        circBuf.put(cur);
        var diff = cur-old;
//        console.log(diff);
        if(!lastWasBeat && diff > 0.1) {
            lastWasBeat = true;
            emitters[0]._initializers[3].zone.pos.y = diff * 1800.;
            emitters[0].startEmitting();
        }
        if(lastWasBeat && diff < 0.05) {
            lastWasBeat = false;
            emitters[0].stopEmitting();
        }

        // composer.render( 0.1 );
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
