import { useState } from 'react';
import {
  Card,
  Table,
  Tabs,
  TabPane,
  Typography,
  Tag,
  Button,
  Space,
  Input,
  Select
} from '@douyinfe/semi-ui-19';
import { IconSearch, IconPlus, IconEdit, IconDelete } from '@douyinfe/semi-icons';

const { Title } = Typography;

interface GameItem {
  id: number;
  name: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  stock: number;
  status: 'active' | 'inactive';
}

interface GameLevel {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'hell';
  rewards: string;
  unlockLevel: number;
  status: 'active' | 'inactive';
}

const mockItems: GameItem[] = [
  { id: 1, name: '初级血瓶', type: '消耗品', rarity: 'common', price: 100, stock: 9999, status: 'active' },
  { id: 2, name: '高级血瓶', type: '消耗品', rarity: 'rare', price: 500, stock: 5000, status: 'active' },
  { id: 3, name: '屠龙宝刀', type: '武器', rarity: 'legendary', price: 99999, stock: 10, status: 'active' },
  { id: 4, name: '精灵之弓', type: '武器', rarity: 'epic', price: 25000, stock: 100, status: 'active' },
  { id: 5, name: '复活石', type: '消耗品', rarity: 'epic', price: 10000, stock: 500, status: 'inactive' },
];

const mockLevels: GameLevel[] = [
  { id: 1, name: '新手村', difficulty: 'easy', rewards: '100金币, 初级装备', unlockLevel: 1, status: 'active' },
  { id: 2, name: '黑暗森林', difficulty: 'medium', rewards: '500金币, 稀有装备', unlockLevel: 10, status: 'active' },
  { id: 3, name: '火焰山', difficulty: 'hard', rewards: '2000金币, 史诗装备', unlockLevel: 30, status: 'active' },
  { id: 4, name: '魔王城', difficulty: 'hell', rewards: '10000金币, 传说装备', unlockLevel: 50, status: 'active' },
  { id: 5, name: '隐藏副本', difficulty: 'hell', rewards: '特殊奖励', unlockLevel: 99, status: 'inactive' },
];

const rarityMap = {
  common: { text: '普通', color: 'grey' },
  rare: { text: '稀有', color: 'blue' },
  epic: { text: '史诗', color: 'purple' },
  legendary: { text: '传说', color: 'orange' },
};

const difficultyMap = {
  easy: { text: '简单', color: 'green' },
  medium: { text: '中等', color: 'blue' },
  hard: { text: '困难', color: 'orange' },
  hell: { text: '地狱', color: 'red' },
};

const GameData = () => {
  const [itemSearchText, setItemSearchText] = useState('');
  const [levelSearchText, setLevelSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  const itemColumns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '道具名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type' },
    {
      title: '稀有度',
      dataIndex: 'rarity',
      render: (rarity: keyof typeof rarityMap) => (
        <Tag color={rarityMap[rarity].color}>{rarityMap[rarity].text}</Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (price: number) => `${price.toLocaleString()} 金币`,
      sorter: (a: GameItem, b: GameItem) => a.price - b.price,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      render: (stock: number) => stock.toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'grey'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button theme="borderless" icon={<IconEdit />} />
          <Button theme="borderless" type="danger" icon={<IconDelete />} />
        </Space>
      ),
    },
  ];

  const levelColumns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '关卡名称', dataIndex: 'name' },
    {
      title: '难度',
      dataIndex: 'difficulty',
      render: (difficulty: keyof typeof difficultyMap) => (
        <Tag color={difficultyMap[difficulty].color}>{difficultyMap[difficulty].text}</Tag>
      ),
    },
    { title: '奖励', dataIndex: 'rewards' },
    { title: '解锁等级', dataIndex: 'unlockLevel' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'grey'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button theme="borderless" icon={<IconEdit />} />
          <Button theme="borderless" type="danger" icon={<IconDelete />} />
        </Space>
      ),
    },
  ];

  const filteredItems = mockItems.filter(item => {
    const matchSearch = item.name.includes(itemSearchText);
    const matchType = !selectedType || item.type === selectedType;
    return matchSearch && matchType;
  });

  const filteredLevels = mockLevels.filter(level =>
    level.name.includes(levelSearchText)
  );

  return (
    <div>
      <Title heading={4} style={{ marginBottom: 24 }}>游戏数据</Title>

      <Card>
        <Tabs>
          <TabPane tab="道具管理" itemKey="items">
            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
              <Input
                prefix={<IconSearch />}
                placeholder="搜索道具名称"
                style={{ width: 250 }}
                value={itemSearchText}
                onChange={setItemSearchText}
              />
              <Select
                placeholder="筛选类型"
                style={{ width: 150 }}
                value={selectedType}
                onChange={setSelectedType}
                optionList={[
                  { value: '', label: '全部' },
                  { value: '消耗品', label: '消耗品' },
                  { value: '武器', label: '武器' },
                  { value: '装备', label: '装备' },
                ]}
              />
              <div style={{ flex: 1 }} />
              <Button type="primary" icon={<IconPlus />}>
                添加道具
              </Button>
            </div>
            <Table
              columns={itemColumns}
              dataSource={filteredItems}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: true }}
            />
          </TabPane>

          <TabPane tab="关卡管理" itemKey="levels">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Input
                prefix={<IconSearch />}
                placeholder="搜索关卡名称"
                style={{ width: 250 }}
                value={levelSearchText}
                onChange={setLevelSearchText}
              />
              <Button type="primary" icon={<IconPlus />}>
                添加关卡
              </Button>
            </div>
            <Table
              columns={levelColumns}
              dataSource={filteredLevels}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: true }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default GameData;
