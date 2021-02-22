export default {
  widget:
  {
    content: /*html*/`
      <button
        class="gui-settings-flat-button"
        id="clear-cache">
        <i class="icon-clear"></i>
        <span>清除缓存</span>
      </button>`,
    condition: () => typeof offlineData === 'undefined',
    success: () => {
      dq('#clear-cache')?.addEventListener('click', () => {
        settings.cache = {}
        Toast.success('已删除全部缓存.', '清除缓存', 5000)
      })
    }
  },
}
