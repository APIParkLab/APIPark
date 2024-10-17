export const extractIPFromURL = (url:string|string[]) =>{
    if (Array.isArray(url)) {
        url = url[0]; // 获取第一个 URL
    }
    if (typeof url !== 'string' || !url.includes("://")) {
        console.warn("Invalid URL format");
        return null;
    }
    const match = url.match(/https?:\/\/([\d.]+):\d+/);
    return match ? match[1] : null;
}

export const isPrivateIP = (ip:string) =>{
    if (typeof ip !== 'string') {
        console.error("Invalid IP format");
        return false;
    }
    const privateIpRegex = /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3})$|^(172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})$|^(192\.168\.\d{1,3}\.\d{1,3})$/;
    return privateIpRegex.test(ip);
}