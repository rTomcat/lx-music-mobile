import { memo, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Text, Modal, FlatList, TouchableOpacity, Image } from 'react-native'

import { usePlayerMusicInfo, usePlayMusicInfo } from '@/store/player/hook'
import { getListMusicSync } from '@/utils/listManage'
import { playList } from '@/core/player/player'
import { removeListMusics } from '@/core/list'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { MUSIC_TOGGLE_MODE, MUSIC_TOGGLE_MODE_LIST } from '@/config/constant'
import { useI18n } from '@/lang'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { createStyle } from '@/utils/tools'

export interface PlayQueueModalType {
  show: () => void
}

// 播放队列弹窗（Apple/网易云风格：浅色 sheet + 标题栏 + 循环模式行 + 带封面的歌曲列表）
const PlayQueueModal = forwardRef<PlayQueueModalType, Record<string, never>>((_, ref) => {
  const [visible, setVisible] = useState(false)
  const playMusicInfo = usePlayMusicInfo()
  const currentMusic = usePlayerMusicInfo()
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')
  const t = useI18n()

  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
  }))

  const listId = playMusicInfo.listId
  const queue = getListMusicSync(listId)

  const handlePlay = (index: number) => {
    if (listId) void playList(listId, index)
  }
  const handleRemove = (id: string) => {
    if (listId) void removeListMusics(listId, [id])
  }
  const handleClear = () => {
    if (listId && queue.length) void removeListMusics(listId, queue.map(m => m.id))
  }
  const cycleMode = () => {
    const modes = MUSIC_TOGGLE_MODE_LIST
    let index = modes.findIndex(m => m === togglePlayMethod)
    if (++index >= modes.length) index = 0
    updateSetting({ 'player.togglePlayMethod': modes[index] })
  }

  const modeLabel = togglePlayMethod == MUSIC_TOGGLE_MODE.random ? t('play_list_random')
    : togglePlayMethod == MUSIC_TOGGLE_MODE.singleLoop ? t('play_single_loop')
      : t('play_list_loop')
  const modeIcon = togglePlayMethod == MUSIC_TOGGLE_MODE.random ? 'shuffle'
    : togglePlayMethod == MUSIC_TOGGLE_MODE.singleLoop ? 'repeat-once'
      : 'repeat'

  const renderItem = ({ item, index }: { item: LX.Music.MusicInfo, index: number }) => {
    const isCurrent = currentMusic.id != null && currentMusic.id === item.id
    const pic = (item as LX.Music.MusicInfoOnline).meta?.picUrl
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => handlePlay(index)} style={styles.itemMain}>
          {pic
            ? <Image source={{ uri: pic }} style={styles.thumb} />
            : <View style={[styles.thumb, { backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' }]}>
              <MCIcon name="music-note" color="#bbb" size={20} />
            </View>}
          <View style={styles.itemText}>
            <Text numberOfLines={1} style={{ color: isCurrent ? '#ff3b30' : '#333', fontSize: 15, fontWeight: isCurrent ? 'bold' : 'normal' }}>{item.name}</Text>
            <Text numberOfLines={1} style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{item.singer}</Text>
          </View>
        </TouchableOpacity>
        {isCurrent ? <MCIcon name="volume-high" color="#ff3b30" size={18} style={styles.curIcon} /> : <View style={styles.curIcon} />}
        <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
          <MCIcon name="close" color="#999" size={18} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>播放列表（{queue.length}）</Text>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.iconBtn}>
              <MCIcon name="close" color="#666" size={22} />
            </TouchableOpacity>
          </View>
          <View style={styles.modeRow}>
            <TouchableOpacity onPress={cycleMode} style={styles.modeBtn}>
              <MCIcon name={modeIcon} color="#666" size={20} />
              <Text style={styles.modeText}>{modeLabel}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={handleClear} style={styles.iconBtn}>
              <MCIcon name="trash-can-outline" color="#666" size={20} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={queue}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  )
})

const styles = createStyle({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: '#333',
    fontSize: 17,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 6,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 4,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 8,
  },
  list: {
    maxHeight: 420,
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    justifyContent: 'center',
  },
  curIcon: {
    width: 20,
    marginHorizontal: 8,
  },
  removeBtn: {
    padding: 10,
  },
})

export default memo(PlayQueueModal)
