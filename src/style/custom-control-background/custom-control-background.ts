addSettingsListener('customControlBackgroundOpacity', value => {
  document.documentElement.style.setProperty('--custom-control-background-opacity', value)
}, true)
const load = () => {
  resources.applyStyle('customControlBackgroundStyle')
  if (!settings.touchVideoPlayer) {
    resources.applyImportantStyleFromText(`
      .bilibili-player-video-control-bottom
      {
        margin: 7px 0 0 0 !important;
        padding: 8px 0 0 !important;
      }
    `, 'control-background-non-touch')
  }
}
load()
export default {
  reload: load,
  unload: () => {
    resources.removeStyle('customControlBackgroundStyle')
    const nonTouchStyle = document.getElementById('control-background-non-touch')
    nonTouchStyle && nonTouchStyle.remove()
  },
}
