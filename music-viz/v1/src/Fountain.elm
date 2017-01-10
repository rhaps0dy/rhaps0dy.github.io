module Fountain (Model, init, update, entity) where

import WebGL exposing (webgl, trianglesEntity, pointsEntity, Shader, Entity)
import WebGL
import Time exposing (Time)
import Time
import Math.Vector2 exposing (vec2, Vec2)
import Math.Vector2 as V2
import Math.Vector3 exposing (vec3, Vec3)
import Math.Vector3 as V3
import Math.Vector4 exposing (vec4, Vec4)
import Math.Vector4 as V4
import Math.Matrix4 exposing (Mat4)
import Math.Matrix4 as M4
import Color
import Random
import List exposing (filter, map)
import Debug

type alias Vertex = { col: WebGL.Color
                    , pos: Vec3
                    }


type alias Particle = { t0 : Time -- ^ Time the particle was born
                      , lifespan : Time -- ^ Time the particle will live
                      , dir0 : Vec3 -- ^ Initial direction of the particle
                      , pos0 : Vec3 -- ^ Initial position of the particle
                      }

type alias Model = { pos : Vec3 -- ^ Position of the particle source
                   , avgDir : Vec3 -- ^ Average direction of the particles
                   , avgDir0 : Vec3 -- ^ Initial average direction of the particles
                   , col : WebGL.Color -- ^ Color of the particles
                   , avgLifespan : Time -- ^ Average lifespan
                   , parts : List Particle -- ^ The particles this fountain has emitted
                   , seed : Random.Seed -- ^ Current random seed for generating more particles
                   , lastParticleT : Time -- ^ Time the last particle was generated in
                   , partGenInterval : Time -- ^ Time between generating particles
                   , time : Time -- ^ Current time
                   }

-- | Generate a random vec3 from (-1, -1, -1) to (1, 1, 1)
randVec3 : Random.Generator Vec3
randVec3 = Random.customGenerator <| \s ->
    let comp = Random.float -1 1
        (x, s') = Random.generate comp s
        (y, s'') = Random.generate comp s'
        (z, s''') = Random.generate comp s''
    in  (vec3 x y z, s''')

-- | Generate a particle for the fountain, slightly random.
particleGen : Model -> Time -> Random.Generator Particle
particleGen {pos, avgDir, col, avgLifespan} t0 = Random.customGenerator <| \s ->
    let (v, s') = Random.generate randVec3 s
        (v', s'') = Random.generate randVec3 s
        varLifespan = avgLifespan * 0.1
        (lifespan', s''') = Random.generate (Random.float -varLifespan varLifespan) s''
        dir0 = V3.add avgDir (V3.scale 0.3 v)
        pos0 = V3.add pos (V3.scale 0.05 v')
    in  ({t0=t0, lifespan=lifespan' + avgLifespan, dir0=dir0, pos0 = pos0}, s''')

-- | Step the fountain's time
update : Time -> Float -> Model -> Model
update dt scale f =
    let t = f.time + dt
        pgen = particleGen f t
        (p, s) = Random.generate pgen f.seed
        ps = filter (\{t0, lifespan} -> t0 + lifespan > t) f.parts
        (lastT, ps') = if t - f.lastParticleT > f.partGenInterval
                       then (t, p :: ps)
                       else (f.lastParticleT, ps)
    in  {f | avgDir <- V3.scale scale f.avgDir0
        , parts <- ps'
        , seed <- s
        , lastParticleT <- lastT
        , partGenInterval <- (1.0/60.0) / scale
        , time <- t
        }

-- | Create a fountain
init : Vec3 -- ^ Position
    -> Vec3 -- ^ Average direction
    -> Color.Color -- ^ Fountain color
    -> Time -- ^ Average lifespan of particles
    -> Time -- ^ Time between generating particles
    -> Int -- ^ Number to generate the seed
    -> Model
init pos dir col lifespan partdt seed =
    { pos = pos
    , avgDir = dir
    , avgDir0 = dir
    , col = WebGL.fromColor col
    , avgLifespan = lifespan
    , parts = []
    , seed = Random.initialSeed seed
    , lastParticleT = 0.0
    , partGenInterval = partdt
    , time = 0.0
    }

-- | Render a fountain to an entity
entity : Mat4 -> Model -> Entity
entity cam f =
    pointsEntity vertShad fragShad f.parts { camera = cam
                                           , col = f.col
                                           , time = f.time}

type alias Uniforms = { camera: Mat4
                      , col: WebGL.Color
                      , time: Float
                      }

-- | Shader that calculates the rendering of all of a font's particles
vertShad : Shader Particle Uniforms {}
vertShad  = [glsl|
precision mediump float;
uniform mat4 camera;
uniform float time;
attribute float t0;
attribute vec3 dir0;
attribute vec3 pos0;

void main() {
    float t = time - t0;
    vec3 pos = pos0 + t * dir0;
    pos.y -= (9.81/2.) * t * t;
    gl_Position = camera * vec4(pos, 1);
    gl_PointSize = 40.0 / gl_Position.z;
}
|]

fragShad : Shader {} Uniforms {}
fragShad  = [glsl|
precision mediump float;
uniform vec4 col;

void main() {
    gl_FragColor = col;
}
|]