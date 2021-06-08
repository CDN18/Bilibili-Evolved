import { VideoCardInfo } from '../style/simplify-home/video-card-info'

export interface FeedsCardType {
  id: number
  name: string
}
export interface RepostFeedsCardType extends FeedsCardType {
  id: 1
  name: '转发'
}
export const feedsCardTypes = {
  repost: {
    id: 1,
    name: '转发',
  } as RepostFeedsCardType,
  textWithImages: {
    id: 2,
    name: '图文'
  } as FeedsCardType,
  text: {
    id: 4,
    name: '文字',
  } as FeedsCardType,
  video: {
    id: 8,
    name: '视频',
  } as FeedsCardType,
  miniVideo: {
    id: 16,
    name: '小视频',
  } as FeedsCardType,
  column: {
    id: 64,
    name: '专栏',
  } as FeedsCardType,
  audio: {
    id: 256,
    name: '音频',
  } as FeedsCardType,
  bangumi: {
    id: 512,
    name: '番剧',
  } as FeedsCardType,
  share: {
    id: 2048,
    name: '分享',
  } as FeedsCardType,
  manga: {
    id: 2049,
    name: '漫画',
  } as FeedsCardType,
  film: {
    id: 4098,
    name: '电影',
  } as FeedsCardType,
  tv: {
    id: 4099,
    name: 'TV剧',
  } as FeedsCardType,
  chinese: {
    id: 4100,
    name: '国创',
  } as FeedsCardType,
  documentary: {
    id: 4101,
    name: '纪录片',
  } as FeedsCardType,
  mediaList: {
    id: 4300,
    name: '收藏夹',
  } as FeedsCardType,
  liveRecord: {
    id: 2047, // FIXME: 暂时随便写个 id 了, 这个东西目前找不到 type
    name: '开播记录',
  } as FeedsCardType,
}
export interface FeedsCard {
  id: string
  username: string
  text: string
  reposts: number
  comments: number
  likes: number
  element: HTMLElement
  type: FeedsCardType
  presented: boolean
  getText: () => Promise<string>
}
export interface RepostFeedsCard extends FeedsCard {
  repostUsername: string
  repostText: string
  type: RepostFeedsCardType
}
const getFeedsCardType = (element: HTMLElement) => {
  if (element.querySelector('.repost')) {
    return feedsCardTypes.repost
  }
  if (element.querySelector('.imagesbox')) {
    return feedsCardTypes.textWithImages
  }
  if (element.querySelector('.video-container')) {
    return feedsCardTypes.video
  }
  if (element.querySelector('.bangumi-container')) {
    return feedsCardTypes.bangumi
  }
  if (element.querySelector('.article-container')) {
    return feedsCardTypes.column
  }
  if (element.querySelector('.music-container')) {
    return feedsCardTypes.audio
  }
  if (element.querySelector('.h5share-container')) {
    return feedsCardTypes.share
  }
  if (element.querySelector('.vc-ctnr')) {
    return feedsCardTypes.miniVideo
  }
  if (element.querySelector('.live-container')) {
    return feedsCardTypes.liveRecord
  }
  return feedsCardTypes.text
}
const isRepostType = (card: FeedsCard): card is RepostFeedsCard => {
  return card.type === feedsCardTypes.repost
}
export type FeedsCardCallback = {
  added?: (card: FeedsCard) => void
  removed?: (card: FeedsCard) => void
}
export const supportedUrls = [
  '//t.bilibili.com',
  '//space.bilibili.com',
  '//live.bilibili.com',
]
const feedsCardCallbacks: Required<FeedsCardCallback>[] = []
class FeedsCardsManager extends EventTarget {
  watching = false
  cards: FeedsCard[] = []
  addEventListener(
    type: 'addCard' | 'removeCard',
    listener: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.addEventListener(type, listener, options)
  }
  removeEventListener(
    type: 'addCard' | 'removeCard',
    callback: (event: CustomEvent<FeedsCard>) => void,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.removeEventListener(type, callback, options)
  }
  async addCard(node?: Node) {
    if (node === undefined) {
      return
    }
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      if (node.querySelector('.skeleton') !== null) {
        const obs = Observer.childList(node, () => {
          if (node.querySelector('.skeleton') === null) {
            obs.stop()
            this.addCard(node)
          }
        })
      } else {
        if (node.parentNode === null) {
          // console.log('skip parse', node)
          return
        }
        const card = await this.parseCard(node)
        if (!card.presented) {
          // console.log('skip detached card:', card)
          return
        }
        if (this.cards.find(c => c.id === card.id)) {
          return
        }
        this.cards.push(card)
        this.cards.sort((a, b) => {
          if (a.id === b.id) {
            return 0
          }
          return a.id > b.id ? -1 : 1
        })
        const event = new CustomEvent('addCard', { detail: card })
        this.dispatchEvent(event)
        feedsCardCallbacks.forEach(c => c.added(card))
      }
    }
  }
  async removeCard(node?: Node) {
    if (node === undefined) {
      return
    }
    if (node instanceof HTMLElement && node.classList.contains('card')) {
      const id = node.getAttribute('data-did') as string
      const index = this.cards.findIndex(c => c.id === id)
      if (index === -1) {
        return
      }
      const card = this.cards[index]
      this.cards.splice(index, 1)
      const event = new CustomEvent('removeCard', { detail: card })
      this.dispatchEvent(event)
      feedsCardCallbacks.forEach(c => c.removed(card))
    }
  }
  async parseCard(element: HTMLElement): Promise<FeedsCard> {
    const getVueData = (el: any) => el.parentElement.__vue__
    const getSimpleText = async (selector: string) => {
      const subElement = await SpinQuery.condition(
        () => element.querySelector(selector),
        it => it !== null || element.parentNode === null
      ) as HTMLElement
      if (element.parentNode === null) {
        // console.log('skip detached node:', element)
        return ''
      }
      if (subElement === null) {
        console.warn(element, selector, element.parentNode)
        return ''
      }
      const subElementText = subElement.innerText.trim()
      return subElementText
    }
    const getRepostData = (vueData: any) => {
      // 被转发动态已失效
      if (vueData.card.origin === undefined) {
        return {
          originalText: '',
          originalDescription: '',
          originalTitle: '',
        }
      }
      const originalCard = JSON.parse(vueData.card.origin)
      const originalText: string = vueData.originCardData.pureText
      const originalDescription: string = _.get(originalCard, 'item.description', '')
      const originalTitle: string = originalCard.title
      return {
        originalText,
        originalDescription,
        originalTitle,
      }
    }
    const getComplexText = async (type: FeedsCardType) => {
      if (type === feedsCardTypes.bangumi) {
        return ''
      }
      const el = await SpinQuery.condition(() => element, it => Boolean(getVueData(it) || !element.parentNode))
      if (element.parentNode === null) {
        // console.log('skip detached node:', element)
        return ''
      }
      if (el === null) {
        console.warn(el, element, getVueData(el), element.parentNode)
        return ''
      }
      // if (!el.__vue__.card.origin) {
      //   return ''
      // }
      const vueData = getVueData(el)
      if (type === feedsCardTypes.repost) {
        const currentText = vueData.card.item.content
        const repostData = getRepostData(vueData)
        return [
          currentText,
          ...Object.values(repostData).filter(it => it !== ''),
        ].filter(it => Boolean(it)).join('\n')
      }
      const currentText = vueData.originCardData.pureText
      const currentTitle = vueData.originCardData.title
      return [
        currentText,
        currentTitle,
      ].filter(it => Boolean(it)).join('\n')
    }
    const getNumber = async (selector: string) => {
      const result = parseInt(await getSimpleText(selector))
      if (isNaN(result)) {
        return 0
      }
      return result
    }
    const card = {
      id: element.getAttribute('data-did') as string,
      username: await getSimpleText('.main-content .user-name'),
      text: '',
      reposts: await getNumber('.button-bar .single-button:nth-child(1) .text-offset'),
      comments: await getNumber('.button-bar .single-button:nth-child(2) .text-offset'),
      likes: await getNumber('.button-bar .single-button:nth-child(3) .text-offset'),
      element,
      type: getFeedsCardType(element),
      presented: true,
      async getText() {
        const result = await getComplexText(this.type)
        this.text = result
        // console.log(result)
        return result
      }
    }
    await card.getText()
    card.presented = element.parentNode !== null
    element.setAttribute('data-type', card.type.id.toString())
    if (isRepostType(card)) {
      const currentUsername = card.username
      const vueData = getVueData(card.element)
      const repostUsername = _.get(vueData, 'card.origin_user.info.uname', '')
      if (currentUsername === repostUsername) {
        element.setAttribute('data-self-repost', 'true')
      }
      card.repostUsername = repostUsername
      card.repostText = getRepostData(vueData).originalText
    }
    // if (card.text === '') {
    //   console.warn('card text parsing failed!', card)
    // }
    return card
  }
  async startWatching() {
    const updateCards = (cardsList: HTMLElement) => {
      const selector = '.card[data-did]'
      const findCardNode = (node: Node): Node | undefined => {
        if (node instanceof HTMLElement) {
          if (node.matches(selector)) {
            return node
          }
          const child = node.querySelector(selector)
          if (child) {
            return child
          }
        }
        return undefined
      }
      const cards = [...cardsList.querySelectorAll(selector)]
      cards.forEach(it => this.addCard(it))
      console.log(cards)
      return Observer.childList(cardsList, records => {
        records.forEach(record => {
          record.addedNodes.forEach(node => this.addCard(findCardNode(node)))
          record.removedNodes.forEach(node => this.removeCard(findCardNode(node)))
        })
      })
    }

    if (this.watching) {
      return true
    }
    this.watching = true
    if (document.URL.includes('//space.bilibili.com')) {
      console.log('space watch')
      const container = await SpinQuery.select('.s-space') as HTMLDivElement
      if (!container) {
        return false
      }
      let cardListObserver: Observer | null = null
      Observer.childList(container, async () => {
        if (dq('#page-dynamic')) {
          const cardsList = await SpinQuery.select('.feed-card .content') as HTMLElement
          console.log('enter feeds tab')
          if (cardListObserver) {
            cardListObserver.stop()
          }
          cardListObserver = updateCards(cardsList)
        } else {
          console.log('leave feeds tab')
          if (cardListObserver) {
            cardListObserver.stop()
            cardListObserver = null
          }
          await Promise.all(this.cards.map(c => c.element).map(e => this.removeCard(e)))
        }
      })
      this.watching = true
      return true
    }
    if (document.URL.includes('//live.bilibili.com')) {
      console.log('live watch')
      const feedsContainer = await SpinQuery.select('.room-feed') as HTMLElement
      if (!feedsContainer) {
        return false
      }
      let cardListObserver: Observer | null = null
      Observer.childList(feedsContainer, async () => {
        if (dq('.room-feed-content')) {
          const cardsList = await SpinQuery.select('.room-feed-content .content') as HTMLElement
          console.log('enter feeds tab')
          if (cardListObserver) {
            cardListObserver.stop()
          }
          cardListObserver = updateCards(cardsList)
        } else {
          console.log('leave feeds tab')
          if (cardListObserver) {
            cardListObserver.stop()
            cardListObserver = null
          }
          await Promise.all(this.cards.map(c => c.element).map(e => this.removeCard(e)))
        }
      })
      return true
    }
    if (document.URL.startsWith('https://t.bilibili.com/topic')) {
      console.log('topic watch')
      const feedsContainer = await SpinQuery.select('.page-container') as HTMLElement
      if (!feedsContainer) {
        return false
      }
      let cardListObserver: Observer | null = null
      Observer.childList(feedsContainer, async () => {
        if (dq('.page-container .feed')) {
          const cardsList = await SpinQuery.select('.feed .feed-topic') as HTMLElement
          console.log('enter feeds tab')
          if (cardListObserver) {
            cardListObserver.stop()
          }
          cardListObserver = updateCards(cardsList)
        } else {
          console.log('leave feeds tab')
          if (cardListObserver) {
            cardListObserver.stop()
            cardListObserver = null
          }
          await Promise.all(this.cards.map(c => c.element).map(e => this.removeCard(e)))
        }
      })
      return true
    }
    const cardsList = await SpinQuery.select('.feed-card .content, .detail-content .detail-card') as HTMLDivElement
    if (!cardsList) {
      return false
    }
    updateCards(cardsList)
    return true
  }
}
export const feedsCardsManager = new FeedsCardsManager()

export const isCardBlocked = (card: Pick<FeedsCard, 'text' | 'username'>) => {
  if (!settings.feedsFilter) {
    return false
  }
  const testPattern = (pattern: Pattern, text: string) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      return new RegExp(pattern.slice(1, pattern.length - 1)).test(text)
    }
    return text.includes(pattern)
  }
  return settings.feedsFilterPatterns.some(pattern => {
    const upNameMatch = pattern.match(/(.+) up:([^ ]+)/)
    if (upNameMatch) {
      return (
        testPattern(upNameMatch[1], card.text) &&
        testPattern(upNameMatch[2], card.username)
      )
    }
    return testPattern(pattern, card.text)
  })
}
export const isVideoCardBlocked = (card: Pick<VideoCardInfo, 'title' | 'dynamic' | 'upName'>) => {
  return isCardBlocked({
    text: card.title + (card.dynamic ?? ''),
    username: card.upName,
  })
}
export const isPreOrderedVideo = (card: any) => {
  return _.get(card, 'extra.is_reserve_recall', 0) === 1
}

export const getVideoFeeds = async (type: 'video' | 'bangumi' = 'video'): Promise<VideoCardInfo[]> => {
  if (!getUID()) {
    return []
  }
  const json = await Ajax.getJsonWithCredentials(
    `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${type === 'video' ? 8 : 512}`
  )
  if (json.code !== 0) {
    throw new Error(json.message)
  }
  const cards = (() => {
    const jsonCards = json.data.cards as any[]
    if (type === 'video') {
      return _.uniqBy(jsonCards.map(
        (c: any): VideoCardInfo => {
          const card = JSON.parse(c.card)
          const topics = _.get(c, 'display.topic_info.topic_details', []).map(
            (it: any) => {
              return {
                id: it.topic_id,
                name: it.topic_name
              }
            }
          )
          return {
            id: c.desc.dynamic_id_str,
            aid: card.aid,
            bvid: c.desc.bvid || card.bvid,
            title: card.title,
            upID: c.desc.user_profile.info.uid,
            upName: c.desc.user_profile.info.uname,
            upFaceUrl: c.desc.user_profile.info.face,
            coverUrl: card.pic,
            description: card.desc,
            timestamp: c.timestamp,
            time: new Date(c.timestamp * 1000),
            topics,
            dynamic: card.dynamic,
            like: formatCount(c.desc.like),
            duration: card.duration,
            durationText: formatDuration(card.duration, 0),
            playCount: formatCount(card.stat.view),
            danmakuCount: formatCount(card.stat.danmaku),
            watchlater: store.state.watchlaterList.includes(card.aid)
          } as VideoCardInfo
        }
      ), it => it.aid)
    } else if (type === 'bangumi') {
      return jsonCards.map(
        (c: any): VideoCardInfo => {
          const card = JSON.parse(c.card)
          return {
            id: c.desc.dynamic_id_str,
            aid: card.aid,
            bvid: c.desc.bvid || card.bvid,
            epID: card.episode_id,
            title: card.new_desc,
            upName: card.apiSeasonInfo.title,
            upFaceUrl: card.apiSeasonInfo.cover,
            coverUrl: card.cover,
            description: '',
            timestamp: c.timestamp,
            time: new Date(c.timestamp * 1000),
            like: formatCount(c.desc.like),
            durationText: '',
            playCount: formatCount(card.play_count),
            danmakuCount: formatCount(card.bullet_count),
            watchlater: false,
          } as VideoCardInfo
        }
      )
    } else {
      return []
    }
  })()
  return cards.filter(c => !isVideoCardBlocked(c))
}

export const forEachFeedsCard = (callback: FeedsCardCallback) => {
  const feedsUrls = [
    /^https:\/\/t\.bilibili\.com\/$/,
    /^https:\/\/space\.bilibili\.com\//,
    /^https:\/\/live\.bilibili\.com\/(blanc\/)?[\d]+/,
    /^https:\/\/t\.bilibili\.com\//,
  ]
  if (feedsUrls.every(url => !url.test(document.URL))) {
    return
  }
  ;(async () => {
    const success = await feedsCardsManager.startWatching()
    if (!success) {
      console.error('feedsCardsManager.startWatching() failed')
      return
    }

    const { added } = callback
    if (added) {
      feedsCardsManager.cards.forEach(c => added(c))
    }
    const none = () => {}
    feedsCardCallbacks.push({ added: none, removed: none, ...callback })
  })()
}
/**
 * 向动态卡片的菜单中添加菜单项
 * @param card 动态卡片
 * @param config 菜单项配置
 */
export const addMenuItem = (card: FeedsCard, config: {
  className: string
  text: string
  action: (e: MouseEvent) => void
}) => {
  const morePanel = dq(card.element, '.more-panel') as HTMLElement
  const { className, text, action } = config
  if (!morePanel || dq(morePanel, `.${className}`)) {
    return
  }
  const menuItem = document.createElement('p')
  menuItem.classList.add('child-button', 'c-pointer', className)
  menuItem.textContent = text
  const vueScopeAttributes = [...new Set([...morePanel.children].map((element: HTMLElement) => {
    return element.getAttributeNames().filter(it => it.startsWith('data-v-'))
  }).flat())]
  vueScopeAttributes.forEach(attr => menuItem.setAttribute(attr, ''))
  menuItem.addEventListener('click', e => {
    action(e)
    card.element.click()
  })
  morePanel.appendChild(menuItem)
}

export default {
  export: {
    feedsCardsManager,
    feedsCardTypes,
    supportedUrls,
    getVideoFeeds,
    forEachFeedsCard,
    addMenuItem,
    isCardBlocked,
    isVideoCardBlocked,
    isPreOrderedVideo,
  },
}
