import { useState, useMemo } from 'react';
import { Nav, Avatar, Dropdown, Breadcrumb, Typography } from '@douyinfe/semi-ui-19';
import {
  IconUser,
  IconSetting,
  IconExit,
  IconBell,
  IconHelpCircle,
  IconSemiLogo,
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

// 顶部导航配置（仅保留有页面的入口）
const topNavItems = [
  { itemKey: 'home', text: '首页' },
  { itemKey: 'management', text: '管理中心' },
  { itemKey: 'settings', text: '系统设置' },
];

// 侧边导航配置（根据顶部导航分组）
// 注：仅保留已创建页面的入口
const sideNavConfig: Record<string, { itemKey: string; text: string; icon: React.ReactNode }[]> = {
  home: [
    { itemKey: '/dashboard', text: '仪表盘', icon: <IconIntro className={styles.navIcon} /> },
  ],
  management: [
    { itemKey: '/users', text: '用户管理', icon: <IconHeart className={styles.navIcon} /> },
    { itemKey: '/game-data', text: '道具管理', icon: <IconCalendar className={styles.navIcon} /> },
    { itemKey: '/hot-update', text: '热更新', icon: <IconConfig className={styles.navIcon} /> },
  ],
  settings: [
    { itemKey: '/settings', text: '系统设置', icon: <IconToast className={styles.navIcon} /> },
  ],
};

// 路由到顶部导航的映射
const pathToTopNav: Record<string, string> = {
  '/dashboard': 'home',
  '/users': 'management',
  '/game-data': 'management',
  '/hot-update': 'management',
  '/settings': 'settings',
};

// 顶部导航名称映射
const topNavNameMap: Record<string, string> = {
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

  // 根据当前路径确定顶部导航选中项
  const currentTopNav = useMemo(() => {
    return pathToTopNav[location.pathname] || 'home';
  }, [location.pathname]);

  const [activeTopNav, setActiveTopNav] = useState(currentTopNav);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  // 当前侧边导航列表
  const currentSideNavItems = useMemo(() => {
    return sideNavConfig[activeTopNav] || [];
  }, [activeTopNav]);

  // 处理顶部导航切换
  const handleTopNavSelect = (data: { itemKey: string }) => {
    setActiveTopNav(data.itemKey as string);
    // 切换到该分类的第一个页面
    const items = sideNavConfig[data.itemKey];
    if (items && items.length > 0) {
      navigate(items[0].itemKey);
    }
  };

  // 处理侧边导航切换
  const handleSideNavSelect = (data: { itemKey: string }) => {
    navigate(data.itemKey);
  };

  // 生成面包屑数据
  const breadcrumbItems = useMemo(() => {
    const topNavKey = pathToTopNav[location.pathname] || 'home';
    const topNavName = topNavNameMap[topNavKey];
    const pageName = pathToPageName[location.pathname];

    const items = [{ name: topNavName }];
    if (pageName && pageName !== topNavName) {
      items.push({ name: pageName });
    }
    return items;
  }, [location.pathname]);

  return (
    <div className={styles.frame}>
      <Nav
        mode="horizontal"
        selectedKeys={[activeTopNav]}
        onSelect={handleTopNavSelect}
        header={{
          logo: <IconSemiLogo className={styles.semiIconsSemiLogo} />,
          text: "游戏管理后台",
        }}
        footer={
          <div className={styles.navFooter}>
            <IconHelpCircle size="large" className={styles.headerIcon} />
            <IconBell size="large" className={styles.headerIcon} />
            <Dropdown
              position="bottomRight"
              render={
                <Dropdown.Menu>
                  <Dropdown.Item icon={<IconUser />}>个人信息</Dropdown.Item>
                  <Dropdown.Item icon={<IconSetting />}>账号设置</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item icon={<IconExit />} type="danger">
                    退出登录
                  </Dropdown.Item>
                </Dropdown.Menu>
              }
            >
              <span className={styles.userInfo}>
                <Avatar
                  size="small"
                  color="blue"
                  className={styles.avatar}
                >
                  管
                </Avatar>
              </span>
            </Dropdown>
          </div>
        }
        className={styles.topNav}
      >
        {topNavItems.map(item => (
          <Nav.Item key={item.itemKey} itemKey={item.itemKey} text={item.text} />
        ))}
      </Nav>
      <div className={styles.main}>
        <Nav
          mode="vertical"
          selectedKeys={[location.pathname]}
          onSelect={handleSideNavSelect}
          items={currentSideNavItems}
          isCollapsed={sideNavCollapsed}
          onCollapseChange={setSideNavCollapsed}
          footer={{ collapseButton: true }}
          className={styles.sideNav}
        />
        <div className={styles.content}>
          <Breadcrumb className={styles.breadcrumb}>
            {breadcrumbItems.map((item, index) => (
              <Breadcrumb.Item key={index}>{item.name}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <div className={styles.pageContent}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
