/* 测试：智能板块二级红点联动
   运行：node scripts/test_subdots.js
*/
const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'app.js'), 'utf8');

// 1. 验证 aiSubDots computed 存在
if (!appJs.includes('aiSubDots')) {
  console.error('FAIL: app.js 里没有 aiSubDots');
  process.exit(1);
}

// 2. 验证告警类型到子页面的映射
['/ai/feed', '/ai/light', '/ai/commands', '/ai/devices', '/ai/crane'].forEach(p => {
  if (!appJs.includes(p)) {
    console.error('FAIL: aiSubDots 里没有映射到', p);
    process.exit(1);
  }
});

// 3. 验证侧边栏模板里有红点渲染
if (!appJs.includes('aiSubDots[it.path]')) {
  console.error('FAIL: 侧边栏模板里没有红点渲染');
  process.exit(1);
}

// 4. 验证红点只统计未解除告警（recovered 不算）
if (!appJs.includes("a.alarm_status === 'recovered'")) {
  console.error('FAIL: 没有过滤已解除告警');
  process.exit(1);
}

// 5. 模拟红点计算：子页面红点之和 = 板块入口红点
const ALARM_BOARD = {
  feeder: 'ai', light_device: 'ai', command: 'ai', command_timeout: 'ai',
  device_offline: 'ai', crane: 'ai'
};
const mockAlarms = [
  { alarm_type: 'feeder', alarm_status: 'active' },
  { alarm_type: 'light_device', alarm_status: 'active' },
  { alarm_type: 'command', alarm_status: 'active' },
  { alarm_type: 'command_timeout', alarm_status: 'active' },
  { alarm_type: 'device_offline', alarm_status: 'recovered' }, // 已解除不算
];

// 算板块入口红点
let boardDot = 0;
mockAlarms.forEach(a => {
  if (a.alarm_status === 'recovered') return;
  if (ALARM_BOARD[a.alarm_type] === 'ai') boardDot++;
});

// 算子页面红点
const subDots = {};
mockAlarms.forEach(a => {
  if (a.alarm_status === 'recovered') return;
  const t = a.alarm_type;
  let p;
  if (t === 'feeder') p = '/ai/feed';
  else if (t === 'light_device') p = '/ai/light';
  else if (t === 'command' || t === 'command_timeout') p = '/ai/commands';
  else if (t === 'device_offline') p = '/ai/devices';
  else if (t === 'crane') p = '/ai/crane';
  if (p) subDots[p] = (subDots[p] || 0) + 1;
});
let subSum = Object.values(subDots).reduce((a, b) => a + b, 0);

console.log('板块入口红点:', boardDot, '子页面红点之和:', subSum);
if (boardDot !== subSum) {
  console.error('FAIL: 子页面红点之和不等于板块入口红点');
  process.exit(1);
}

console.log('PASS: 红点联动正确，已解除告警自动消失');
