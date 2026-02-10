import { useState } from 'react';
import { Form, Button, Typography, Notification } from '@douyinfe/semi-ui-19';
import { request } from '../../utils/request';
import styles from './index.module.scss';

const { Title, Paragraph } = Typography;

const AccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formApi, setFormApi] = useState<any>(null);

  const handleSubmit = async (values: Record<string, string>) => {
    if (values.newPassword !== values.confirmPassword) {
      Notification.warning({ title: '提示', content: '两次输入的新密码不一致', duration: 3, theme: 'light' });
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
        Notification.success({ title: '修改成功', content: '密码已更新', duration: 3, theme: 'light' });
        formApi?.reset();
      } else {
        Notification.error({ title: '修改失败', content: json.message || '密码修改失败', duration: 3, theme: 'light' });
      }
    } catch {
      Notification.error({ title: '请求失败', content: '网络错误，请稍后重试', duration: 3, theme: 'light' });
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
