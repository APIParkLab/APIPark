
import { renderHook, act } from '@testing-library/react-hooks';
import useCopyToClipboard from '../../src/hooks/copy';

describe('useCopyToClipboard', () => {
  let navigatorClipboardSpy;
  let execCommandSpy;
  let isSecureContextOriginalValue;

  beforeEach(() => {
    isSecureContextOriginalValue = window.isSecureContext;
    window.isSecureContext = true;
    // 确保 navigator 对象存在
    if (!globalThis.navigator) {
      // @ts-expect-error navigator object may not exist in some environments
      globalThis.navigator = {};
    }
    // 确保 clipboard 对象存在
    console.log(globalThis.navigator, navigator,navigator.clipboard)
    if (!navigator.clipboard) {
      // @ts-expect-error clipboard object may not exist in some environments
      navigator.clipboard = {};
      navigator.clipboard.writeText = jest.fn().mockImplementation(()=>{
        return Promise.resolve('')
      });
    }
    // 使用 jest.fn() 创建 writeText 方法的模拟函数
    navigatorClipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');
    // navigatorClipboardSpy.mockReset();
    document.execCommand = jest.fn().mockImplementation(() => true);
    execCommandSpy = jest.spyOn(document, 'execCommand');
  });
  
  afterEach(() => {
    window.isSecureContext = isSecureContextOriginalValue;
  });

  it('should define copyToClipboard function', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copyToClipboard).toBeDefined();
  });

  it('should initialize isCopied as false', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.isCopied).toBe(false);
  });

  it('should set isCopied back to false after 3 seconds', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useCopyToClipboard());
    navigatorClipboardSpy.mockResolvedValueOnce();
    await act(async () => result.current.copyToClipboard('test'));
    jest.advanceTimersByTime(3000);
    expect(result.current.isCopied).toBe(false);
    jest.useRealTimers();
  });

  it('should call navigator.clipboard.writeText when copyToClipboard is called', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => result.current.copyToClipboard('test'));
    expect(navigatorClipboardSpy).toHaveBeenCalledWith('test');
  });
  it('should call document.execCommand when navigator.clipboard is not available', async () => {
    window.isSecureContext = false;
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => result.current.copyToClipboard('test'));
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
  });

  it('should set isCopied to true when document.execCommand is successful', async () => {
    window.isSecureContext = false;
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => result.current.copyToClipboard('test'));
    expect(result.current.isCopied).toBe(true);
  });

  it('should keep isCopied as false when document.execCommand fails', async () => {
    window.isSecureContext = false;
    document.execCommand = jest.fn().mockImplementation(() => false);
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => result.current.copyToClipboard('test'));
    expect(result.current.isCopied).toBe(false);
  });
  it('should handle exceptions from navigator.clipboard.writeText', async () => {
    const error = new Error('Failed to copy');
    navigator.clipboard.writeText = jest.fn().mockImplementation(() => Promise.reject(error));
    const { result } = renderHook(() => useCopyToClipboard());
    const consoleErrorSpy = jest.spyOn(console, 'error');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    await act(async () => result.current.copyToClipboard('test'));
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle exceptions from document.execCommand', async () => {
    window.isSecureContext = false;
    document.execCommand = jest.fn().mockImplementation(() => { throw new Error('Failed to copy'); });
    const { result } = renderHook(() => useCopyToClipboard());
    const consoleErrorSpy = jest.spyOn(console, 'error');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    await act(async () => result.current.copyToClipboard('test'));
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});