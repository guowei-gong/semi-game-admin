import { useState } from 'react';
import {
  Card,
  Button,
  Collapsible,
  Tag,
  Typography,
  Space,
  Banner,
  Table,
  Tabs,
  TabPane,
  Checkbox,
  List,
  Avatar,
  Toast,
  Input,
  Descriptions,
} from '@douyinfe/semi-ui-19';
import {
  IconTickCircle,
  IconClock,
  IconLoading,
  IconClose,
  IconChevronDown,
  IconChevronRight,
  IconArrowLeft,
  IconAlertTriangle,
  IconPlay,
  IconSearch,
} from '@douyinfe/semi-icons';
import styles from './index.module.scss';

const { Text, Title } = Typography;

type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

interface LogLine {
  time: string;
  content: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

interface ExecutionStep {
  key: string;
  title: string;
  status: ExecutionStatus;
  logs: LogLine[];
  expanded: boolean;
  duration?: string;
}

// 变更项
interface ChangeItem {
  name: string;
  type: 'schema' | 'data'; // schema: 结构变更, data: 数据变更
}

// 模拟检测结果
interface DetectResult {
  hasSchemaChange: boolean;
  changes: ChangeItem[];
  configFiles: string[];
}

// 模拟日志数据
const mockUploadLogs: LogLine[] = [
  { time: '00:00:01', content: '开始上传配置文件...', type: 'info' },
  { time: '00:00:02', content: '检测到 5 个配置文件', type: 'info' },
  { time: '00:00:03', content: '正在校验 game_config.json...', type: 'info' },
  { time: '00:00:04', content: '正在校验 item_config.json...', type: 'info' },
  { time: '00:00:05', content: '正在校验 level_config.json...', type: 'info' },
  { time: '00:00:06', content: '✓ 所有配置文件校验通过', type: 'success' },
  { time: '00:00:07', content: '正在上传到测试服务器...', type: 'info' },
  { time: '00:00:10', content: '✓ 上传完成', type: 'success' },
];

const mockBuildLogs: LogLine[] = [
  { time: '00:00:01', content: '检测到表结构变更，开始镜像重建...', type: 'warning' },
  { time: '00:00:02', content: 'Pulling base image: game-server:latest', type: 'info' },
  { time: '00:00:05', content: 'Step 1/5: FROM game-server:latest', type: 'info' },
  { time: '00:00:06', content: 'Step 2/5: COPY config/ /app/config/', type: 'info' },
  { time: '00:00:07', content: 'Step 3/5: RUN npm run build', type: 'info' },
  { time: '00:00:15', content: 'Building game logic...', type: 'info' },
  { time: '00:00:25', content: 'Compiling schemas...', type: 'info' },
  { time: '00:00:35', content: 'Step 4/5: RUN npm run migrate', type: 'info' },
  { time: '00:00:40', content: 'Running database migrations...', type: 'info' },
  { time: '00:00:45', content: 'Step 5/5: CMD ["npm", "start"]', type: 'info' },
  { time: '00:00:46', content: '✓ 镜像构建完成: game-server:v1.2.3', type: 'success' },
];

const mockRestartLogs: LogLine[] = [
  { time: '00:00:01', content: '正在停止当前服务...', type: 'info' },
  { time: '00:00:03', content: 'Stopping container: game-test-server', type: 'info' },
  { time: '00:00:05', content: '✓ 服务已停止', type: 'success' },
  { time: '00:00:06', content: '正在启动新服务...', type: 'info' },
  { time: '00:00:08', content: 'Starting container with new image...', type: 'info' },
  { time: '00:00:10', content: 'Health check: waiting...', type: 'info' },
  { time: '00:00:15', content: 'Health check: passed', type: 'success' },
  { time: '00:00:16', content: '✓ 服务启动成功，测试服已更新', type: 'success' },
];

// 更新记录数据
const historyData = [
  {
    id: 1,
    title: '配置更新成功',
    time: '2026-02-02 14:32:18',
    executor: '张策划',
    commit: 'a1b2c3d4e5f6',
    status: 'success',
  },
  {
    id: 2,
    title: '配置更新成功',
    time: '2026-02-01 10:15:42',
    executor: '李开发',
    commit: 'b2c3d4e5f6g7',
    status: 'success',
  },
  {
    id: 3,
    title: '配置回滚',
    time: '2026-01-31 16:28:05',
    executor: '王运维',
    commit: 'c3d4e5f6g7h8',
    status: 'rollback',
  },
  {
    id: 4,
    title: '配置更新成功',
    time: '2026-01-30 09:45:33',
    executor: '张策划',
    commit: 'd4e5f6g7h8i9',
    status: 'success',
  },
  {
    id: 5,
    title: '配置更新失败',
    time: '2026-01-29 15:22:11',
    executor: '李开发',
    commit: 'e5f6g7h8i9j0',
    status: 'failed',
  },
];

const HotUpdate = () => {
  // 当前页面: detect | confirm | execute
  const [currentPage, setCurrentPage] = useState<'detect' | 'confirm' | 'execute'>('detect');
  // 检测结果
  const [detectResult, setDetectResult] = useState<DetectResult | null>(null);
  // 检测加载状态
  const [isDetecting, setIsDetecting] = useState(false);
  // 执行状态
  const [isExecuting, setIsExecuting] = useState(false);
  // 执行步骤
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  // 注意事项已读状态
  const [noticeRead, setNoticeRead] = useState(false);
  // 当前激活的 Tab
  const [activeTab, setActiveTab] = useState('history');
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');

  // 过滤后的更新记录
  const filteredHistoryData = searchKeyword
    ? historyData.filter(item =>
        item.title.includes(searchKeyword) ||
        item.executor.includes(searchKeyword) ||
        item.commit.includes(searchKeyword)
      )
    : historyData;

  // 模拟检测表结构
  const handleDetect = async () => {
    // 检查是否已阅读注意事项
    if (!noticeRead) {
      Toast.warning({ content: '请先阅读并确认注意事项', duration: 3 });
      setActiveTab('notice');
      return;
    }

    setIsDetecting(true);

    // 模拟请求延时
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟检测结果
    const hasSchemaChange = Math.random() > 0.5;
    const changes: ChangeItem[] = [
      { name: 't_item', type: hasSchemaChange ? 'schema' : 'data' },
      { name: 't_level', type: 'data' },
      { name: 't_config', type: 'data' },
    ];

    const result: DetectResult = {
      hasSchemaChange,
      changes,
      configFiles: ['game_config.json', 'item_config.json', 'level_config.json'],
    };
    setDetectResult(result);
    setIsDetecting(false);
    setCurrentPage('confirm');
  };

  // 模拟执行步骤
  const simulateExecution = async (
    stepKey: string,
    logs: LogLine[],
    updateSteps: (updater: (prev: ExecutionStep[]) => ExecutionStep[]) => void
  ) => {
    updateSteps(prev => prev.map(s =>
      s.key === stepKey ? { ...s, status: 'running' as ExecutionStatus, expanded: true } : s
    ));

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      updateSteps(prev => prev.map(s =>
        s.key === stepKey ? { ...s, logs: logs.slice(0, i + 1) } : s
      ));
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    updateSteps(prev => prev.map(s =>
      s.key === stepKey ? { ...s, status: 'success' as ExecutionStatus, duration: `${(logs.length * 0.3 + 0.5).toFixed(1)}s` } : s
    ));
  };

  // 开始执行热更新
  const handleExecute = async () => {
    const execSteps: ExecutionStep[] = [
      { key: 'upload', title: '上传配置', status: 'idle', logs: [], expanded: true },
    ];

    if (detectResult?.hasSchemaChange) {
      execSteps.push({ key: 'build', title: '镜像重建', status: 'idle', logs: [], expanded: false });
    }

    execSteps.push({ key: 'restart', title: '重启服务', status: 'idle', logs: [], expanded: false });

    setExecutionSteps(execSteps);
    setIsExecuting(true);

    try {
      await simulateExecution('upload', mockUploadLogs, setExecutionSteps);

      if (detectResult?.hasSchemaChange) {
        await simulateExecution('build', mockBuildLogs, setExecutionSteps);
      }

      await simulateExecution('restart', mockRestartLogs, setExecutionSteps);
    } catch (error) {
      console.error('执行失败:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // 重置流程
  const handleReset = () => {
    setCurrentPage('detect');
    setDetectResult(null);
    setExecutionSteps([]);
    setIsExecuting(false);
    setNoticeRead(false);
  };

  // 切换执行步骤展开状态
  const toggleStepExpand = (stepKey: string) => {
    setExecutionSteps(prev => prev.map(s =>
      s.key === stepKey ? { ...s, expanded: !s.expanded } : s
    ));
  };

  // 获取执行步骤图标
  const getExecutionIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'success':
        return <IconTickCircle style={{ color: 'var(--semi-color-success)' }} />;
      case 'running':
        return <IconLoading spin style={{ color: 'var(--semi-color-primary)' }} />;
      case 'error':
        return <IconClose style={{ color: 'var(--semi-color-danger)' }} />;
      default:
        return <IconClock style={{ color: 'var(--semi-color-text-2)' }} />;
    }
  };

  // 获取日志行样式
  const getLogLineClass = (type?: string) => {
    switch (type) {
      case 'success': return styles.logSuccess;
      case 'error': return styles.logError;
      case 'warning': return styles.logWarning;
      default: return '';
    }
  };

  // 渲染当前页面内容
  const renderPageContent = () => {
    switch (currentPage) {
      case 'detect':
        return (
          <div className={styles.detectContainer}>
            {/* Hero 区域 */}
            <div className={styles.heroSection}>
              <div className={styles.heroContent}>
                <div className={styles.heroLeft}>
                  <Title heading={2} className={styles.heroTitle}>热更新配置</Title>
                  <Text className={styles.heroDesc}>
                    热更新功能支持在线更新游戏配置，无需重启服务即可生效。系统会自动检测表结构变更，
                    如有变更将执行镜像重建流程，确保数据一致性。
                  </Text>
                  <div className={styles.noticeCheckbox}>
                    <Checkbox
                      checked={noticeRead}
                      onChange={(e) => setNoticeRead(e.target.checked)}
                    >
                      <span>我已阅读并了解</span>
                      <a
                        href="#"
                        className={styles.noticeLink}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab('notice');
                        }}
                      >
                        注意事项
                      </a>
                    </Checkbox>
                  </div>
                  <Button
                    type="primary"
                    theme="solid"
                    size="large"
                    loading={isDetecting}
                    onClick={handleDetect}
                    className={styles.heroButton}
                  >
                    开始检测
                  </Button>
                </div>
                <div className={styles.heroRight}>
                  <div className={styles.heroImage}>
                    <div className={styles.mockWindow}>
                      <div className={styles.windowHeader}>
                        <span className={styles.windowDot} />
                        <span className={styles.windowDot} />
                        <span className={styles.windowDot} />
                        <span className={styles.windowTitle}>热更新控制台</span>
                      </div>
                      <div className={styles.windowBody}>
                        <div className={styles.configItem}>
                          <span className={styles.configIcon}>📄</span>
                          <span>game_config.json</span>
                          <Tag size="small" color="green">已同步</Tag>
                        </div>
                        <div className={styles.configItem}>
                          <span className={styles.configIcon}>📄</span>
                          <span>item_config.json</span>
                          <Tag size="small" color="green">已同步</Tag>
                        </div>
                        <div className={styles.configItem}>
                          <span className={styles.configIcon}>📄</span>
                          <span>level_config.json</span>
                          <Tag size="small" color="blue">待更新</Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab 区域 */}
            <div className={styles.tabSection}>
              <Tabs type="line" activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="更新记录" itemKey="history">
                  <div className={styles.historyContent}>
                    <div className={styles.historyToolbar}>
                      <Input
                        prefix={<IconSearch />}
                        placeholder="请输入姓名"
                        value={searchKeyword}
                        onChange={setSearchKeyword}
                        showClear
                        style={{ width: 280 }}
                      />
                    </div>
                    <List
                      dataSource={filteredHistoryData}
                      emptyContent={<div className={styles.emptyContent}>暂无匹配记录</div>}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          header={
                            <Avatar
                              size="default"
                              style={{
                                backgroundColor: item.status === 'success' ? 'var(--semi-color-success)' :
                                  item.status === 'rollback' ? 'var(--semi-color-warning)' : 'var(--semi-color-danger)',
                              }}
                            >
                              {item.status === 'success' ? <IconTickCircle /> :
                                item.status === 'rollback' ? <IconArrowLeft /> : <IconClose />}
                            </Avatar>
                          }
                          main={
                            <div className={styles.historyMain}>
                              <Text strong>{item.title}</Text>
                              <Text type="tertiary">{item.time} · {item.executor} · <Text code>{item.commit}</Text></Text>
                            </div>
                          }
                          extra={
                            <Tag
                              color={item.status === 'success' ? 'green' : item.status === 'rollback' ? 'orange' : 'red'}
                              size="small"
                            >
                              {item.status === 'success' ? '成功' : item.status === 'rollback' ? '回滚' : '失败'}
                            </Tag>
                          }
                        />
                      )}
                    />
                  </div>
                </TabPane>
                <TabPane tab="注意事项" itemKey="notice">
                  <div className={styles.noticeContent}>
                    <div className={styles.noticeSection}>
                      <Title heading={5} className={styles.noticeSectionTitle}>配置审核</Title>
                      <Text className={styles.noticeParagraph}>
                        更新前请确保已完成配置文件的审核，检查数据格式是否正确、字段值是否合理。
                        配置错误可能导致游戏服务异常，影响玩家体验。
                      </Text>
                    </div>

                    <div className={styles.noticeSection}>
                      <Title heading={5} className={styles.noticeSectionTitle}>表结构变更</Title>
                      <Text className={styles.noticeParagraph}>
                        如果配置涉及数据库表结构变更（如新增字段、修改字段类型等），系统将自动触发镜像重建流程。
                        此过程预计耗时 3-5 分钟，期间服务会短暂中断，请合理安排更新时间。
                      </Text>
                    </div>

                    <div className={styles.noticeSection}>
                      <Title heading={5} className={styles.noticeSectionTitle}>更新时机建议</Title>
                      <Text className={styles.noticeParagraph}>
                        建议在业务低峰期执行更新操作，如凌晨或工作日上午。避免在活动期间、服务器高峰时段进行热更新，
                        以减少对在线玩家的影响。如有紧急更新需求，请提前通知运营团队。
                      </Text>
                    </div>

                    <div className={styles.noticeSection}>
                      <Title heading={5} className={styles.noticeSectionTitle}>回滚机制</Title>
                      <Text className={styles.noticeParagraph}>
                        系统支持配置回滚功能，如发现更新后出现问题，可在更新记录中选择历史版本进行回滚。
                        回滚操作会将配置恢复到指定版本的状态，请谨慎操作。
                      </Text>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        );

      case 'confirm': {
        const schemaCount = detectResult?.changes.filter(c => c.type === 'schema').length || 0;
        const dataCount = detectResult?.changes.filter(c => c.type === 'data').length || 0;
        const totalCount = detectResult?.changes.length || 0;

        return (
          <div className={styles.confirmContainer}>
            {/* 警告/信息提示 */}
            {detectResult?.hasSchemaChange ? (
              <Banner
                type="warning"
                icon={<IconAlertTriangle />}
                description="检测到表结构变更，执行更新时需要重建镜像，此过程可能需要几分钟。"
                className={styles.confirmBanner}
              />
            ) : (
              <Banner
                type="success"
                description="仅检测到数据变更，支持热更新，确认后即可执行。"
                className={styles.confirmBanner}
              />
            )}

            {/* 统计卡片 */}
            <div className={styles.statCards}>
              <div className={styles.statCard}>
                <Descriptions
                  data={[{ key: '结构变更', value: String(schemaCount) }]}
                  row
                />
              </div>
              <div className={styles.statCard}>
                <Descriptions
                  data={[{ key: '数据变更', value: String(dataCount) }]}
                  row
                />
              </div>
              <div className={styles.statCard}>
                <Descriptions
                  data={[{ key: '变更总数', value: String(totalCount) }]}
                  row
                />
              </div>
            </div>

            {/* 变更列表 */}
            <div className={styles.confirmBody}>
              <Title heading={5} style={{ marginBottom: 16 }}>变更详情</Title>
              <Table
                dataSource={detectResult?.changes.map((item, index) => ({
                  key: index,
                  name: item.name,
                  type: item.type,
                }))}
                columns={[
                  {
                    title: '表名',
                    dataIndex: 'name',
                  },
                  {
                    title: '变更类型',
                    dataIndex: 'type',
                    width: 140,
                    render: (type: string) => (
                      <Tag color={type === 'schema' ? 'orange' : 'blue'}>
                        {type === 'schema' ? '结构变更' : '数据变更'}
                      </Tag>
                    ),
                  },
                ]}
                pagination={false}
                className={styles.confirmTable}
              />
            </div>

            {/* 底部操作区域 */}
            <div className={styles.footerDivider} />
            <div className={styles.confirmFooter}>
              <Button
                theme="outline"
                icon={<IconArrowLeft />}
                onClick={() => setCurrentPage('detect')}
              >
                返回
              </Button>
              <Button
                type="primary"
                theme="solid"
                size="large"
                icon={<IconPlay />}
                onClick={() => {
                  setCurrentPage('execute');
                  handleExecute();
                }}
              >
                确认并开始热更新
              </Button>
            </div>
          </div>
        );
      }

      case 'execute':
        return (
          <div className={styles.confirmContainer}>
            <div className={styles.executionContainer}>
              {executionSteps.map((step, index) => (
                <div key={step.key} className={styles.executionItem}>
                  <div
                    className={styles.executionHeader}
                    onClick={() => toggleStepExpand(step.key)}
                  >
                    <div className={styles.executionLeft}>
                      {step.expanded ? <IconChevronDown /> : <IconChevronRight />}
                      {getExecutionIcon(step.status)}
                      <span className={styles.executionTitle}>{step.title}</span>
                    </div>
                    <div className={styles.executionRight}>
                      {step.status === 'success' && (
                        <Tag color="green" size="small">{step.duration}</Tag>
                      )}
                      {step.status === 'running' && (
                        <Tag color="blue" size="small">运行中</Tag>
                      )}
                    </div>
                  </div>
                  <Collapsible isOpen={step.expanded}>
                    <div className={styles.logContainer}>
                      {step.logs.length === 0 ? (
                        <div className={styles.logEmpty}>等待执行...</div>
                      ) : (
                        step.logs.map((log, logIndex) => (
                          <div
                            key={logIndex}
                            className={`${styles.logLine} ${getLogLineClass(log.type)}`}
                          >
                            <span className={styles.logTime}>{log.time}</span>
                            <span className={styles.logContent}>{log.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </Collapsible>
                  {index < executionSteps.length - 1 && <div className={styles.executionDivider} />}
                </div>
              ))}
            </div>

            {!isExecuting && executionSteps.every(s => s.status === 'success') && (
              <Banner
                type="success"
                description="热更新完成！测试服已成功更新。"
              />
            )}

            {/* 底部操作区域 */}
            <div className={styles.footerDivider} />
            <div className={styles.confirmFooter}>
              <Button
                theme="outline"
                icon={<IconArrowLeft />}
                disabled={isExecuting}
                onClick={() => setCurrentPage('confirm')}
              >
                返回
              </Button>
              {!isExecuting && executionSteps.every(s => s.status === 'success') ? (
                <Button type="primary" theme="solid" size="large" onClick={handleReset}>
                  开始新的更新
                </Button>
              ) : (
                <Button type="primary" theme="solid" size="large" loading={isExecuting} disabled>
                  执行中...
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {renderPageContent()}
    </div>
  );
};

export default HotUpdate;
