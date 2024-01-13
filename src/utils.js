import { fetchFile, toBlobURL } from '@ffmpeg/util'

export async function loadFFmpeg(ffmpeg) {
  await ffmpeg.load({
    coreURL: await toBlobURL(
      new URL('./ffmpeg-core.js', import.meta.url),
      'text/javascript'
    ),
    wasmURL: await toBlobURL(
      new URL('./ffmpeg-core.wasm', import.meta.url),
      'application/wasm'
    ),
  })
}

export async function writeVideoFile(ffmpeg, videoURL) {
  await ffmpeg.writeFile('input.webm', await fetchFile(videoURL))
}

export async function readVideoFile(ffmpeg) {
  const data = await ffmpeg.readFile('output.mp4')
  return data
}

export function createCanvas() {
  const canvas = document.querySelector('#canvas')
  canvas.width = 1920 // 裁剪后的宽度
  canvas.height = 1080 // 裁剪后的高度
  return canvas
}

export function createMediaRecorder(canvas) {
  const stream = canvas.captureStream()
  const recorder = new MediaRecorder(stream)
  const chunks = []
  recorder.ondataavailable = event => chunks.push(event.data)
  recorder.start()
  return { recorder, chunks }
}

export function drawVideoOnCanvas(
  videoRef,
  canvas,
  { recorder, chunks },
  cropArea
) {
  const context = canvas.getContext('2d')
  videoRef.value.addEventListener('play', function () {
    let lastDrawTime = 0
    const draw = () => {
      const now = Date.now()
      if (now - lastDrawTime < 1000 / 25) {
        requestAnimationFrame(draw)
        return
      }
      lastDrawTime = now

      if (videoRef.value.paused || videoRef.value.ended) return
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(
        videoRef.value,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        1920,
        1080
      )
      if (recorder.state === 'recording') {
        recorder.requestData()
        if (chunks.length > 0) {
          console.log('send frame', chunks.shift())
        }
      }
      requestAnimationFrame(draw)
    }
    draw()
  })
}
