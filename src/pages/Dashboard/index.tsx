import { Card, Row, Col, Typography, Descriptions } from '@douyinfe/semi-ui-19';
import { IconUser, IconApps, IconActivity, IconCoinMoney } from '@douyinfe/semi-icons';

const { Title } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <Card style={{ height: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: 'var(--semi-color-text-2)', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
      </div>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const stats = [
    { title: '总用户数', value: '12,846', icon: <IconUser size="large" />, color: '#0077FA' },
    { title: '今日活跃', value: '3,254', icon: <IconActivity size="large" />, color: '#00B42A' },
    { title: '游戏场次', value: '8,732', icon: <IconApps size="large" />, color: '#FF7D00' },
    { title: '今日收入', value: '¥28,456', icon: <IconCoinMoney size="large" />, color: '#F53F3F' },
  ];

  return (
    <div>
      <Title heading={4} style={{ marginBottom: 24 }}>仪表盘</Title>

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="系统信息">
            <Descriptions align="left">
              <Descriptions.Item itemKey="服务器状态">正常运行</Descriptions.Item>
              <Descriptions.Item itemKey="系统版本">v1.0.0</Descriptions.Item>
              <Descriptions.Item itemKey="最后更新">2026-02-01</Descriptions.Item>
              <Descriptions.Item itemKey="数据库状态">已连接</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="快速操作">
            <Descriptions align="left">
              <Descriptions.Item itemKey="待处理工单">5 个</Descriptions.Item>
              <Descriptions.Item itemKey="异常账号">2 个</Descriptions.Item>
              <Descriptions.Item itemKey="今日注册">128 人</Descriptions.Item>
              <Descriptions.Item itemKey="在线人数">1,024 人</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
