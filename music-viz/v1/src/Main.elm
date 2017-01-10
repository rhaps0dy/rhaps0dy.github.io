import Graphics.Element exposing (..)
import WebGL exposing (webgl, trianglesEntity, pointsEntity, Shader)
import Math.Vector2 exposing (vec2, Vec2)
import Math.Vector2 as V2
import Math.Vector3 exposing (vec3, Vec3)
import Math.Vector3 as V3
import Math.Vector4 exposing (vec4, Vec4)
import Math.Vector4 as V4
import Math.Matrix4 exposing (Mat4)
import Math.Matrix4 as M4
import Maybe exposing (Maybe)
import Maybe
import Signal
import Signal exposing ((<~), (~), Signal)
import Window
import Time exposing (Time)
import Time
import Random exposing (..)
import List exposing (drop, head, length, map)
import Mouse
import Color
import Fountain
import WebAudio exposing ( createAnalyserNode
                         , connectNodes
                         , getDestinationNode
                         , createHiddenMediaElementAudioSourceNode
                         , setMediaElementIsLooping
                         , setMediaElementSource
                         , playMediaElement
                         , MediaElementAudioSourceNode
                         , AnalyserNode
                         , getByteFrequencyData
                         )
import Debug

type alias Model = { fountains : List Fountain.Model
                   , camY : Float
                   , camAngle : Float
                   , camZ : Float
                   }

type alias Input = { x: Int
                   , y: Int
                   , prevX: Int
                   , prevY: Int
                   , pressed: Bool
                   , freqData: List Int
                   , dt: Time
                   }


audioSrc : String
audioSrc = "/audio/mozart.mp3"

-- Web audio nodes
analyser : AnalyserNode
analyser = createAnalyserNode WebAudio.DefaultContext
         |> connectNodes
            (getDestinationNode WebAudio.DefaultContext) 0 0

mediaStream : MediaElementAudioSourceNode
mediaStream = createHiddenMediaElementAudioSourceNode
                WebAudio.DefaultContext
          |> setMediaElementIsLooping True
          |> connectNodes analyser 0 0
          |> setMediaElementSource audioSrc
          |> playMediaElement

input : Signal Input
input =
    let dt = Time.inSeconds <~ Time.fps 30
        updateMouse x (xolder, xold) = (xold, x)
        msign = Signal.foldp updateMouse (0, 0)
        xsign = msign <| Signal.sampleOn dt <| Mouse.x
        ysign = msign <| Signal.sampleOn dt <| Mouse.y
        x = snd <~ xsign
        y = snd <~ ysign
        prevX = fst <~ xsign
        prevY = fst <~ ysign
        freqData = (\_ -> getByteFrequencyData analyser) <~ dt
    in Input <~ x ~ y ~ prevX ~ prevY ~ Mouse.isDown ~ freqData ~ dt
        |> Signal.sampleOn dt

(!!) : List a -> Int -> a
(!!) l i =
    let (Just elem) = drop i l |> head
    -- Exception if pattern matching fails
    in  elem

colors : List Color.Color
colors = [Color.lightRed, Color.green, Color.yellow, Color.lightPurple,
          Color.lightGray, Color.lightBrown, Color.lightBlue, Color.orange]

init : Int -> Model
init nfountains =
    let ncolors = length colors
        color n = colors !! (n % ncolors)
        fountain n =
            let angle = degrees (360.0/toFloat nfountains + 180.0) * toFloat n
                pos = vec3 (cos angle) 0 (sin angle) |>
                          V3.scale 5
                avgDir = vec3 -(cos angle) 3 -(sin angle) |>
                          V3.scale 3.4
                col = color n
            in  Fountain.init pos avgDir col 2 9999 n
    in  { fountains = map fountain [1..nfountains]
        , camY = 7
        , camAngle = 0
        , camZ = 7
        }

cameraLookAt : Vec3 -- ^ Position of the camera
            -> Vec3 -- ^ Goal point the camera will look at
            -> (Int, Int) -- ^ Window size
            -> Mat4
cameraLookAt pos targ (w, h) =
    let aspectRatio = toFloat w / toFloat h
        perspective = M4.makePerspective 60 aspectRatio 1.0 100000.0
        lookAt = M4.makeLookAt pos targ V3.j
    in  M4.mul perspective lookAt

processFrequencyData : List Int -> Int -> List Float
processFrequencyData fd n =
    let len = length fd
        navg = len // (n * 2)
        pfd list = case list of
                   [] -> []
                   xs -> logBase 4000 (toFloat (List.sum <| List.take navg xs))
                          :: pfd (List.drop navg xs)
    in  pfd <| List.take (len // 2) <| List.drop (len // 4) fd
 
update : Input -> Model -> Model
update inp m =
    let fdata = processFrequencyData inp.freqData (length m.fountains)
        fountains = List.map2 (Fountain.update inp.dt) fdata m.fountains
        camY = if inp.pressed then m.camY + toFloat (inp.y - inp.prevY) / 70.0 else m.camY
        camAngle = if inp.pressed then m.camAngle + degrees (toFloat (inp.x - inp.prevX) / 10.0) else m.camAngle
    in { fountains = fountains
       , camY = camY
       , camAngle = camAngle
       , camZ = m.camZ
       }

state : Signal Model
state = Signal.foldp update (init 32) input

main : Signal Element
main = view <~ Window.dimensions ~ state

view : (Int, Int) -> Model -> Element
view (w, h) {fountains, camY, camAngle, camZ} =
    let x = camZ * cos camAngle
        z = camZ * sin camAngle
        cam = cameraLookAt (vec3 x camY z) (vec3 0 0 0) (w, h)
        fountainview = Fountain.entity cam
        scene = webgl (w, h) <| map fountainview fountains
    in  layers [color Color.black (spacer w h), scene]
