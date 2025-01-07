import { Icon } from '@iconify/react/dist/iconify.js'
import { MenuProps } from 'antd'

export type MenuItem = Required<MenuProps>['items'][number]

export function getNavItem({
  label,
  key,
  path,
  icon,
  children,
  type,
  access
}: {
  label: React.ReactNode
  key: React.Key
  path?: string
  icon?: React.ReactNode
  children?: MenuItem[]
  type?: 'group'
  access?: string[] | string
}): MenuItem {
  return {
    key,
    icon,
    routes: children,
    name: label,
    type,
    access,
    path
  } as MenuItem
}

export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
  access?: string[] | string
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
    access
  } as MenuItem
}

export function getTabItem(
  label: React.ReactNode,
  key: React.Key,
  children?: MenuItem[],
  type?: 'group',
  access?: string
) {
  return {
    key,
    label,
    access
  }
}

export function transformMenuData(data: any[]): MenuItem[] {
  return data.map((item) => {
    const { name, key, path, icon, children, access } = item
    return getNavItem({
      label: name,
      key,
      path,
      icon: icon ? <Icon icon={icon} width="18" height="18" /> : undefined,
      children: children ? transformMenuData(children) : undefined,
      access
    })
  })
}
