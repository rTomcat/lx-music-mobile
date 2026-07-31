import { useEffect, useState } from 'react'
import { TouchableOpacity, Text } from 'react-native'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { downloadMusicToLocal, getDownloadTasks } from '@/core/music/downloader'
import { usePlayerMusicInfo } from '@/store/player/hook'
import playerState from '@/store/player/state'
import { toast } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import { HEADER_HEIGHT } from './Btn'

type DLStatus = 'idle' | 'downloading' | 'completed'

// 右上角下载按钮：未下载显示下载图标，下载中显示进度百分比，已下载打勾
export default () => {
  const theme = useTheme()
  const musicInfo = usePlayerMusicInfo()
  const [status, setStatus] = useState<DLStatus>('idle')
  const [progress, setProgress] = useState(0)

  const checkStatus = () => {
    const cur = playerState.playMusicInfo.musicInfo
    if (!cur) { setStatus('idle'); return }
    if (cur.source === 'local') { setStatus('completed'); return }
    const task = getDownloadTasks().find(t => t.musicInfo.id === cur.id && t.musicInfo.source === cur.source)
    if (!task) { setStatus('idle'); return }
    setStatus(task.status === 'completed' ? 'completed' : 'downloading')
    setProgress(task.progress || 0)
  }

  useEffect(() => {
    checkStatus()
    const handler = () => checkStatus()
    global.app_event.on('downloadListUpdate', handler)
    return () => {
      global.app_event.off('downloadListUpdate', handler)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicInfo.id, musicInfo.source])

  const handleDownload = async() => {
    const cur = playerState.playMusicInfo.musicInfo
    if (!cur || cur.source === 'local' || status === 'completed' || status === 'downloading') return
    setStatus('downloading')
    setProgress(0)
    try {
      const savePath = await downloadMusicToLocal(cur as LX.Music.MusicInfoOnline)
      toast(global.i18n.t('download_success', { path: savePath }))
    } catch (err) {
      setStatus('idle')
      toast(err instanceof Error && err.message ? err.message : global.i18n.t('download_failed'), 'long')
    }
  }

  return (
    <TouchableOpacity onPress={handleDownload} style={styles.button}>
      {status === 'downloading'
        ? <Text style={{ color: theme['c-primary'], fontSize: 12, fontWeight: 'bold' }}>{Math.round(progress * 100)}%</Text>
        : (
          <MCIcon
            name={status === 'completed' ? 'check-circle' : 'download-outline'}
            color={status === 'completed' ? theme['c-primary'] : '#ffffff'}
            size={20}
          />
        )
      }
    </TouchableOpacity>
  )
}

const styles = createStyle({
  button: {
    width: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flex: 0,
  },
})
