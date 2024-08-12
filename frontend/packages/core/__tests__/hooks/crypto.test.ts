
import {useCrypto} from '../../src/hooks/crypto';
import CryptoJS from 'crypto-js';

describe('useCrypto', () => {
    const { encryptByEnAES } = useCrypto();
    const key = '1e42=7838a1vfc6n';
    const data = 'test data';
    const iv = '1234567890123456'

    it('should return correct ciphertext', () => {
        const encryptedData = encryptByEnAES(key, data, iv);
        const tmpKey = CryptoJS.enc.Latin1.parse(CryptoJS.MD5(key).toString() || '');
        const tmpIv = CryptoJS.enc.Latin1.parse(iv);
        const decryptedData = CryptoJS.AES.decrypt(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { ciphertext: CryptoJS.enc.Base64.parse(encryptedData)} as any,
          tmpKey,
          {
            iv: tmpIv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }
        ).toString(CryptoJS.enc.Utf8);
    
        expect(decryptedData).toBe(data);
      });
    
});