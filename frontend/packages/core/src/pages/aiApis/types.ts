export interface APIs {
    id: string;
    name: string;
    service: {
      id: string;
      name: string;
    };
    team:{
      id: string;
      name: string;
    },
    method: string;
    request_path: string;
    model: string;
    disabled: boolean;
    update_time: string;
    use_token: number;
}