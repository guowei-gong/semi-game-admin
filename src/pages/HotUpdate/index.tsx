import { useState, useMemo } from 'react';
import {
  Card,
  Button,
  Upload,
  Steps,
  Collapsible,
  Tag,
  Typography,
  Radio,
  RadioGroup,
  Space,
  Banner,
  Table,
} from '@douyinfe/semi-ui-19';
import {
  IconUpload,
  IconTickCircle,
  IconClock,
  IconLoading,
  IconClose,
  IconChevronDown,
  IconChevronRight,
  IconArrowLeft,
  IconFile,
  IconAlertTriangle,
  IconPlay,
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

// 模拟检测结果
interface DetectResult {
  hasSchemaChange: boolean;
  changedTables: string[];
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

const HotUpdate = () => {
  // 当前步骤
  const [currentStep, setCurrentStep] = useState(0);
  // 检测结果
  const [detectResult, setDetectResult] = useState<DetectResult | null>(null);
  // 已上传文件
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  // 检测加载状态
  const [isDetecting, setIsDetecting] = useState(false);
  // 执行状态
  const [isExecuting, setIsExecuting] = useState(false);
  // 执行步骤
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);

  // 根据检测结果确定步骤
  const steps = useMemo(() => {
    const baseSteps = [
      { title: '检测表结构', key: 'detect' },
      { title: '上传配置', key: 'upload' },
    ];

    if (detectResult?.hasSchemaChange) {
      baseSteps.push({ title: '镜像重建', key: 'build' });
    }

    baseSteps.push({ title: '执行更新', key: 'execute' });

    return baseSteps;
  }, [detectResult?.hasSchemaChange]);

  // 模拟检测表结构
  const handleDetect = async () => {
    setIsDetecting(true);

    // 模拟请求延时
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟检测结果
    const result: DetectResult = {
      hasSchemaChange: Math.random() > 0.5, // 随机模拟是否有表结构变更
      changedTables: ['t_item', 't_level'],
      configFiles: ['game_config.json', 'item_config.json', 'level_config.json'],
    };
    setDetectResult(result);
    setIsDetecting(false);
    setCurrentStep(1);
  };

  // 处理文件上传
  const handleUpload = (fileList: any[]) => {
    const files = fileList.map(f => f.name);
    setUploadedFiles(files);
  };

  // 确认上传，进入下一步
  const handleConfirmUpload = () => {
    if (detectResult?.hasSchemaChange) {
      setCurrentStep(2); // 进入镜像重建确认
    } else {
      setCurrentStep(steps.length - 1); // 直接进入执行更新
    }
  };

  // 确认镜像重建
  const handleConfirmBuild = () => {
    setCurrentStep(steps.length - 1);
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
    setCurrentStep(0);
    setDetectResult(null);
    setUploadedFiles([]);
    setExecutionSteps([]);
    setIsExecuting(false);
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

  // 渲染当前步骤内容
  const renderStepContent = () => {
    const stepKey = steps[currentStep]?.key;

    switch (stepKey) {
      case 'detect':
        return (
          <Card className={styles.stepCard}>
            <Title heading={5} style={{ marginBottom: 16 }}>检测表结构变化</Title>

            <div className={styles.lastUpdateInfo}>
              <div className={styles.infoRow}>
                <Text type="tertiary">上次更新时间：</Text>
                <Text>2026-02-02 14:32:18</Text>
              </div>
              <div className={styles.infoRow}>
                <Text type="tertiary">执行人：</Text>
                <Text>张策划</Text>
              </div>
              <div className={styles.infoRow}>
                <Text type="tertiary">Git Commit：</Text>
                <Text code copyable>a1b2c3d4e5f6</Text>
              </div>
            </div>

            <Text type="tertiary" style={{ display: 'block', marginBottom: 24 }}>
              点击下方按钮检测配置文件是否涉及表结构变更，系统将根据检测结果决定更新流程。
            </Text>
            <Button type="primary" theme="solid" loading={isDetecting} onClick={handleDetect}>
              {isDetecting ? '检测中' : '开始检测'}
            </Button>
          </Card>
        );

      case 'upload':
        return (
          <Card className={styles.stepCard}>
            <Title heading={5} style={{ marginBottom: 16 }}>上传配置文件</Title>

            {detectResult && (
              <Banner
                type={detectResult.hasSchemaChange ? 'warning' : 'info'}
                description={
                  detectResult.hasSchemaChange
                    ? `检测到表结构变更（${detectResult.changedTables.join(', ')}），更新时需要重建镜像`
                    : '未检测到表结构变更，可直接热更新配置'
                }
                style={{ marginBottom: 16 }}
                icon={detectResult.hasSchemaChange ? <IconAlertTriangle /> : null}
              />
            )}

            <Upload
              action=""
              accept=".json,.xlsx,.csv"
              multiple
              draggable
              dragMainText="点击上传或拖拽文件到此处"
              dragSubText="支持 JSON、Excel、CSV 格式"
              onChange={({ fileList }) => handleUpload(fileList)}
              style={{ marginBottom: 16 }}
            />

            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>已选择 {uploadedFiles.length} 个文件：</Text>
                <div style={{ marginTop: 8 }}>
                  {uploadedFiles.map((file, index) => (
                    <Tag key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                      <IconFile style={{ marginRight: 4 }} />
                      {file}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <Space>
              <Button theme="outline" icon={<IconArrowLeft />} onClick={() => setCurrentStep(0)}>上一步</Button>
              <Button
                type="primary"
                theme="solid"
                disabled={uploadedFiles.length === 0}
                onClick={handleConfirmUpload}
              >
                下一步
              </Button>
            </Space>
          </Card>
        );

      case 'build':
        return (
          <Card className={styles.stepCard}>
            <Title heading={5} style={{ marginBottom: 16 }}>确认镜像重建</Title>

            <Banner
              type="warning"
              description="由于涉及表结构变更，需要重新构建服务镜像。此过程可能需要几分钟时间。"
              style={{ marginBottom: 16 }}
            />

            <Table
              dataSource={detectResult?.changedTables.map((table, index) => ({
                key: index,
                table,
                action: '结构变更',
              }))}
              columns={[
                { title: '表名', dataIndex: 'table' },
                { title: '变更类型', dataIndex: 'action' },
              ]}
              pagination={false}
              size="small"
              style={{ marginBottom: 16 }}
            />

            <Space>
              <Button theme="outline" icon={<IconArrowLeft />} onClick={() => setCurrentStep(1)}>上一步</Button>
              <Button type="primary" theme="solid" onClick={handleConfirmBuild}>
                确认并继续
              </Button>
            </Space>
          </Card>
        );

      case 'execute':
        return (
          <Card className={styles.stepCard}>
            <Title heading={5} style={{ marginBottom: 16 }}>执行热更新</Title>

            {executionSteps.length === 0 ? (
              <>
                <Banner
                  type="info"
                  description={
                    detectResult?.hasSchemaChange
                      ? '将执行：上传配置 → 镜像重建 → 重启服务'
                      : '将执行：上传配置 → 重启服务'
                  }
                  style={{ marginBottom: 16 }}
                />

                <Space>
                  <Button theme="outline" icon={<IconArrowLeft />} disabled={isExecuting} onClick={() => setCurrentStep(currentStep - 1)}>上一步</Button>
                  <Button type="primary" theme="solid" icon={<IconPlay />} loading={isExecuting} onClick={handleExecute}>
                    {isExecuting ? '执行中...' : '开始热更新'}
                  </Button>
                </Space>
              </>
            ) : (
              <>
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
                  <div style={{ marginTop: 16 }}>
                    <Banner
                      type="success"
                      description="热更新完成！测试服已成功更新。"
                      style={{ marginBottom: 16 }}
                    />
                    <Button type="primary" theme="solid" onClick={handleReset}>开始新的更新</Button>
                  </div>
                )}
              </>
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.stepsCard}>
        <Steps
          type="basic"
          size="small"
          current={currentStep}
        >
          {steps.map((step) => (
            <Steps.Step key={step.key} title={step.title} />
          ))}
        </Steps>
      </Card>

      {renderStepContent()}
    </div>
  );
};

export default HotUpdate;
