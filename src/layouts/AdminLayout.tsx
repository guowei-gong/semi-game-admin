import { useState, useMemo } from 'react';
import { Nav, Avatar, Tabs, TabPane, Dropdown } from '@douyinfe/semi-ui-19';
import {
  IconHome,
  IconUser,
  IconApps,
  IconSetting,
  IconExit,
  IconBell,
  IconHelpCircle,
  IconSemiLogo,
  IconGift,
  IconUserGroup,
  IconHistogram
} from '@douyinfe/semi-icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './AdminLayout.module.scss';

// 顶部导航配置
const topNavItems = [
  { itemKey: 'home', text: '首页' },
  { itemKey: 'management', text: '管理中心' },
  { itemKey: 'data', text: '数据分析' },
  { itemKey: 'settings', text: '系统设置' },
];

// 侧边 Tab 配置（根据顶部导航分组）
const sideTabsConfig: Record<string, { key: string; tab: string; icon: React.ReactNode; path: string }[]> = {
  home: [
    { key: '/dashboard', tab: '仪表盘', icon: <IconHome />, path: '/dashboard' },
  ],
  management: [
    { key: '/users', tab: '用户管理', icon: <IconUserGroup />, path: '/users' },
    { key: '/users/vip', tab: 'VIP用户', icon: <IconUser />, path: '/users/vip' },
    { key: '/game-data', tab: '道具管理', icon: <IconApps />, path: '/game-data' },
    { key: '/game-data/levels', tab: '关卡管理', icon: <IconApps />, path: '/game-data/levels' },
    { key: '/activities', tab: '活动管理', icon: <IconGift />, path: '/activities' },
  ],
  data: [
    { key: '/statistics', tab: '数据统计', icon: <IconHistogram />, path: '/statistics' },
  ],
  settings: [
    { key: '/settings', tab: '系统设置', icon: <IconSetting />, path: '/settings' },
  ],
};

// 路由到顶部导航的映射
const pathToTopNav: Record<string, string> = {
  '/dashboard': 'home',
  '/users': 'management',
  '/users/vip': 'management',
  '/game-data': 'management',
  '/game-data/levels': 'management',
  '/activities': 'management',
  '/statistics': 'data',
  '/settings': 'settings',
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路径确定顶部导航选中项
  const currentTopNav = useMemo(() => {
    return pathToTopNav[location.pathname] || 'home';
  }, [location.pathname]);

  const [activeTopNav, setActiveTopNav] = useState(currentTopNav);

  // 当前侧边 Tab 列表
  const currentSideTabs = useMemo(() => {
    return sideTabsConfig[activeTopNav] || [];
  }, [activeTopNav]);

  // 处理顶部导航切换
  const handleTopNavSelect = (data: { itemKey: string }) => {
    setActiveTopNav(data.itemKey as string);
    // 切换到该分类的第一个页面
    const tabs = sideTabsConfig[data.itemKey];
    if (tabs && tabs.length > 0) {
      navigate(tabs[0].path);
    }
  };

  // 处理侧边 Tab 切换
  const handleTabChange = (activeKey: string) => {
    navigate(activeKey);
  };

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
            <IconHelpCircle size="large" className={styles.navIcon} />
            <IconBell size="large" className={styles.navIcon} />
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
        className={styles.nav}
      >
        {topNavItems.map(item => (
          <Nav.Item key={item.itemKey} itemKey={item.itemKey} text={item.text} />
        ))}
      </Nav>
      <div className={styles.content}>
        <Tabs
          tabPosition="left"
          activeKey={location.pathname}
          onChange={handleTabChange}
          type="button"
          size="large"
          className={styles.tabs}
        >
          {currentSideTabs.map(tab => (
            <TabPane
              key={tab.key}
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tab.icon}
                  {tab.tab}
                </span>
              }
              itemKey={tab.key}
            />
          ))}
        </Tabs>
        <div className={styles.mainContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
