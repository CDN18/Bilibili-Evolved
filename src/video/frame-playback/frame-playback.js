import html from 'framePlaybackHtml'

resources.applyStyle('framePlaybackStyle')
const main = async () => {
  if (settings.videoScreenshot) {
    const screenshotButton = await SpinQuery.select('.video-take-screenshot')
    if (screenshotButton === null || document.querySelector('.frame-playback')) {
      return
    }
    screenshotButton.insertAdjacentHTML('afterend', html)
  } else {
    const time = await SpinQuery.select('.bilibili-player-video-time')
    if (time === null || document.querySelector('.frame-playback')) {
      return
    }
    time.insertAdjacentHTML('afterend', html)
  }

  let frameTime = 0
  const seek = (forward) => () => {
    const video = dq('video')
    unsafeWindow.player.seek(video.currentTime + (forward ? 1 : -1) * frameTime, video.paused)
  }
  const prevFrame = seek(false)
  const nextFrame = seek(true)
  Observer.attributesSubtree('.bilibili-player-video-quality-menu ul.bui-select-list', () => {
    const selectedQuality = document.querySelector('.bilibili-player-video-quality-menu .bui-select-item-active')
    const quality = selectedQuality ? parseInt(selectedQuality.getAttribute('data-value')) : 0
    const fps = (() => {
      switch (quality) {
        // 60fps
        case 116:
        case 74:
          return 60000 / 1001
        // 30fps
        default:
          return 30000 / 1001
      }
    })()
    frameTime = 1 / fps
    // console.log(frameTime);
  })
  // document.addEventListener('keydown', e => {
  //   if (e.shiftKey && !isTyping()) {
  //     if (e.key === 'ArrowLeft') {
  //       e.stopPropagation()
  //       e.preventDefault()
  //       prevFrame()
  //     } else if (e.key === 'ArrowRight') {
  //       e.stopPropagation()
  //       e.preventDefault()
  //       nextFrame()
  //     }
  //   }
  // })
  document.querySelector('.prev-frame').addEventListener('click', prevFrame)
  document.querySelector('.next-frame').addEventListener('click', nextFrame)
  if (settings.touchVideoPlayer) {
    document.querySelectorAll('.frame-playback').forEach(it => it.classList.add('touch'))
  }
}
Observer.videoChange(main)
export default {
  reload: () => document.querySelectorAll('.bilibili-player-video-control-bottom .frame-playback').forEach(it => it.setAttribute('style', 'display: flex !important')),
  unload: () => document.querySelectorAll('.bilibili-player-video-control-bottom .frame-playback').forEach(it => it.setAttribute('style', 'display: none !important'))
}
