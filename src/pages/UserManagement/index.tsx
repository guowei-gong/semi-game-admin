import { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Avatar,
  Popconfirm,
  Toast,
  Banner
} from '@douyinfe/semi-ui-19';
import { IconSearch, IconPlus, IconDelete, IconEdit } from '@douyinfe/semi-icons';
import styles from './index.module.scss';

interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  status: 'active' | 'banned' | 'inactive';
  level: number;
  coins: number;
  registerTime: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: 1, username: 'player001', nickname: '王者玩家', email: 'player001@game.com', status: 'active', level: 58, coins: 12500, registerTime: '2025-06-15', lastLogin: '2026-02-01' },
  { id: 2, username: 'player002', nickname: '快乐游戏', email: 'player002@game.com', status: 'active', level: 32, coins: 5800, registerTime: '2025-08-20', lastLogin: '2026-01-30' },
  { id: 3, username: 'player003', nickname: '游戏达人', email: 'player003@game.com', status: 'banned', level: 45, coins: 0, registerTime: '2025-05-10', lastLogin: '2026-01-15' },
  { id: 4, username: 'player004', nickname: '新手小白', email: 'player004@game.com', status: 'inactive', level: 5, coins: 200, registerTime: '2026-01-20', lastLogin: '2026-01-22' },
  { id: 5, username: 'player005', nickname: '氪金大佬', email: 'player005@game.com', status: 'active', level: 99, coins: 999999, registerTime: '2024-12-01', lastLogin: '2026-02-01' },
];

const statusMap = {
  active: { text: '正常', color: 'green' },
  banned: { text: '封禁', color: 'red' },
  inactive: { text: '未激活', color: 'grey' },
};

const UserManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [loading] = useState(false);
  const [data] = useState<User[]>(mockUsers);

  const filteredData = data.filter(
    user =>
      user.username.includes(searchText) ||
      user.nickname.includes(searchText) ||
      user.email.includes(searchText)
  );

  const handleBan = (user: User) => {
    Toast.success(`用户 ${user.username} 已被封禁`);
  };

  const handleEdit = (user: User) => {
    Toast.info(`编辑用户: ${user.username}`);
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      render: (_: string, record: User) => (
        <Space>
          <Avatar size="small" color="blue">{record.nickname[0]}</Avatar>
          <div>
            <div>{record.nickname}</div>
            <div style={{ fontSize: 12, color: 'var(--semi-color-text-2)' }}>{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '等级',
      dataIndex: 'level',
      sorter: (a: User, b: User) => a.level - b.level,
    },
    {
      title: '金币',
      dataIndex: 'coins',
      render: (coins: number) => coins.toLocaleString(),
      sorter: (a: User, b: User) => a.coins - b.coins,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      sorter: (a: User, b: User) => new Date(a.registerTime).getTime() - new Date(b.registerTime).getTime(),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
    },
    {
      title: '操作',
      render: (_: unknown, record: User) => (
        <Space>
          <Button
            theme="borderless"
            icon={<IconEdit />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认封禁该用户？"
            onConfirm={() => handleBan(record)}
          >
            <Button
              theme="borderless"
              type="danger"
              icon={<IconDelete />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Banner type="info" description="当前页面为测试布局界面，所有数据均为模拟数据，不代表真实业务数据。" closeIcon={null} style={{ marginBottom: 16 }} />
      <div className={styles.toolbar}>
        <Input
          prefix={<IconSearch />}
          placeholder="搜索用户名、昵称或邮箱"
          style={{ width: 300 }}
          value={searchText}
          onChange={setSearchText}
          showClear
        />
        <Button type="primary" theme="solid" icon={<IconPlus />}>
          添加用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: true,
          showSizeChanger: true,
        }}
        className={styles.table}
      />
    </div>
  );
};

export default UserManagement;
