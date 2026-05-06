'use client'

import { StyleProvider } from '@ant-design/cssinjs'
import LanguageSetting from '@common/components/aoplatform/LanguageSetting'
import { BasicResponse, STATUS_CODE } from '@common/const/const'
import { GlobalProvider, useGlobalContext } from '@common/contexts/GlobalStateContext'
import { LocaleProvider, useLocaleContext } from '@common/contexts/LocaleContext'
import { PluginEventHubProvider } from '@common/contexts/PluginEventHubContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import FeishuLogo from '@common/assets/feishu.png'
import Logo from '@common/assets/layout-logo.png'
import { LoadingOutlined } from '@ant-design/icons'
import { Icon } from '@iconify/react/dist/iconify.js'
import { App as AppAntd, Button, ConfigProvider, Divider, Form, FormInstance, Input, Spin, Tooltip } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

function LoginContent() {
    const { state, dispatch } = useGlobalContext()
    const { fetchData } = useFetch()
    const { message } = AppAntd.useApp()
    const router = useRouter()
    const searchParams = useSearchParams()
    const formRef = useRef<FormInstance>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [allowGuest, setAllowGuest] = useState<boolean>(false)
    const [spinning, setSpinning] = useState<boolean>(false)
    const [allowFeishuLogin, setAllowFeishuLogin] = useState<boolean>(false)
    const [feishuAppId, setFeishuAppId] = useState<string>()
    const [isFeishuLogin, setIsFeishuLogin] = useState<boolean>(false)

    useEffect(() => {
        if (isFeishuLogin) {
            const callbackUrl = searchParams.get('callbackUrl')
            if (callbackUrl && callbackUrl !== 'null') {
                router.push(callbackUrl)
            } else {
                router.push(state.mainPage)
            }
            setIsFeishuLogin(false)
        }
    }, [isFeishuLogin, router, searchParams, state.mainPage])

    const feishuLogin = async (feishuCode: string) => {
        try {
            setLoading(true)
            const feishuCallbackUrl = localStorage.getItem('feishuCallbackUrl')
            const { code, msg } = await fetchData<BasicResponse<null>>('account/login/feishu', {
                method: 'POST',
                eoBody: {
                    code: feishuCode,
                    redirect_uri: feishuCallbackUrl
                }
            })
            if (code === STATUS_CODE.SUCCESS) {
                dispatch({ type: 'LOGIN' })
                setIsFeishuLogin(true)
            } else {
                dispatch({ type: 'LOGOUT' })
                setIsFeishuLogin(false)
                message.error(msg)
            }
        } catch (err) {
            console.warn(err)
        } finally {
            setLoading(false)
        }
    }

    const isInFeishuClient = () => {
        const ua = navigator.userAgent.toLowerCase()
        const isLark = ua.includes('lark') || ua.includes('feishu')
        const hasSDK = typeof (window as any).h5sdk !== 'undefined' || typeof (window as any).tt !== 'undefined'
        const params = new URLSearchParams(window.location.search)
        const hasFeishuParams = params.has('from') || params.has('required_launch_ability')
        return isLark || hasSDK || hasFeishuParams
    }

    const openFeishuLogin = (id?: string) => {
        const href = window.location.origin + window.location.pathname
        const authUrl = `https://accounts.feishu.cn/open-apis/authen/v1/authorize?client_id=${id || feishuAppId}&redirect_uri=${href}`
        localStorage.setItem('feishuCallbackUrl', href)
        window.location.href = authUrl
    }

    const check = useCallback(() => {
        state.isAuthenticated && setSpinning(true)
        fetchData<BasicResponse<{ channel: Array<{ name: string; config: { [key: string]: any } }>; status: string }>>(
            'account/login',
            { method: 'GET' }
        )
            .then((response) => {
                const { code, data } = response || {}
                if (code === STATUS_CODE.SUCCESS && data && data.status !== 'anonymous') {
                    dispatch({ type: 'LOGIN' })
                    router.replace(state.mainPage)
                } else {
                    dispatch({ type: 'LOGOUT' })
                    if (data && data.channel) {
                        setAllowGuest(data.channel.filter((x: any) => x.name === 'guest_access').length > 0)
                        const feishu = data.channel.find((x: any) => x.name === 'feishu')
                        if (feishu) {
                            setFeishuAppId(feishu.config.client_id)
                            setAllowFeishuLogin(true)
                        }
                        const code = searchParams.get('code')
                        if (code) {
                            feishuLogin(code)
                            setSpinning(false)
                            return
                        }
                        if (isInFeishuClient() && feishu) {
                            openFeishuLogin(feishu.config.client_id)
                        }
                    }
                    setSpinning(false)
                }
            })
            .catch((err) => {
                console.error('Failed to fetch login status:', err)
                dispatch({ type: 'LOGOUT' })
                setSpinning(false)
            })
    }, [dispatch, fetchData, router, searchParams, state.isAuthenticated, state.mainPage])

    const getSystemInfo = useCallback(() => {
        fetchData<BasicResponse<{ version: string; buildTime: string }>>('common/version', {
            method: 'GET',
            eoTransformKeys: ['build_time']
        }).then((response) => {
            const { code, data } = response
            if (code === STATUS_CODE.SUCCESS) {
                dispatch({ type: 'UPDATE_VERSION', version: data.version })
                dispatch({ type: 'UPDATE_DATE', updateDate: data.buildTime })
            }
        })
    }, [dispatch, fetchData])

    const fetchLogin = async (values: any) => {
        try {
            setLoading(true)
            const { username, password } = values
            const body = { name: username, password: password }
            const { code, msg } = await fetchData<BasicResponse<null>>('account/login/username', {
                method: 'POST',
                eoBody: body
            })
            if (code === STATUS_CODE.SUCCESS) {
                dispatch({ type: 'LOGIN' })
                const callbackUrl = searchParams.get('callbackUrl')
                if (callbackUrl && callbackUrl !== 'null') {
                    router.push(callbackUrl)
                } else {
                    router.push(state.mainPage)
                }
            } else {
                dispatch({ type: 'LOGOUT' })
                message.error(msg)
            }
        } catch (err) {
            console.warn(err)
        } finally {
            setLoading(false)
        }
    }

    const login = async () => {
        if (formRef.current) {
            const values = await formRef.current.validateFields()
            fetchLogin(values)
        }
    }

    const loginAsGuest = () => {
        fetchLogin({ username: 'guest', password: '12345678' })
    }

    useEffect(() => {
        check()
        getSystemInfo()
    }, [check, getSystemInfo])

    return spinning ? (
        <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            spinning={spinning}
            className="w-full h-full flex items-center justify-center"
        />
    ) : (
        <div className="h-full w-full flex flex-col items-center overflow-auto min-h-[490px] bg-[#0d1117]">
            <div id="glow-background" className="background-container">
                <svg className="background-pattern" aria-hidden="true">
                    <defs>
                        <pattern id="pattern-bg" width="200" height="200" patternUnits="userSpaceOnUse">
                            <path d="M.5 200V.5H200" fill="none"></path>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pattern-bg)"></rect>
                </svg>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 800 450"
                    opacity="1"
                >
                    <defs>
                        <filter
                            id="bbblurry-filter"
                            x="-100%"
                            y="-100%"
                            width="400%"
                            height="400%"
                            filterUnits="objectBoundingBox"
                            primitiveUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                        >
                            <feGaussianBlur
                                stdDeviation="99"
                                x="0%"
                                y="0%"
                                width="100%"
                                height="100%"
                                in="SourceGraphic"
                                edgeMode="none"
                                result="blur"
                            />
                        </filter>
                    </defs>
                    <g filter="url(#bbblurry-filter)">
                        <ellipse rx="80.5" ry="66.5" cx="623.0285107902043" cy="25.708028895006635" fill="hsla(187, 67%, 50%, 1.00)">
                            <animate attributeName="fill" values="hsla(187, 67%, 50%, 1.00); hsla(340, 85%, 60%, 1.00); hsla(60, 90%, 55%, 1.00); hsla(187, 67%, 50%, 1.00)" dur="6s" repeatCount="indefinite" />
                        </ellipse>
                        <ellipse rx="80.5" ry="66.5" cx="446.471435546875" cy="-11.694503784179688" fill="hsla(234, 78%, 61%, 1.00)">
                            <animate attributeName="fill" values="hsla(234, 78%, 61%, 1.00); hsla(100, 75%, 60%, 1.00); hsla(290, 80%, 70%, 1.00); hsla(234, 78%, 61%, 1.00)" dur="8s" repeatCount="indefinite" />
                        </ellipse>
                        <ellipse rx="80.5" ry="66.5" cx="200.54574247724838" cy="-19.02454901710908" fill="hsla(167, 87%, 56%, 1.00)">
                            <animate attributeName="fill" values="hsla(167, 87%, 56%, 1.00); hsla(10, 90%, 65%, 1.00); hsla(300, 85%, 50%, 1.00); hsla(167, 87%, 56%, 1.00)" dur="10s" repeatCount="indefinite" />
                        </ellipse>
                        <ellipse rx="80.5" ry="66.5" cx="340.05827594708103" cy="-9.424536458161867" fill="hsl(25, 100%, 64%)">
                            <animate attributeName="fill" values="hsl(25, 100%, 64%); hsl(200, 100%, 70%); hsl(50, 95%, 55%); hsl(25, 100%, 64%)" dur="8s" repeatCount="indefinite" />
                        </ellipse>
                    </g>
                </svg>
            </div>

            <div className="mx-auto flex-1 flex flex-col items-center justify-center z-[3]">
                <div className="mx-auto">
                    <span className="flex items-center justify-center">
                        <img className="h-[40px] mr-[8px]" src={typeof Logo === 'string' ? Logo : (Logo as any)?.src} alt="logo" />
                    </span>
                </div>

                <section className="block w-[410px] mx-auto mt-[46px] p-[30px] box-border rounded-[10px] shadow-[0_5px_20px_0_rgba(0,0,0,5%)] login-block">
                    <div className="h-full">
                        <div className="">
                            <Form onFinish={login} className="w-[350px]" ref={formRef}>
                                <Form.Item
                                    className="p-0 bg-transparent rounded border-none"
                                    name="username"
                                    rules={[{ required: true, message: $t('请输入账号'), whitespace: true }]}
                                >
                                    <Input
                                        className="w-[350px] h-[40px] login-input"
                                        placeholder={$t('账号')}
                                        autoComplete="on"
                                        autoFocus
                                    />
                                </Form.Item>

                                <Form.Item
                                    className="p-0 bg-transparent rounded border-none"
                                    name="password"
                                    rules={[{ required: true, message: $t('请输入密码') }]}
                                >
                                    <Input.Password
                                        className="w-[350px] h-[40px] login-input"
                                        placeholder={$t('密码')}
                                        autoComplete="off"
                                    />
                                </Form.Item>

                                <Form.Item className="p-0 bg-transparent rounded border-none">
                                    <Button
                                        loading={loading}
                                        className="h-[40px] mt-mbase w-full inline-flex justify-center items-center"
                                        type="primary"
                                        htmlType="submit"
                                    >
                                        {$t('登录')}
                                    </Button>
                                </Form.Item>

                                {allowFeishuLogin && (
                                    <>
                                        <Divider />
                                        <Form.Item className="p-0 bg-transparent rounded border-none mb-0">
                                            <Button
                                                loading={loading}
                                                className="h-[40px] w-full inline-flex justify-center items-center"
                                                type="default"
                                                onClick={() => openFeishuLogin(feishuAppId)}
                                            >
                                                <img className="h-[30px]" src={typeof FeishuLogo === 'string' ? FeishuLogo : (FeishuLogo as any)?.src} alt="feishu" />
                                                {$t('飞书授权登录')}
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}

                                {allowGuest && (
                                    <>
                                        <Divider />
                                        <Form.Item className="p-0 bg-transparent rounded border-none mb-0">
                                            <Button
                                                loading={loading}
                                                className="h-[40px] w-full inline-flex justify-center items-center"
                                                type="default"
                                                onClick={loginAsGuest}
                                            >
                                                {$t('访客模式')}{' '}
                                                <Tooltip
                                                    title={$t(
                                                        '您可通过访客模式查看所有页面和功能，但是无法编辑数据。访客模式仅用于了解产品功能，您可以在正式产品中关闭该功能。'
                                                    )}
                                                >
                                                    <Icon icon="ic:baseline-help" height={18} width={18} />
                                                </Tooltip>
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col items-center mt-[46px] text-SECOND_TEXT">
                    <p className="leading-[28px]">
                        {$t('Version (0)-(1)', [state?.version, state?.updateDate])}, {$t(state?.powered || '-')}
                    </p>
                    <LanguageSetting mode="light" />
                </section>
            </div>
        </div>
    )
}

function LoginProviders() {
    const { locale } = useLocaleContext()
    return (
        <StyleProvider hashPriority="high">
            <ConfigProvider locale={locale} wave={{ disabled: true }}>
                <PluginEventHubProvider>
                    <GlobalProvider>
                        <AppAntd className="h-full" message={{ maxCount: 1 }}>
                            <LoginContent />
                        </AppAntd>
                    </GlobalProvider>
                </PluginEventHubProvider>
            </ConfigProvider>
        </StyleProvider>
    )
}

export default function LoginPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <LocaleProvider>
            <LoginProviders />
        </LocaleProvider>
    )
}
