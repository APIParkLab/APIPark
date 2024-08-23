import {FC, useCallback, useEffect, useRef, useState} from "react";
import {App, Button, Divider, Form, FormInstance, Input, Tooltip} from "antd";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useNavigate} from "react-router-dom";
// import {useCrypto} from "../hooks/crypto.ts";
import Logo from '@common/assets/logo.png'
import { $t } from "@common/locales";
import { Icon } from "@iconify/react/dist/iconify.js";

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
                // message.success(RESPONSE_TIPS.loginSuccess);
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
         <div className="h-full w-full flex bg-[#f5f7fa] items-center overflow-auto min-h-[490px]">
             <div className="w-[410px] mx-auto">
                 <div className="mx-auto">
                    <span className="flex items-center justify-center">
                      <img
                        className="h-[40px] mr-[8px]"
                        src={Logo}
                    />
                    </span>
                 </div>

                 <section className="block w-[410px] mx-auto mt-[46px] bg-MAIN_BG p-[30px] box-border rounded-[10px] shadow-[0_5px_20px_0_rgba(0,0,0,5%)]">
                     <div className="h-full">
                         <div>
                             <div className="flex justify-center items-center">
                                 <span className="text-[24px] text-[#101010]">{$t('登录')}</span>
                             </div>

                             <Form onFinish={login} className="w-[350px] pt-[28px]"
                                   ref={formRef}>
                                 <Form.Item
                                     className="p-0 bg-transparent rounded border-none"
                                     name="username"
                                     rules={[{ required: true, message: $t('请输入账号') ,whitespace:true }]}
                                 >
                                     <Input
                                         className="w-[350px] h-[40px]"
                                         placeholder={$t("账号")}
                                         autoComplete="on"
                                         autoFocus
                                     />
                                 </Form.Item>

                                 <Form.Item
                                     className="p-0 bg-transparent rounded border-none"
                                     name="password"
                                     rules={[{ required: true, message: $t('请输入密码')  }]}
                                 >
                                     <Input.Password
                                         className="w-[350px] h-[40px]"
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
                     <p className="leading-[28px]">{$t('Version (0)-(1)',[state.version,state.updateDate])}</p>
                     <p className="leading-[28px]">{$t(state.powered)}</p>
                 </section>
             </div>
         </div>
     );
}
export default Login;