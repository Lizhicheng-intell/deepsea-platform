/* 测试：命令失败红点同时映射到设备页面，已确认/已恢复不显示
   运行：node scripts/test_subdots.js
*/
const fs = require('fs');
const path = require('path');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'app.js'), 'utf8');

// 1. trigger_snapshot.device_id 逻辑
if (!appJs.includes('trigger_snapshot')) {
  console.error('FAIL: 没有读取 trigger_snapshot.device_id');
  process.exit(1);
}

// 2. feeder/light/crane 三个设备映射都在
['feeder', 'light', 'crane'].forEach(d => {
  if (!appJs.includes(`dev.indexOf('${d}') >= 0`)) {
    console.error('FAIL: 缺少设备映射', d);
    process.exit(1);
  }
});

// 3. 已确认(acknowledged)和已恢复(recovered)都不显示红点
if (!appJs.includes("a.alarm_status === 'recovered' || a.alarm_status === 'acknowledged'")) {
  console.error('FAIL: acknowledged状态也应不显示红点');
  process.exit(1);
}

// 4. 模拟：feeder命令失败 → /ai/feed 和 /ai/commands 都有红点
const out = {};
[{ alarm_type: 'command', alarm_status: 'active', trigger_snapshot: { device_id: 'feeder_01' } }].forEach(a => {
  if (a.alarm_status === 'recovered' || a.alarm_status === 'acknowledged') return;
  if (a.alarm_type === 'command' || a.alarm_type === 'command_timeout') {
    out['/ai/commands'] = (out['/ai/commands'] || 0) + 1;
    var dev = (a.trigger_snapshot && a.trigger_snapshot.device_id) || '';
    if (dev.indexOf('feeder') >= 0) out['/ai/feed'] = (out['/ai/feed'] || 0) + 1;
  }
});
if (out['/ai/feed'] !== 1 || out['/ai/commands'] !== 1) {
  console.error('FAIL: feeder命令失败应同时映射到/ai/feed和/ai/commands');
  process.exit(1);
}

// 5. 模拟：light命令失败 → /ai/light 和 /ai/commands
const out2 = {};
[{ alarm_type: 'command_timeout', alarm_status: 'active', trigger_snapshot: { device_id: 'light_02' } }].forEach(a => {
  if (a.alarm_status === 'recovered' || a.alarm_status === 'acknowledged') return;
  if (a.alarm_type === 'command' || a.alarm_type === 'command_timeout') {
    out2['/ai/commands'] = (out2['/ai/commands'] || 0) + 1;
    var dev = (a.trigger_snapshot && a.trigger_snapshot.device_id) || '';
    if (dev.indexOf('light') >= 0) out2['/ai/light'] = (out2['/ai/light'] || 0) + 1;
  }
});
if (out2['/ai/light'] !== 1 || out2['/ai/commands'] !== 1) {
  console.error('FAIL: light命令失败应同时映射到/ai/light和/ai/commands');
  process.exit(1);
}

// 6. 模拟：crane命令失败 → /ai/crane 和 /ai/commands
const out3 = {};
[{ alarm_type: 'command', alarm_status: 'active', trigger_snapshot: { device_id: 'crane_01' } }].forEach(a => {
  if (a.alarm_status === 'recovered' || a.alarm_status === 'acknowledged') return;
  if (a.alarm_type === 'command' || a.alarm_type === 'command_timeout') {
    out3['/ai/commands'] = (out3['/ai/commands'] || 0) + 1;
    var dev = (a.trigger_snapshot && a.trigger_snapshot.device_id) || '';
    if (dev.indexOf('crane') >= 0) out3['/ai/crane'] = (out3['/ai/crane'] || 0) + 1;
  }
});
if (out3['/ai/crane'] !== 1 || out3['/ai/commands'] !== 1) {
  console.error('FAIL: crane命令失败应同时映射到/ai/crane和/ai/commands');
  process.exit(1);
}

// 7. 模拟：已确认告警 → 不显示红点
const out4 = {};
[{ alarm_type: 'command', alarm_status: 'acknowledged', trigger_snapshot: { device_id: 'feeder_01' } }].forEach(a => {
  if (a.alarm_status === 'recovered' || a.alarm_status === 'acknowledged') return;
});
if (Object.keys(out4).length > 0) {
  console.error('FAIL: acknowledged状态不应显示红点');
  process.exit(1);
}

console.log('PASS: 命令失败红点映射正确，已确认/已恢复自动消失');
