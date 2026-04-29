import InsidePage from '@common/components/aoplatform/InsidePage'
import { useI18n } from '@common/locales'
import { Col, Row } from 'antd'
import ApiRequestSetting from './ApiRequestSetting'
import ServiceCategory from './ServiceCategory'

export default function CommonPage() {
  const $t = useI18n()

  return (
    <InsidePage pageTitle={$t('常规设置')} showBorder={false} contentClassName="pr-PAGE_INSIDE_X" scrollPage={false}>
      <Row className="mb-btnybase">
        <Col>
          <span className="font-bold mr-[13px]">{$t('API 请求设置')}</span>
        </Col>
      </Row>
      <ApiRequestSetting />
      <Row className="mb-btnybase mt-[40px]">
        <Col>
          <span className="font-bold mr-[13px]">{$t('服务分类')}</span>
        </Col>
      </Row>
      <ServiceCategory />
    </InsidePage>
  )
}
