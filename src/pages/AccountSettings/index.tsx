import { useState } from 'react';
import { Form, Button, Typography, Toast } from '@douyinfe/semi-ui-19';
import { request } from '../../utils/request';
import styles from './index.module.scss';

const { Title, Paragraph } = Typography;

const AccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formApi, setFormApi] = useState<any>(null);

  const handleSubmit = async (values: Record<string, string>) => {
    if (values.newPassword !== values.confirmPassword) {
      Toast.error('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await request('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });
      const json = await res.json();
      if (json.code === 0) {
        Toast.success('密码修改成功');
        formApi?.reset();
      } else {
        Toast.error(json.message || '密码修改失败');
      }
    } catch {
      Toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Title heading={4} className={styles.sectionTitle}>修改密码</Title>
        <Paragraph className={styles.sectionDesc}>
          请输入当前密码和新密码来更新您的登录凭证。
        </Paragraph>
        <Form
          className={styles.form}
          onSubmit={handleSubmit}
          getFormApi={(api: any) => setFormApi(api)}
          labelPosition="top"
        >
          <Form.Input
            field="oldPassword"
            label="当前密码"
            mode="password"
            rules={[{ required: true, message: '请输入当前密码' }]}
            placeholder="输入当前密码"
          />
          <Form.Input
            field="newPassword"
            label="新密码"
            mode="password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6个字符' },
            ]}
            placeholder="输入新密码"
          />
          <Form.Input
            field="confirmPassword"
            label="确认新密码"
            mode="password"
            rules={[{ required: true, message: '请再次输入新密码' }]}
            placeholder="再次输入新密码"
          />
          <Button
            type="primary"
            theme="solid"
            htmlType="submit"
            loading={loading}
            className={styles.submitBtn}
          >
            更新密码
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AccountSettings;
