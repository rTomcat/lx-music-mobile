import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, PanResponder } from 'react-native'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeW, scaleSizeH } from '@/utils/pixelRatio'
import { useDrag } from '@/utils/hooks'
import { Icon } from '@/components/common/Icon'
// import { AppColors } from '@/theme'


const DefaultBar = memo(({ white }: { white?: boolean }) => {
  const theme = useTheme()
  const backgroundColor = white ? 'rgba(255,255,255,0.25)' : theme['c-primary-light-300-alpha-800']
  return <View style={{ ...styles.progressBar, backgroundColor, position: 'absolute', width: '100%', left: 0, top: 0 }}></View>
})

const BufferedBar = memo(({ progress, white }: { progress: number, white?: boolean }) => {
  // console.log(bufferedProgress)
  const theme = useTheme()
  const backgroundColor = white ? 'rgba(255,255,255,0.4)' : theme['c-primary-light-400-alpha-700']
  return <View style={{ ...styles.progressBar, backgroundColor, position: 'absolute', width: `${progress * 100}%`, left: 0, top: 0 }}></View>
})


const PreassBar = memo(({ onDragState, setDragProgress, onSetProgress }: {
  onDragState: (drag: boolean) => void
  setDragProgress: (progress: number) => void
  onSetProgress: (progress: number) => void
}) => {
  const {
    onLayout,
    onDragStart,
    onDragEnd,
    onDrag,
  } = useDrag(onSetProgress, onDragState, setDragProgress)
  // const handlePress = useCallback((event: GestureResponderEvent) => {
  //   onPress(event.nativeEvent.locationX)
  // }, [onPress])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      // onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        onDrag(gestureState.dx)
      },
      onPanResponderGrant: (evt, gestureState) => {
        // console.log(evt.nativeEvent.locationX, gestureState)
        onDragStart(gestureState.dx, evt.nativeEvent.locationX)
      },
      onPanResponderRelease: () => {
        onDragEnd()
      },
      // onPanResponderTerminate: (evt, gestureState) => {
      //   onDragEnd()
      // },
    }),
  ).current

  return <View onLayout={onLayout} style={styles.pressBar} {...panResponder.panHandlers} />
})


const Progress = ({ progress, duration, buffered, white }: {
  progress: number
  duration: number
  buffered: number
  white?: boolean
}) => {
  // const { progress: bufferProgress } = usePlayTimeBuffer()
  const theme = useTheme()
  const [draging, setDraging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  // console.log(progress)
  const progressStr: `${number}%` = `${progress * 100}%`

  const progressDotStyle = useMemo(() => {
    return {
      width: progressDotSize,
      position: 'absolute',
      right: -progressDotSize / 2,
      top: -(progressDotSize - progressHeightSize) / 2,
    } as const
  }, [])

  const durationRef = useRef(duration)
  useEffect(() => {
    durationRef.current = duration
  }, [duration])
  const onSetProgress = useCallback((progress: number) => {
    global.app_event.setProgress(progress * durationRef.current)
  }, [])

  // white 模式：进度条用白色系；否则用主题色
  const progressColor = white ? '#ffffff' : theme['c-primary-light-100-alpha-400']
  const dragColor = white ? '#ffffff' : theme['c-primary-light-100-alpha-700']
  const dragBgColor = white ? 'rgba(255,255,255,0.7)' : theme['c-primary-light-100-alpha-600']
  const dotColor = white ? '#ffffff' : theme['c-primary-light-100']

  return (
    <View style={styles.progress}>
      <View>
        <DefaultBar white={white} />
        <BufferedBar progress={buffered} white={white} />
        {
          draging
            ? (
                <>
                  <View style={{ ...styles.progressBar, backgroundColor: dragColor, width: progressStr, position: 'absolute', left: 0, top: 0 }} />
                  <View style={{ ...styles.progressBar, backgroundColor: dragBgColor, width: `${dragProgress * 100}%`, position: 'absolute', left: 0, top: 0 }}>
                    <Icon name="full_stop" color={dotColor} rawSize={progressDotSize} style={progressDotStyle} />
                  </View>
                </>
              ) : (
                <View style={{ ...styles.progressBar, backgroundColor: progressColor, width: progressStr, position: 'absolute', left: 0, top: 0 }}>
                  <Icon name="full_stop" color={dotColor} rawSize={progressDotSize} style={progressDotStyle} />
                </View>
              )
        }

      </View>
      <PreassBar onDragState={setDraging} setDragProgress={setDragProgress} onSetProgress={onSetProgress} />
      {/* <View style={{ ...styles.progressBar, height: '100%', width: progressStr }}><Pressable style={styles.progressDot}></Pressable></View> */}
    </View>
  )
}


const progressContentPadding = 10
const progressHeight = 3.6
const progressContentHeight = progressContentPadding * 2 + progressHeight
const progressHeightSize = scaleSizeH(progressHeight)
let progressDotSize = scaleSizeW(progressContentHeight * 0.8)
const styles = createStyle({
  progress: {
    width: '100%',
    height: progressContentHeight,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: progressContentPadding,
    paddingBottom: progressContentPadding,
    zIndex: 1,
  },
  progressBar: {
    height: progressHeight,
    borderRadius: 4,
  },
  pressBar: {
    position: 'absolute',
    // backgroundColor: 'rgba(0,0,0,0.5)',
    left: 0,
    top: 0,
    height: progressContentHeight,
    paddingTop: progressContentPadding,
    paddingBottom: progressContentPadding,
    width: '100%',
    zIndex: 6,
  },
})

export default Progress
