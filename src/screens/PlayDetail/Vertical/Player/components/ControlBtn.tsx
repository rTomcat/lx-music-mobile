import { TouchableOpacity, View } from 'react-native'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useIsPlay } from '@/store/player/hook'
import { createStyle } from '@/utils/tools'
import { useWindowSize } from '@/utils/hooks'
import { BTN_WIDTH } from './MoreBtn/Btn'
import { useEffect, useMemo, useRef } from 'react'
import { toast } from '@/utils/tools'
import { MUSIC_TOGGLE_MODE_LIST, MUSIC_TOGGLE_MODE } from '@/config/constant'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'
import PlayQueueModal, { type PlayQueueModalType } from '@/components/PlayQueueModal'

// Apple 风格：白色线性图标（MaterialCommunityIcons）
const ICON_COLOR = '#ffffff'

const PrevBtn = ({ size }: { size: number }) => {
  const handlePlayPrev = () => {
    void playPrev()
  }
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: size, height: size }} activeOpacity={0.5} onPress={handlePlayPrev}>
      <MCIcon name='skip-previous' color={ICON_COLOR} size={size * 0.9} />
    </TouchableOpacity>
  )
}
const NextBtn = ({ size }: { size: number }) => {
  const handlePlayNext = () => {
    void playNext()
  }
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: size, height: size }} activeOpacity={0.5} onPress={handlePlayNext}>
      <MCIcon name='skip-next' color={ICON_COLOR} size={size * 0.9} />
    </TouchableOpacity>
  )
}

// 播放/暂停：白色实心大圆 + 深色图标（Apple 标志性）
const TogglePlayBtn = ({ size }: { size: number }) => {
  const isPlay = useIsPlay()
  return (
    <TouchableOpacity
      style={{ ...styles.cotrolBtn, width: size, height: size, borderRadius: size / 2, backgroundColor: '#ffffff' }}
      activeOpacity={0.5}
      onPress={togglePlay}
    >
      <MCIcon name={isPlay ? 'pause' : 'play'} color="#1a1a1a" size={size * 0.55} />
    </TouchableOpacity>
  )
}

// 循环模式按钮：放主控制栏最左（Apple 风格）
// 只保留三种模式：列表循环 / 随机 / 单曲循环
const PlayModeBtn = ({ size }: { size: number }) => {
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')
  const t = useI18n()

  // 若当前是已移除的模式（顺序播放 list / 不循环 none），自动回退到列表循环，避免放一首就停
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
        return 'shuffle'
      case MUSIC_TOGGLE_MODE.singleLoop:
        return 'repeat-once'
      default:
        return 'repeat'
    }
  }, [togglePlayMethod])

  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: size, height: size }} activeOpacity={0.5} onPress={toggleNextPlayMode}>
      <MCIcon name={playModeIcon} color={ICON_COLOR} size={size * 0.7} />
    </TouchableOpacity>
  )
}

// 播放列表按钮：放主控制栏最右（Apple 风格）
const PlayListBtn = ({ size }: { size: number }) => {
  const modalRef = useRef<PlayQueueModalType>(null)
  return (
    <>
      <TouchableOpacity style={{ ...styles.cotrolBtn, width: size, height: size }} activeOpacity={0.5} onPress={() => modalRef.current?.show()}>
        <MCIcon name='playlist-play' color={ICON_COLOR} size={size * 0.9} />
      </TouchableOpacity>
      <PlayQueueModal ref={modalRef} />
    </>
  )
}

const MAX_SIZE = BTN_WIDTH * 2.0
const MIN_SIZE = BTN_WIDTH * 1.2

export default () => {
  const winSize = useWindowSize()
  const maxHeight = Math.max(winSize.height * 0.11, MIN_SIZE)
  const containerStyle = useMemo(() => {
    return {
      ...styles.conatiner,
      maxHeight,
    }
  }, [maxHeight])
  const size = Math.min(Math.max(winSize.width * 0.33 * global.lx.fontSize * 0.4, MIN_SIZE), MAX_SIZE, maxHeight)
  // 循环/列表按钮稍小，突出中间的播放键
  const sideSize = size * 0.72

  return (
    <View style={containerStyle}>
      <PlayModeBtn size={sideSize} />
      <PrevBtn size={size} />
      <TogglePlayBtn size={size * 1.25}/>
      <NextBtn size={size} />
      <PlayListBtn size={sideSize} />
    </View>
  )
}


const styles = createStyle({
  conatiner: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: '4%',
    paddingVertical: 38,
    // backgroundColor: 'rgba(0, 0, 0, .1)',
  },
  cotrolBtn: {
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: '#ccc',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
})
