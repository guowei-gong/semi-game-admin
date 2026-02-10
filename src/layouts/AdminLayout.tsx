import { useState, useMemo, useEffect } from 'react';
import { Nav, Avatar, Dropdown, Button, Breadcrumb } from '@douyinfe/semi-ui-19';
import {
  IconUser,
  IconSetting,
  IconExit,
  IconSemiLogo,
  IconSun,
  IconMoon,
  IconChevronRight,
} from '@douyinfe/semi-icons';
import {
  IconIntro,
  IconHeart,
  IconCalendar,
  IconToast,
  IconConfig,
} from '@douyinfe/semi-icons-lab';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './AdminLayout.module.scss';

// 一级导航配置（图标导航栏）
const primaryNavItems = [
  { itemKey: 'home', text: '首页', icon: <IconIntro className={styles.primaryIcon} /> },
  { itemKey: 'management', text: '管理中心', icon: <IconConfig className={styles.primaryIcon} /> },
  { itemKey: 'settings', text: '系统设置', icon: <IconToast className={styles.primaryIcon} /> },
];

// 二级导航配置（根据一级导航分组）
const secondaryNavConfig: Record<string, { itemKey: string; text: string; icon: React.ReactNode }[]> = {
  home: [
    { itemKey: '/dashboard', text: '仪表盘', icon: <IconIntro className={styles.secondaryIcon} /> },
  ],
  management: [
    { itemKey: '/users', text: '用户管理', icon: <IconHeart className={styles.secondaryIcon} /> },
    { itemKey: '/game-data', text: '道具管理', icon: <IconCalendar className={styles.secondaryIcon} /> },
    { itemKey: '/hot-update', text: '热更新', icon: <IconConfig className={styles.secondaryIcon} /> },
  ],
  settings: [
    { itemKey: '/settings', text: '系统设置', icon: <IconToast className={styles.secondaryIcon} /> },
  ],
};

// 路由到一级导航的映射
const pathToPrimaryNav: Record<string, string> = {
  '/dashboard': 'home',
  '/users': 'management',
  '/game-data': 'management',
  '/hot-update': 'management',
  '/settings': 'settings',
};

// 一级导航名称映射
const primaryNavNameMap: Record<string, string> = {
  home: '首页',
  management: '管理中心',
  settings: '系统设置',
};

// 路由到页面名称的映射
const pathToPageName: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/users': '用户管理',
  '/game-data': '道具管理',
  '/hot-update': '热更新',
  '/settings': '系统设置',
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPrimaryNav = useMemo(() => {
    return pathToPrimaryNav[location.pathname] || 'home';
  }, [location.pathname]);

  const [activePrimaryNav, setActivePrimaryNav] = useState(currentPrimaryNav);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.setAttribute('theme-mode', 'dark');
    } else {
      body.removeAttribute('theme-mode');
    }
    localStorage.setItem('theme-mode', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // 当前二级导航列表
  const currentSecondaryItems = useMemo(() => {
    return secondaryNavConfig[activePrimaryNav] || [];
  }, [activePrimaryNav]);

  // 处理一级导航切换
  const handlePrimaryNavSelect = (data: { itemKey: string }) => {
    setActivePrimaryNav(data.itemKey as string);
    const items = secondaryNavConfig[data.itemKey];
    if (items && items.length > 0) {
      navigate(items[0].itemKey);
    }
  };

  // 处理二级导航切换
  const handleSecondaryNavSelect = (data: { itemKey: string }) => {
    navigate(data.itemKey);
  };

  // 页面标题
  const pageTitle = useMemo(() => {
    return pathToPageName[location.pathname] || '';
  }, [location.pathname]);

  // 面包屑数据
  const breadcrumbItems = useMemo(() => {
    const primaryKey = pathToPrimaryNav[location.pathname] || 'home';
    const primaryName = primaryNavNameMap[primaryKey];
    const pageName = pathToPageName[location.pathname];
    const items = [{ name: primaryName }];
    if (pageName && pageName !== primaryName) {
      items.push({ name: pageName });
    }
    return items;
  }, [location.pathname]);

  return (
    <div className={styles.frame}>
      {/* 一级导航：收起的图标栏 */}
      <Nav
        isCollapsed={true}
        mode="vertical"
        selectedKeys={[activePrimaryNav]}
        onSelect={handlePrimaryNavSelect}
        header={{
          logo: (
            <div className={styles.logoWrap}>
              <IconSemiLogo className={styles.semiIconsSemiLogo} />
            </div>
          ),
        }}
        footer={
          <div className={styles.primaryFooter}>
            <Button
              theme="borderless"
              icon={darkMode ? <IconSun /> : <IconMoon />}
              onClick={toggleDarkMode}
              className={styles.primaryFooterBtn}
              aria-label={darkMode ? '切换到亮色模式' : '切换到暗色模式'}
            />
            <Dropdown
              position="rightBottom"
              render={
                <Dropdown.Menu>
                  <Dropdown.Item icon={<IconUser />}>个人信息</Dropdown.Item>
                  <Dropdown.Item icon={<IconSetting />}>账号设置</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    icon={<IconExit />}
                    type="danger"
                    onClick={() => {
                      localStorage.removeItem('token');
                      navigate('/login');
                    }}
                  >
                    退出登录
                  </Dropdown.Item>
                </Dropdown.Menu>
              }
            >
              <span>
                <Avatar size="small" color="blue" className={styles.primaryAvatar}>
                  管
                </Avatar>
              </span>
            </Dropdown>
          </div>
        }
        className={styles.primaryNav}
      >
        {primaryNavItems.map(item => (
          <Nav.Item
            key={item.itemKey}
            itemKey={item.itemKey}
            text={item.text}
            icon={item.icon}
          />
        ))}
      </Nav>

      {/* 二级导航：展开的侧边栏 */}
      <Nav
        mode="vertical"
        selectedKeys={[location.pathname]}
        onSelect={handleSecondaryNavSelect}
        items={currentSecondaryItems}
        className={styles.secondaryNav}
      />

      {/* 内容区域 */}
      <div className={styles.content}>
        <Breadcrumb separator={<IconChevronRight size="small" />} className={styles.breadcrumb}>
          {breadcrumbItems.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {index === breadcrumbItems.length - 1 ? (
                <span className={styles.breadcrumbActive}>{item.name}</span>
              ) : (
                item.name
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <p className={styles.pageTitle}>{pageTitle}</p>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
