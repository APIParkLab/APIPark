
import { RESPONSE_TIPS } from '@common/const/const';
import { message } from 'antd';
import { useEffect, useState } from 'react';

const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)?.then(() => {
      message.success($t(RESPONSE_TIPS.copySuccess))
        setIsCopied(true)
      })
      .catch((error) => {
        console.error('Failed to copy text to clipboard:', error);
      });
    } else {
        // 创建text partition
      const textArea = document.createElement("textarea");
        textArea.value = text;
        // 使text area不在viewport，同时设置不可见
        textArea.style.position = "absolute";
        textArea.style.opacity = 0 + '';
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        // textArea.focus();
        textArea.select();
        new Promise<void>((resolve, reject) => {
          if(document.execCommand('copy')) {
            message.success($t(RESPONSE_TIPS.copySuccess))
            setIsCopied(true)
            resolve()
          } else {
            reject('Failed to copy text to clipboard:')
          }
        }).catch((error) => {
          console.error('Failed to copy text to clipboard:', error);
        }).finally(() => {
          textArea.remove();

        })
    }
  };


  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isCopied]);

  return { isCopied, copyToClipboard };
};

export default useCopyToClipboard;
