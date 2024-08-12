import {App, Avatar, Dropdown, MenuProps} from "antd";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import  {FC, useEffect, useRef, useState} from "react";
import {ResetPsw, ResetPswHandle} from "@common/components/aoplatform/ResetPsw.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useNavigate} from "react-router-dom";
import { UserInfoType, UserProfileHandle } from "@common/const/type.ts";
import { UserProfile } from "./UserProfile.tsx";
import AvatarPic from '@common/assets/avatar_default.svg'

const UserAvatar: FC = () => {
    const { modal,message } = App.useApp()
    const { dispatch,resetAccess,getGlobalAccessData} = useGlobalContext()
    const [userInfo,setUserInfo] = useState<UserInfoType>()
    const resetPswRef = useRef<ResetPswHandle>(null)
    const userProfileRef = useRef<UserProfileHandle>(null)
    const {fetchData} = useFetch()
    const navigate = useNavigate();

    const getUserInfo = ()=>{
        fetchData<BasicResponse<{profile:UserInfoType}>>('account/profile',{method:'GET'})
            .then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setUserInfo(data.profile)
                dispatch({type:'UPDATE_USERDATA',userData:data.profile})
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    useEffect(() => {
        getUserInfo()
        getGlobalAccessData()
    }, []);
    
    const logOut = ()=>{
        fetchData<BasicResponse<null>>('account/logout',{method:'GET'}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                dispatch({type:'LOGOUT'})
                resetAccess()
                message.success(msg || '退出成功，将跳转至登录页')
                navigate('/login')
            }else{
                message.error(msg ||'操作失败')
            }
        })
    }

    const items: MenuProps['items'] = [
        // {
        //     key: '1',
        //     label: (
        //         <a target="_blank" rel="noopener noreferrer" onClick={()=>openModal('userSetting')}>
        //             用户设置
        //         </a>
        //     ),
        // },
        // {
        //     key: '2',
        //     label: (
        //         <a target="_blank" rel="noopener noreferrer" onClick={()=>openModal('resetPsw')}>
        //            修改密码
        //         </a>
        //     ),
        // },
        {
            key: '3',
            label: (
                <a className="block px-btnbase leading-[32px]" target="_blank" rel="noopener noreferrer" onClick={logOut}>
                   退出登录
                </a>
            ),
        },
    ];

    const openModal = (type:'userSetting'|'resetPsw')=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'userSetting':
                title='用户设置'
                content=<UserProfile ref={userProfileRef} entity={userInfo}/>
                break;
            case 'resetPsw':
                title='重置密码'
                content=<ResetPsw ref={resetPswRef} entity={userInfo}  />
                break;
        }
        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'userSetting':
                        return userProfileRef.current?.save().then((res)=>{if(res === true) getUserInfo()})
                    case 'resetPsw':
                        return resetPswRef.current?.save().then((res)=>{if(res === true) logOut()})
                }
            },
            width:600,
            okText:'确认',
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }


    return (
    <Dropdown menu={{ items }}>
            <span className="flex items-center"><Avatar className="mx-[6px]" src={AvatarPic || userInfo?.avatar}></Avatar><span>{userInfo?.username||'unknown'}</span></span>
    </Dropdown>
    )
}

export default UserAvatar