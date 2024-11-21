import {FC, useCallback, useEffect, useRef, useState} from "react";
import {App, Button, Divider, Form, FormInstance, Input, Tooltip} from "antd";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, STATUS_CODE} from "@common/const/const.tsx";
import {useNavigate} from "react-router-dom";
// import {useCrypto} from "../hooks/crypto.ts";
import Logo from '@common/assets/layout-logo.png'
import { $t } from "@common/locales";
import { Icon } from "@iconify/react/dist/iconify.js";
import LanguageSetting from "@common/components/aoplatform/LanguageSetting";

const Login:FC = ()=> {
     const {state, dispatch} = useGlobalContext()
     const {fetchData} = useFetch()
     const { message } = App.useApp()
    const navigate = useNavigate();
    const formRef = useRef<FormInstance>(null);
    const [loading,setLoading] = useState<boolean>()
    // const { encryptByEnAES } = useCrypto();
    const [allowGuest, setAllowGuest] = useState<boolean>(false)


    const check = useCallback(()=>{
        fetchData<BasicResponse<{channel:Array<{name:string}>, status:string}>>('account/login',{method:'GET'}).then(response=>{
            const {code,data} = response
            
            if(code === STATUS_CODE.SUCCESS && data.status !== 'anonymous'){
                dispatch({type:'LOGIN'})
                navigate(state.mainPage)
            }else{
                dispatch({type:'LOGOUT'})
                setAllowGuest(data.channel.filter(x=>x.name === 'guest_access').length > 0)
            }
        })
    },[])

    
    const getSystemInfo = useCallback(()=>{
        fetchData<BasicResponse<{version:string, buildTime:string}>>('common/version',{method:'GET', eoTransformKeys:['build_time']}).then(response=>{
            const {code,data} = response
            if(code === STATUS_CODE.SUCCESS){
                dispatch({type:'UPDATE_VERSION',version:data.version})
                dispatch({type:'UPDATE_DATE',updateDate:data.buildTime})
            }
        })
    },[])


    const fetchLogin = async (values:any)=>{
        try {
            setLoading(true);
            const { username, password } = values;
            // const encryptedPassword = encryptByEnAES(username, password);

            const body = {
                name:username,
                password: password
                // client: 1,
                // type: 1,
                // app_type: 4,
            };

            const {code,msg } = await fetchData<BasicResponse<null>>('account/login/username',{method:'POST',eoBody:(body)})

            if (code === STATUS_CODE.SUCCESS) {
                dispatch({type:'LOGIN'})
                // message.success($t(RESPONSE_TIPS.loginSuccess));
                const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
                if (callbackUrl && callbackUrl !== 'null') {
                    navigate(callbackUrl);
                } else {
                    navigate(state.mainPage);
                }
            }else{
                dispatch({type:'LOGOUT'})
                message.error(msg)
            }

        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false)
        }
    }
    const login = async () => {
        if (formRef.current) {
            const values = await formRef.current.validateFields();
            fetchLogin(values);
        }
    };

    const loginAsGuest = ()=>{
        fetchLogin({username:'guest',password:'12345678'})
    }

    useEffect(() => {
        check()
        getSystemInfo()
    }, []);

     return (
         <div className="h-full w-full flex flex-col  items-center overflow-auto min-h-[490px] bg-[#0d1117]">
            <div id="glow-background" className="background-container">
                <svg className="background-pattern" aria-hidden="true">
                    <defs>
                        <pattern id="pattern-bg" width="200" height="200" patternUnits="userSpaceOnUse">
                            <path d="M.5 200V.5H200" fill="none"></path>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pattern-bg)"></rect>
                </svg>

            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 800 450" opacity="1">
            <defs>
                <filter id="bbblurry-filter" x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feGaussianBlur stdDeviation="99" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
                </filter>
            </defs>
            <g filter="url(#bbblurry-filter)">
                <ellipse rx="80.5" ry="66.5" cx="623.0285107902043" cy="25.708028895006635" fill="hsla(187, 67%, 50%, 1.00)">
                <animate attributeName="fill" values="hsla(187, 67%, 50%, 1.00); hsla(340, 85%, 60%, 1.00); hsla(60, 90%, 55%, 1.00); hsla(187, 67%, 50%, 1.00)" dur="6s" repeatCount="indefinite"></animate>
                </ellipse>
                
                <ellipse rx="80.5" ry="66.5" cx="446.471435546875" cy="-11.694503784179688" fill="hsla(234, 78%, 61%, 1.00)">
                <animate attributeName="fill" values="hsla(234, 78%, 61%, 1.00); hsla(100, 75%, 60%, 1.00); hsla(290, 80%, 70%, 1.00); hsla(234, 78%, 61%, 1.00)" dur="8s" repeatCount="indefinite"></animate>
                </ellipse>
                
                <ellipse rx="80.5" ry="66.5" cx="200.54574247724838" cy="-19.02454901710908" fill="hsla(167, 87%, 56%, 1.00)">
                <animate attributeName="fill" values="hsla(167, 87%, 56%, 1.00); hsla(10, 90%, 65%, 1.00); hsla(300, 85%, 50%, 1.00); hsla(167, 87%, 56%, 1.00)" dur="10s" repeatCount="indefinite"></animate>
                </ellipse>
                
                <ellipse rx="80.5" ry="66.5" cx="340.05827594708103" cy="-9.424536458161867" fill="hsl(25, 100%, 64%)">
                <animate attributeName="fill" values="hsl(25, 100%, 64%); hsl(200, 100%, 70%); hsl(50, 95%, 55%); hsl(25, 100%, 64%)" dur="8s" repeatCount="indefinite"></animate>
                </ellipse>
            </g>
            </svg>


            </div>
            {/* <div className="w-full border-box text-right pr-[40px]"></div> */}
             <div className="mx-auto flex-1 flex flex-col items-center justify-center z-[3]" >
                 <div className="mx-auto">
                    <span className="flex items-center justify-center">
                      <img
                        className="h-[40px] mr-[8px]"
                        src={Logo}
                    />
                    </span>
                 </div>

                 <section className="block w-[410px] mx-auto mt-[46px] p-[30px] box-border rounded-[10px] shadow-[0_5px_20px_0_rgba(0,0,0,5%)] login-block">
                     <div className="h-full">
                         <div className="">
                             <Form onFinish={login} className="w-[350px]"
                                   ref={formRef}>
                                 <Form.Item
                                     className="p-0 bg-transparent rounded border-none"
                                     name="username"
                                     rules={[{ required: true, message: $t('请输入账号') ,whitespace:true }]}
                                 >
                                     <Input
                                         className="w-[350px] h-[40px] login-input"
                                         placeholder={$t("账号")}
                                         autoComplete="on"
                                         autoFocus
                                     />
                                 </Form.Item>

                                 <Form.Item
                                     className="p-0 bg-transparent rounded border-none "
                                     name="password"
                                     rules={[{ required: true, message: $t('请输入密码')  }]}
                                 >
                                     <Input.Password
                                         className="w-[350px] h-[40px] login-input"
                                         placeholder={$t("密码")}
                                         autoComplete="off"
                                     />
                                 </Form.Item>

                                <Form.Item
                                    className="p-0 bg-transparent rounded border-none "
                                    >
                                    <Button loading={loading} className="h-[40px] mt-mbase w-full inline-flex justify-center items-center" type="primary" htmlType="submit">
                                    {$t('登录')}
                                    </Button>
                                </Form.Item>
                                {
                                    allowGuest && <>
                                    <Divider />
                                    
                                    <Form.Item
                                        className="p-0 bg-transparent rounded border-none mb-0"
                                        >
                                        <Button loading={loading} className="h-[40px]  w-full inline-flex justify-center items-center" type="default" onClick={loginAsGuest}>
                                        {$t('访客模式')} <Tooltip title={$t('您可通过访客模式查看所有页面和功能，但是无法编辑数据。访客模式仅用于了解产品功能，您可以在正式产品中关闭该功能。')}><Icon icon="ic:baseline-help" height={18} width={18} /></Tooltip>
                                        </Button>
                                    </Form.Item>
                                    </>
                                }
                             </Form>
                         </div>
                     </div>
                 </section>

                 <section className="flex flex-col items-center mt-[46px] text-SECOND_TEXT">
                    <p className="leading-[28px]">
                        {$t('Version (0)-(1)',[state?.version,state?.updateDate])}, {$t(state?.powered || '-')}
                     </p>
                        <LanguageSetting mode="light"/>
                 </section>
             </div>
         </div>
     );
}
export default Login;