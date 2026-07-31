import { memo } from 'react'
import { View, Image } from 'react-native'

import { usePlayerMusicInfo } from '@/store/player/hook'
import { createStyle } from '@/utils/tools'

// 播放详情页背景：用当前封面放大 + 重度模糊 + 暗色蒙层，营造"封面色扩散"效果
export default memo(() => {
  const musicInfo = usePlayerMusicInfo()
  return (
    <View style={styles.container} pointerEvents="none">
      {musicInfo.pic != null && musicInfo.pic
        ? (
            <Image
              source={{ uri: musicInfo.pic }}
              style={styles.bg}
              resizeMode="cover"
              blurRadius={55}
            />
          )
        : null}
      <View style={styles.overlay} />
    </View>
  )
})

const styles = createStyle({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // 轻微压暗：让封面主色饱和透出形成"色彩扩散"，又保留一点对比便于读白色控件
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
})
