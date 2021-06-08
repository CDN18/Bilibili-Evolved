const regex = /@(\d+)[Ww]_(\d+)[Hh]/
const dpi = settings.imageResolutionScale === "auto" ? window.devicePixelRatio : parseFloat(settings.imageResolutionScale)
const excludeSelectors = [
  "#certify-img1",
  "#certify-img2",
]
const walk = (rootElement: Node, action: (node: HTMLElement) => void) => {
  const walker = document.createNodeIterator(rootElement, NodeFilter.SHOW_ELEMENT, null)
  let node = walker.nextNode()
  while (node) {
    if (node instanceof HTMLElement) {
      action(node)
    }
    node = walker.nextNode()
  }
}
export async function imageResolution(element: HTMLElement) {
  const replaceSource = (getValue: (e: HTMLElement) => string | null, setValue: (e: HTMLElement, v: string) => void) => {
    const value = getValue(element)
    if (value === null) {
      return
    }
    if (excludeSelectors.some(it => element.matches(it))) {
      return
    }
    const match = value.match(regex)
    if (!match) {
      return
    }
    let [, width, height] = match
    let lastWidth = parseInt(element.getAttribute("data-resolution-width") || "0")
    if (parseInt(width) >= lastWidth && lastWidth !== 0) {
      return
    }
    if (element.getAttribute("width") === null && element.getAttribute("height") === null) {
      element.setAttribute("width", width)
    }
    width = Math.round(dpi * parseInt(width)).toString()
    height = Math.round(dpi * parseInt(height)).toString()
    element.setAttribute("data-resolution-width", width)
    setValue(element, value.replace(regex, `@${width}w_${height}h`))
  }
  Observer.attributes(element, () => {
    replaceSource(e => e.getAttribute("src"), (e, v) => e.setAttribute("src", v))
    replaceSource(e => e.style.backgroundImage, (e, v) => e.style.backgroundImage = v)
  })
}
const startResolution = async () => {
  walk(document.body, it => imageResolution(it))
  Observer.childListSubtree(document.body, records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) {
          imageResolution(node)
          if (node.nodeName.toUpperCase() !== "IMG") {
            walk(node, it => imageResolution(it))
          }
        }
      }
    }
  })
}
startResolution()
resources.applyStyleFromText(`
.favInfo-box .favInfo-cover img {
  width: 100% !important;
  object-position: left !important;
}
.bili-avatar-img {
  width: 100% !important;
}
.bb-comment .sailing .sailing-img,
.comment-bilibili-fold .sailing .sailing-img {
  width: 288px;
}
`, 'image-resolution-fix')
export default {
  export: { imageResolution }
}
