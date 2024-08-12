
import { MenuItem } from "@common/components/aoplatform/Navigation";

export function getNavItem(
  label: React.ReactNode,
  key: React.Key,
  path:string,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
  access?:string[] | string
): MenuItem {
  return {
    key,
    icon :icon ,
    path,
    routes:children,
    name:label,
    type,
    access
  } as MenuItem;
}

export function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
    access?:string[] | string
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
      access
    } as MenuItem;
  }

  export function getTabItem(
    label: React.ReactNode,
    key: React.Key,
    children?: MenuItem[],
    type?: 'group',
    access?:string
  ) {
    return {
      key,
      label,
      access
    } 
  }