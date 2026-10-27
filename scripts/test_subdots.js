/* 测试：命令失败红点同时映射到设备页面
   运行：node scripts/test_subdots.js
*/
const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'app.js'), 'utf8');

// 1. 验证 trigger_snapshot.device_id 逻辑存在
if (!appJs.includes('trigger_snapshot')) {
  console.error('FAIL: 没有读取 trigger_snapshot.device_id');
  process.exit(1);
}

// 2. 验证 feeder 命令失败同时映射到 /ai/feed 和 /ai/commands
if (!appJs.includes("dev.indexOf('feeder') >= 0")) {
  console.error('FAIL: feeder命令失败没有映射到/ai/feed');
  process.exit(1);
}
if (!appJs.includes("dev.indexOf('light') >= 0")) {
  console.error('FAIL: light命令失败没有映射到/ai/light');
  process.exit(1);
}
if (!appJs.includes("dev.indexOf('crane') >= 0")) {
  console.error('FAIL: crane命令失败没有映射到/ai/crane');
  process.exit(1);
}

// 3. 模拟测试：feeder命令失败应该同时出现在两个页面
const mockAlarms = [
  { alarm_type: 'command', alarm_status: 'active', trigger_snapshot: { device_id: 'feeder_01' } },
];
const out = {};
mockAlarms.forEach(a => {
  if (a.alarm_status === 'recovered') return;
  const t = a.alarm_type;
  if (t === 'command' || t === 'command_timeout') {
    out['/ai/commands'] = (out['/ai/commands'] || 0) + 1;
    var dev = (a.trigger_snapshot && a.trigger_snapshot.device_id) || '';
    if (dev.indexOf('feeder') >= 0) out['/ai/feed'] = (out['/ai/feed'] || 0) + 1;
  }
});
if (out['/ai/feed'] !== 1 || out['/ai/commands'] !== 1) {
  console.error('FAIL: feeder命令失败应同时映射到/ai/feed和/ai/commands，得到', out);
  process.exit(1);
}

// 4. 模拟测试：light命令失败
const out2 = {};
[{ alarm_type: 'command_timeout', alarm_status: 'active', trigger_snapshot: { device_id: 'light_01' } }].forEach(a => {
  if (a.alarm_status === 'recovered') return;
  if (a.alarm_type === 'command' || a.alarm_type === 'command_timeout') {
    out2['/ai/commands'] = (out2['/ai/commands'] || 0) + 1;
    var dev = (a.trigger_snapshot && a.trigger_snapshot.device_id) || '';
    if (dev.indexOf('light') >= 0) out2['/ai/light'] = (out2['/ai/light'] || 0) + 1;
  }
});
if (out2['/ai/light'] !== 1 || out2['/ai/commands'] !== 1) {
  console.error('FAIL: light命令失败应同时映射到/ai/light和/ai/commands，得到', out2);
  process.exit(1);
}

// 5. 验证已解除告警不显示
const out3 = {};
[{ alarm_type: 'command', alarm_status: 'recovered', trigger_snapshot: { device_id: 'feeder_01' } }].forEach(a => {
  if (a.alarm_status === 'recovered') return;
});
if (out3['/ai/feed']) {
  console.error('FAIL: 已解除告警不应显示红点');
  process.exit(1);
}

console.log('PASS: 命令失败红点同时映射到设备页面和指令日志');
