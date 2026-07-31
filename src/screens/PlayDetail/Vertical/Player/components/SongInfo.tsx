import { memo, useState, useEffect } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { usePlayerMusicInfo } from '@/store/player/hook'
import playerState from '@/store/player/state'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import { toast } from '@/utils/tools'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { getListMusicSync } from '@/utils/listManage'
import { addListMusics, removeListMusics } from '@/core/list'
import { LIST_IDS } from '@/config/constant'

// 封面下方的歌曲信息行：歌名 + 歌手（居中）+ 收藏爱心（toggle 我喜欢，已喜欢=红心）
export default memo(() => {
  const musicInfo = usePlayerMusicInfo()
  const [loved, setLoved] = useState(false)

  const checkLoved = () => {
    const cur = playerState.playMusicInfo.musicInfo
    if (!cur) { setLoved(false); return }
    setLoved(getListMusicSync(LIST_IDS.LOVE).some(m => m.id === cur.id))
  }

  useEffect(() => {
    checkLoved()
    const handler = (ids: string[]) => {
      if (ids.includes(LIST_IDS.LOVE)) checkLoved()
    }
    global.app_event.on('myListMusicUpdate', handler)
    return () => {
      global.app_event.off('myListMusicUpdate', handler)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicInfo.id, musicInfo.source])

  const handleFav = () => {
    const cur = playerState.playMusicInfo.musicInfo
    if (!cur) return
    if (loved) {
      setLoved(false)
      void removeListMusics(LIST_IDS.LOVE, [cur.id])
      toast('已从我喜欢移除')
    } else {
      setLoved(true)
      void addListMusics(LIST_IDS.LOVE, [cur as LX.Music.MusicInfo], 'bottom')
      toast('已添加到我喜欢')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.textWrap}>
        <Text numberOfLines={1} size={22} color="#ffffff" style={[styles.name, styles.center]}>{musicInfo.name}</Text>
        <Text numberOfLines={1} size={15} color="rgba(255,255,255,0.75)" style={styles.center}>{musicInfo.singer}</Text>
      </View>
      <TouchableOpacity style={styles.favBtn} onPress={handleFav} activeOpacity={0.5}>
        <MCIcon name={loved ? 'heart' : 'heart-outline'} color={loved ? '#ff3b30' : '#ffffff'} size={26} />
      </TouchableOpacity>
    </View>
  )
})


const styles = createStyle({
  container: {
    position: 'relative',
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 12,
  },
  textWrap: {
    width: '100%',
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
  name: {
    fontWeight: 'bold',
  },
  favBtn: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
})
