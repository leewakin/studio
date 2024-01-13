<script setup>
import { ref } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import {
  loadFFmpeg,
  writeVideoFile,
  readVideoFile,
  createCanvas,
  createMediaRecorder,
  drawVideoOnCanvas,
} from './utils'
import videoUrl from '@/assets/test.webm'

const ffmpeg = new FFmpeg()
const videoRef = ref()

let cropArea = {
  x: 0,
  y: 0,
  width: 200,
  height: 200,
}

async function convert() {
  await loadFFmpeg(ffmpeg)
  await writeVideoFile(ffmpeg, videoUrl)
  await ffmpeg.exec(['-i', 'input.webm', 'output.mp4'])

  const videoData = await readVideoFile(ffmpeg)
  videoRef.value.src = URL.createObjectURL(
    new Blob([videoData.buffer], { type: 'video/mp4' })
  )

  const canvas = createCanvas()
  const recorder = createMediaRecorder(canvas)
  drawVideoOnCanvas(videoRef, canvas, recorder, cropArea)
}

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') {
    cropArea.y -= 10
  } else if (e.key === 'ArrowDown') {
    cropArea.y += 10
  } else if (e.key === 'ArrowLeft') {
    cropArea.x -= 10
  } else if (e.key === 'ArrowRight') {
    cropArea.x += 10
  } else if (e.key === '+') {
    cropArea.width += 10
    cropArea.height += 10
  } else if (e.key === '-') {
    cropArea.width -= 10
    cropArea.height -= 10
  }
})
</script>

<template>
  <div
    style="display: flex; flex-direction: column; height: 100vh; width: 100vw"
  >
    <video
      id="video"
      ref="videoRef"
      style="flex: 1; aspect-ratio: 16/9; object-fit: contain; overflow: hidden"
      muted
      loop
      autoplay
      controls
    ></video>
    <div style="display: flex; flex-direction: column; align-items: center">
      <div>
        <button @click="convert">convert</button>
      </div>
      <p>按下方向鍵移動，按+/-鍵放大/縮小</p>
    </div>

    <canvas
      id="canvas"
      style="flex: 1; overflow: hidden; margin: 0 auto"
    ></canvas>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}
</style>
