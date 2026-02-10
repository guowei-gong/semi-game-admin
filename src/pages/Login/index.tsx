import { useState } from 'react';
import { Form, Button, Typography, Carousel, Divider, Notification } from '@douyinfe/semi-ui-19';
import { IconUser, IconLock } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

const { Title, Paragraph } = Typography;

const carouselData = [
  {
    image: '/p1.jpg',
    title: '游戏配置管理',
    description: '在线管理游戏配置，支持热更新，无需重启服务即可生效',
  },
  {
    image: '/p2.jpg',
    title: '数据分析看板',
    description: '实时掌握游戏运营数据，助力决策优化',
  },
  {
    image: '/p3.jpg',
    title: '用户运营工具',
    description: '高效管理玩家账号，提供封禁、查询等运营能力',
  },
];

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      const json = await res.json();
      if (json.code === 0) {
        localStorage.setItem('token', json.data.token);
        navigate('/dashboard');
      } else {
        Notification.error({
          title: '登录失败',
          content: json.message || '登录失败',
          duration: 3,
          theme: 'light',
        });
      }
    } catch {
      Notification.error({
        title: '请求失败',
        content: '登录请求失败，请检查网络连接',
        duration: 3,
        theme: 'light',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 左侧轮播图 */}
      <div className={styles.left}>
        <div className={styles.carouselWrapper}>
          <Carousel
            theme="dark"
            showArrow={false}
            speed={1000}
            animation="fade"
            autoPlay={{ interval: 4000, hoverToPause: true }}
            style={{ width: '100%', height: '100%' }}
          >
            {carouselData.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundImage: `url('${item.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className={styles.carouselOverlay}>
                  <Title heading={3} className={styles.carouselTitle}>{item.title}</Title>
                  <Paragraph className={styles.carouselDesc}>{item.description}</Paragraph>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className={styles.right}>
        <div className={styles.formWrapper}>
          <div className={styles.logo}>
            <span className={styles.logoText}>
              Cheng<span className={styles.accentLetter}>D</span>u N<span className={styles.accentLetter}>A</span>ntungyu
            </span>
            <span className={styles.logoSubText}>
              Network Technology Co. <span className={styles.accentLetter}>L</span>td
            </span>
          </div>
          <Title heading={3} className={styles.welcomeTitle}>欢迎，管理员👋</Title>
          <Paragraph className={styles.welcomeDesc}>
            全新开放世界角色冒险游戏。你将在游戏中探索一个被称作「莱纳星球」的幻想世界
          </Paragraph>
          <Divider className={styles.divider} />

          <Form onSubmit={handleSubmit}>
            <Form.Input
              field="email"
              label="邮箱"
              prefix={<IconUser />}
              placeholder="请输入邮箱"
              size="large"
              className={styles.formField}
              rules={[{ required: true, message: '请输入邮箱' }]}
            />
            <Form.Input
              field="password"
              label="密码"
              mode="password"
              prefix={<IconLock />}
              placeholder="请输入密码"
              size="large"
              className={styles.formField}
              rules={[{ required: true, message: '请输入密码' }]}
            />
            <Button
              type="primary"
              theme="solid"
              htmlType="submit"
              block
              loading={loading}
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
