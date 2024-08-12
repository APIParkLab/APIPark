import {FC, useCallback, useEffect, useRef, useState} from "react";
import {App, Button, Form, FormInstance, Input} from "antd";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useNavigate} from "react-router-dom";
// import {useCrypto} from "../hooks/crypto.ts";
import Logo from '@common/assets/logo.png'

const Login:FC = ()=> {
     const {state, dispatch} = useGlobalContext()
     const {fetchData} = useFetch()
     const { message } = App.useApp()
    const navigate = useNavigate();
    const formRef = useRef<FormInstance>(null);
    const [loading,setLoading] = useState<boolean>()
    // const { encryptByEnAES } = useCrypto();


    const check = useCallback(()=>{
        fetchData<BasicResponse<{channel:Array<{name:string}>, status:string}>>('account/login',{method:'GET'}).then(response=>{
            const {code,data} = response
            if(code === STATUS_CODE.SUCCESS && data.status !== 'anonymous'){
                dispatch({type:'LOGIN'})
                navigate(state.mainPage)
            }else{
                dispatch({type:'LOGOUT'})
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

    const login = async () => {
        if (formRef.current) {
            try {
                const values = await formRef.current.validateFields();
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
                    message.success('登录成功');
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
    };

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
                                 <span className="text-[24px] text-[#101010]">登录</span>
                             </div>

                             <Form onFinish={login} className="w-[350px] pt-[28px]"
                                   ref={formRef}>
                                 <Form.Item
                                     className="p-0 bg-transparent rounded border-none"
                                     name="username"
                                     rules={[{ required: true, message: '请输入账号' ,whitespace:true }]}
                                 >
                                     <Input
                                         className="w-[350px] h-[40px]"
                                         placeholder="账号"
                                         autoComplete="on"
                                         autoFocus
                                     />
                                 </Form.Item>

                                 <Form.Item
                                     className="p-0 bg-transparent rounded border-none"
                                     name="password"
                                     rules={[{ required: true, message: '请输入密码'  }]}
                                 >
                                     <Input.Password
                                         className="w-[350px] h-[40px]"
                                         placeholder="密码"
                                         autoComplete="off"
                                     />
                                 </Form.Item>

                                 <div className=" justify-center">
                                     <Form.Item
                                     className="p-0 bg-transparent rounded border-none mb-0"
                                     >
                                         <Button loading={loading} className="h-[40px] mt-mbase w-full inline-flex justify-center items-center" type="primary" htmlType="submit">
                                             登录
                                         </Button>
                                     </Form.Item>
                                 </div>
                             </Form>
                         </div>
                     </div>
                 </section>

                 <section className="flex flex-col items-center mt-[46px] text-SECOND_TEXT">
                     <p className="leading-[28px]">Version {state.version}-{state.updateDate}</p>
                     <p className="leading-[28px]">{state.powered}</p>
                 </section>
             </div>
         </div>
     );
}
export default Login;