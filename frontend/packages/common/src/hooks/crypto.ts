/*
 * @Date: 2024-01-31 15:00:11
 * @LastEditors: maggieyyy
 * @LastEditTime: 2024-05-10 17:03:03
 * @FilePath: \frontend\packages\core\src\hooks\crypto.ts
 */
// import CryptoJS from 'crypto-js';

// export const useCrypto = () => {
//     const key = '1e42=7838a1vfc6n';

//     const encryptByEnAES = (secretKey: string, data: string, initializationVector?: string): string => {
//         const iv = CryptoJS.enc.Latin1.parse(initializationVector || key);
//         const keyForEncryption = CryptoJS.enc.Latin1.parse(CryptoJS.MD5(secretKey).toString());

//         const cipher = CryptoJS.AES.encrypt(data, keyForEncryption, {
//             iv,
//             mode: CryptoJS.mode.CBC,
//             padding: CryptoJS.pad.Pkcs7,
//         });

//         return CryptoJS.enc.Base64.stringify(cipher.ciphertext);
//     };

//     return { encryptByEnAES };
// };