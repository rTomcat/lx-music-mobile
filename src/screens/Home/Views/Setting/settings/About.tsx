// 衍生自 LX Music（落雪无痕）开源项目，遵循 Apache License 2.0
import { memo } from 'react'
import { View } from 'react-native'

import Section from '../components/Section'

import { createStyle } from '@/utils/tools'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'

export default memo(() => {
  const t = useI18n()

  return (
    <Section title={t('setting_about')}>
      <View style={styles.part}>
        <Text style={styles.text}>日落山水静，为君起松声</Text>
      </View>
    </Section>
  )
})

const styles = createStyle({
  part: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
  },
})
