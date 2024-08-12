
import  {FC, useRef, useEffect, Children, cloneElement, isValidElement } from 'react';

interface ScrollableSectionProps {
  children: React.ReactNode;
}

const ScrollableSection: FC<ScrollableSectionProps> = ({ children }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const scrollTop = scrollAreaRef.current.scrollTop;
        const scrollHeight = scrollAreaRef.current.scrollHeight;
        const clientHeight = scrollAreaRef.current.clientHeight;

       // 如果滚动到顶部，.content-before 应该显示阴影
       const showTopShadow = scrollTop > 0;
       // 如果滚动到底部，.content-after 应该显示阴影
       const showBottomShadow = scrollHeight - scrollTop < clientHeight;
       // 这里我们不直接更新状态，而是通过ref来设置样式
       if (showTopShadow && !showBottomShadow) {
         setElementShadow('.content-before', true);
         setElementShadow('.content-after', false);
       } else if (!showTopShadow && showBottomShadow) {
         setElementShadow('.content-before', false);
         setElementShadow('.content-after', true);
       } else {
         setElementShadow('.content-before', false);
         setElementShadow('.content-after', false);
       }
      }
    };

    scrollAreaRef.current?.addEventListener('scroll', handleScroll);

    return () => {
      scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const setElementShadow = (elementSelector: string, showShadow: boolean) => {
    const element = document.querySelector(elementSelector);
    if (element) {
      element.style.boxShadow = showShadow ? ( elementSelector === '.content-before' ? '0 2px 2px #0000000d':'0 -2px 2px -2px var(--border-color)') : 'none';
    }
  }

  const childrenWithRef = Children.toArray(children).map((child) => {
    if (isValidElement(child) && child.props.className && child.props.className.includes('scroll-area')) {
      // 将 ref 附加到具有 'scroll-area' 类名的子元素
      return cloneElement(child, { ref: scrollAreaRef });
    }
    return child;
  });

  return (
    <>  {childrenWithRef}
    </>
  );
};

export default ScrollableSection;