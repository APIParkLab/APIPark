
export type BasicResponse<T> = {
    code:number
    data:T
    msg:string
}


export const STATUS_CODE = {
    SUCCESS:0,
    UNANTHORIZED:401,
    FORBIDDEN:403
}

export const STATUS_COLOR = {
    'done':'text-[#03a9f4]',
    'error':'text-[#ff3b30]'
}

const NAV_HEIGHT = 72