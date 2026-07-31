import { useRef } from 'react'
import Btn from './Btn'
import PlayQueueModal, { type PlayQueueModalType } from '@/components/PlayQueueModal'


export default () => {
  const modalRef = useRef<PlayQueueModalType>(null)
  return (
    <>
      <Btn icon="list-order" onPress={() => modalRef.current?.show()} />
      <PlayQueueModal ref={modalRef} />
    </>
  )
}
