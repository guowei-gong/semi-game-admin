import { useState } from 'react';
import { Form, Button, Card, Typography, Toast } from '@douyinfe/semi-ui-19';
import { IconUser, IconLock } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (values: { username: string; password: string }) => {
    setLoading(true);

    // 模拟登录请求
    setTimeout(() => {
      if (values.username === 'admin' && values.password === 'admin') {
        Toast.success('登录成功');
        navigate('/dashboard');
      } else {
        Toast.error('用户名或密码错误');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--semi-color-bg-0)',
    }}>
      <Card style={{ width: 400, padding: '20px 10px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title heading={3}>游戏管理后台</Title>
          <Text type="tertiary">请输入账号密码登录</Text>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Input
            field="username"
            label="用户名"
            prefix={<IconUser />}
            placeholder="请输入用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <Form.Input
            field="password"
            label="密码"
            mode="password"
            prefix={<IconLock />}
            placeholder="请输入密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ marginTop: 16 }}
          >
            登录
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="tertiary" size="small">
            测试账号: admin / admin
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
