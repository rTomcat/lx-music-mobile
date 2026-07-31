import { memo, useEffect, useMemo } from 'react'
import { toast } from '@/utils/tools'
import { MUSIC_TOGGLE_MODE_LIST, MUSIC_TOGGLE_MODE } from '@/config/constant'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'
import Btn from './Btn'


export default memo(() => {
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')
  const t = useI18n()

  // 若当前是已移除的模式（顺序播放 list / 不循环 none），自动回退到列表循环
  useEffect(() => {
    if (togglePlayMethod == MUSIC_TOGGLE_MODE.list || togglePlayMethod == MUSIC_TOGGLE_MODE.none) {
      updateSetting({ 'player.togglePlayMethod': MUSIC_TOGGLE_MODE.listLoop })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [togglePlayMethod])

  const toggleNextPlayMode = () => {
    const modes = MUSIC_TOGGLE_MODE_LIST
    let index = modes.findIndex(m => m === togglePlayMethod)
    if (++index >= modes.length) index = 0
    const mode = modes[index]
    updateSetting({ 'player.togglePlayMethod': mode })
    const modeName = mode == MUSIC_TOGGLE_MODE.random
      ? 'play_list_random'
      : mode == MUSIC_TOGGLE_MODE.singleLoop
        ? 'play_single_loop'
        : 'play_list_loop'
    toast(t(modeName))
  }

  const playModeIcon = useMemo(() => {
    switch (togglePlayMethod) {
      case MUSIC_TOGGLE_MODE.random:
        return 'list-random'
      case MUSIC_TOGGLE_MODE.singleLoop:
        return 'single-loop'
      default:
        return 'list-loop'
    }
  }, [togglePlayMethod])

  return <Btn icon={playModeIcon} onPress={toggleNextPlayMode} />
})
