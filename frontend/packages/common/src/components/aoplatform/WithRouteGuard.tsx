import { set } from 'lodash-es';
import { ExoticComponent, JSXElementConstructor, ReactElement, useEffect, useState } from 'react';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { JSX } from 'react/jsx-runtime';

const withRouteGuard = (WrappedComponent: ExoticComponent<any> | JSXElementConstructor<any>, {
  canActivate,
  canLoad ,
  canDeactivate,
  deactivated,
  pathPrefix
}: { pathPrefix?:string, canActivate?: () => Promise<boolean>; canLoad?: () => Promise<boolean>; canDeactivate?: () => Promise<boolean>; deactivated?: () => Promise<void>; } = {}) => {
  return function RouteGuard(props: JSX.IntrinsicAttributes) {
    const [isActivated, setIsActivated] = useState<boolean>(false);
    const location = useLocation();
    // check canActivate
    const startLifecycle = async ()=>{
      if(canActivate){
        const activateRes = await canActivate();
        setIsActivated(activateRes);
      }else{
        setIsActivated(true);
      }
    }
    
      // check canDeactivate
      const handleBeforeUnload =async (event: { preventDefault: () => void; returnValue: string; }) => {
        const deactivateRes = canDeactivate? await canDeactivate():true;
        if (!deactivateRes) {
          event.preventDefault();
          event.returnValue = ''; 
        }
      };

    // 激活组件时的检查
    useEffect(() => {
      startLifecycle();
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        deactivated?.();
      };
    }, []);


    const blocker = useBlocker((tx) => {
      const currentPath = location.pathname;
      const targetPath = tx.nextLocation.pathname; 

      if (pathPrefix && currentPath.startsWith(pathPrefix) &&  !targetPath.startsWith(pathPrefix) && canDeactivate) {
        canDeactivate().then((res) => {
          if(res){
            return false; 
          }else{
            return true; 
          }
        })
      } else {
        return false
      }
    });

    
    const checkCanLoad = async()=>{
      const loadRes = await canLoad!();
      !loadRes && setIsActivated(false);
    }
    useEffect(() => {
      if (isActivated && canLoad) {
        checkCanLoad()
      }
    }, [isActivated]);

    return isActivated ? <WrappedComponent {...props}/> : null;
  };
}

export default withRouteGuard;