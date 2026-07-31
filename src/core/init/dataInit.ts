import { getPlayInfo, getViewPrevState } from '@/utils/data'
import { log } from '@/utils/log'
import { init as musicSdkInit } from '@/utils/musicSdk'
import { getUserLists, setUserList, getListMusics } from '@/core/list'
import { setNavActiveId } from '../common'
import { bootLog } from '@/utils/bootLog'
import { getDislikeInfo, setDislikeInfo } from '@/core/dislikeList'
import { unlink } from '@/utils/fs'
import { TEMP_FILE_PATH } from '@/utils/tools'
import { play, playList } from '../player/player'

// 恢复上次关闭时的播放列表与播放进度（缓存播放列表）
const initPrevPlayInfo = async(appSetting: LX.AppSetting) => {
  const info = await getPlayInfo()
  global.lx.restorePlayInfo = null
  if (!info?.listId || info.index < 0) return
  const list = await getListMusics(info.listId)
  if (!list[info.index]) return
  global.lx.restorePlayInfo = info
  await playList(info.listId, info.index)

  if (appSetting['player.startupAutoPlay']) setTimeout(play)
}

export default async(appSetting: LX.AppSetting) => {
  void musicSdkInit() // 初始化音乐sdk
  bootLog('User list init...')
  setUserList(await getUserLists()) // 获取用户列表
  setDislikeInfo(await getDislikeInfo()) // 获取不喜欢列表
  bootLog('User list inited.')
  setNavActiveId((await getViewPrevState()).id)
  void unlink(TEMP_FILE_PATH)
  await initPrevPlayInfo(appSetting).catch(err => log.error(err)) // 初始化上次的歌曲播放信息
}
