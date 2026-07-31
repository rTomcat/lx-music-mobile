import initPlayer from './player'
import initPlayStatus from './playStatus'
import initPlayerEvent from './playerEvent'
import initWatchList from './watchList'
import initPlayProgress from './playProgress'
import initPreloadNextMusic from './preloadNextMusic'
import initLyric from './lyric'

export default async(setting: LX.AppSetting) => {
  await initPlayer(setting)
  await initLyric(setting)
  initPlayStatus()
  initPlayerEvent()
  initWatchList()
  initPlayProgress()
  initPreloadNextMusic()
}
