import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  Collapsible,
  Tag,
  Typography,
  Banner,
  Table,
  Tabs,
  TabPane,
  Checkbox,
  List,
  Avatar,
  Notification,
  Input,
  Descriptions,
  Modal,
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
import { request } from '../../utils/request';
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

// 预检查结果
interface PreCheckResult {
  canExecute: boolean;
  lockedBy?: string;    // 占用人姓名
  lockedAt?: string;    // 占用开始时间
}

// 检测结果
interface DetectResult {
  hasSchemaChange: boolean;
  changes: ChangeItem[];
  configFiles: string[];
}

// 更新记录项
interface HistoryItem {
  id: number;
  title: string;
  time: string;
  executor: string;
  commit: string;
  status: 'success' | 'rollback' | 'failed';
}

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
  // 预检查加载状态
  const [isPreChecking, setIsPreChecking] = useState(false);
  // 更新记录
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // 日志容器 refs，用于自动滚动
  const logContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // 轮询定时器
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 当前执行 ID
  const [executionId, setExecutionId] = useState<string | null>(null);

  // 加载更新记录
  const fetchHistory = useCallback(async (keyword?: string) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      params.set('page', '1');
      params.set('pageSize', '20');
      const res = await request(`/api/hot-update/history?${params}`);
      const json = await res.json();
      if (json.code === 0) {
        setHistoryData(json.data.list);
      }
    } catch {
      Notification.error({ title: '加载失败', content: '加载更新记录失败', duration: 3, theme: 'light' });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // 初始加载 & 搜索关键词变化时加载
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory(searchKeyword || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, fetchHistory]);

  // 日志更新时自动滚动到底部
  useEffect(() => {
    for (const step of executionSteps) {
      if (step.logs.length > 0 && step.expanded) {
        const el = logContainerRefs.current[step.key];
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }
    }
  }, [executionSteps]);

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // 检测配置变更
  const handleDetect = async () => {
    if (!noticeRead) {
      Notification.warning({ title: '提示', content: '请先阅读并确认注意事项', duration: 3, theme: 'light' });
      setActiveTab('notice');
      return;
    }

    setIsDetecting(true);
    try {
      const res = await request('/api/hot-update/detect', { method: 'POST' });
      const json = await res.json();
      if (json.code === 0) {
        setDetectResult(json.data);
        setCurrentPage('confirm');
      } else if (json.code === 1002) {
        Notification.info({ title: '检测完成', content: json.message || '当前无待更新的配置', duration: 5, theme: 'light' });
      } else {
        Notification.error({ title: '检测失败', content: json.message || '检测失败', duration: 3, theme: 'light' });
      }
    } catch {
      Notification.error({ title: '请求失败', content: '检测请求失败，请检查网络连接', duration: 3, theme: 'light' });
    } finally {
      setIsDetecting(false);
    }
  };

  // 轮询执行状态
  const startPolling = (execId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const poll = async () => {
      try {
        const res = await request(`/api/hot-update/executions/${execId}`);
        const json = await res.json();
        if (json.code !== 0) return;

        const data = json.data;
        const remoteSteps: ExecutionStep[] = data.steps.map((s: ExecutionStep) => ({
          key: s.key,
          title: s.title,
          status: s.status,
          duration: s.duration ?? undefined,
          logs: s.logs ?? [],
          expanded: s.status === 'running' || s.status === 'error',
        }));
        setExecutionSteps(remoteSteps);

        if (data.status === 'success' || data.status === 'error') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setIsExecuting(false);
          if (data.status === 'success') {
            fetchHistory();
          }
        }
      } catch {
        // 轮询失败时静默重试
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 1500);
  };

  // 预检查：验证当前是否可以执行热更新
  const handlePreCheck = async (): Promise<boolean> => {
    setIsPreChecking(true);
    try {
      const res = await request('/api/hot-update/pre-check', { method: 'POST' });
      const json = await res.json();
      if (json.code !== 0) {
        Notification.error({ title: '预检查失败', content: json.message || '预检查失败', duration: 3, theme: 'light' });
        return false;
      }

      const result: PreCheckResult = json.data;
      if (!result.canExecute) {
        Modal.warning({
          title: '无法执行热更新',
          content: (
            <div>
              <p>当前有其他管理员正在执行热更新操作，请稍后再试。</p>
              <Descriptions
                data={[
                  { key: '占用人', value: result.lockedBy },
                  { key: '开始时间', value: result.lockedAt },
                ]}
                style={{ marginTop: 12 }}
              />
            </div>
          ),
          okText: '我知道了',
        });
        return false;
      }
      return true;
    } catch {
      Notification.error({ title: '请求失败', content: '预检查请求失败，请重试', duration: 3, theme: 'light' });
      return false;
    } finally {
      setIsPreChecking(false);
    }
  };

  // 确认并开始热更新（先预检查，再执行）
  const handleConfirmAndExecute = async () => {
    const canProceed = await handlePreCheck();
    if (!canProceed) return;
    setCurrentPage('execute');
    handleExecute();
  };

  // 开始执行热更新
  const handleExecute = async () => {
    if (!detectResult) return;

    setExecutionSteps([]);
    setIsExecuting(true);

    try {
      const res = await request('/api/hot-update/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: detectResult.changes,
          configFiles: detectResult.configFiles,
          hasSchemaChange: detectResult.hasSchemaChange,
        }),
      });
      const json = await res.json();
      if (json.code === 0) {
        const { executionId: execId, steps } = json.data;
        setExecutionId(execId);
        // 用后端返回的步骤初始化列表
        setExecutionSteps(
          (steps as string[]).map((key: string, i: number) => ({
            key,
            title: { upload: '上传配置', build: '镜像重建', restart: '重启服务' }[key] || key,
            status: 'idle' as ExecutionStatus,
            logs: [],
            expanded: i === 0,
          }))
        );
        startPolling(execId);
      } else {
        Notification.error({ title: '执行失败', content: json.message || '执行请求失败', duration: 3, theme: 'light' });
        setIsExecuting(false);
      }
    } catch {
      Notification.error({ title: '请求失败', content: '执行请求失败，请检查网络连接', duration: 3, theme: 'light' });
      setIsExecuting(false);
    }
  };

  // 重置流程
  const handleReset = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setExecutionId(null);
    setCurrentPage('detect');
    setDetectResult(null);
    setExecutionSteps([]);
    setIsExecuting(false);
    setNoticeRead(false);
    fetchHistory();
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
                      loading={historyLoading}
                      dataSource={historyData}
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
              {executionId ? (
                <Button
                  type="primary"
                  theme="solid"
                  size="large"
                  onClick={() => setCurrentPage('execute')}
                >
                  查看运行结果
                </Button>
              ) : (
                <Button
                  type="primary"
                  theme="solid"
                  size="large"
                  icon={<IconPlay />}
                  loading={isPreChecking}
                  onClick={handleConfirmAndExecute}
                >
                  确认并开始热更新
                </Button>
              )}
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
                    <div
                      className={styles.logContainer}
                      ref={(el) => { logContainerRefs.current[step.key] = el; }}
                    >
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

            {!isExecuting && executionSteps.some(s => s.status === 'error') && (
              <Banner
                type="danger"
                description="热更新执行失败，请查看日志排查问题。"
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
              {isExecuting ? (
                <Button type="primary" theme="solid" size="large" loading disabled>
                  执行中...
                </Button>
              ) : executionSteps.some(s => s.status === 'error') ? (
                <Button type="primary" theme="solid" size="large" onClick={handleReset}>
                  重新开始
                </Button>
              ) : executionSteps.every(s => s.status === 'success') ? (
                <Button type="primary" theme="solid" size="large" onClick={handleReset}>
                  开始新的更新
                </Button>
              ) : (
                <Button type="primary" theme="solid" size="large" disabled>
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
