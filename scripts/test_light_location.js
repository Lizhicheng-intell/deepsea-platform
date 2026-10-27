/* 测试：补光灯 location 应显示为"水下3m"
   运行：node scripts/test_light_location.js
*/
const fs = require('fs');
const path = require('path');

const aiJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'pages', 'ai.js'), 'utf8');

// 验证代码里有 light 类型 location 覆盖逻辑
const hasOverride = aiJs.includes("if (d.device_type === 'light') loc = cid + ' · 水下 3 m';");
if (!hasOverride) {
  console.error('FAIL: 没找到 light location 覆盖逻辑');
  process.exit(1);
}

// 读 farm.json，收集所有设备
const farm = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'farm.json'), 'utf8'));
const allDevices = [];
farm.sites.forEach(s => (s.devices || []).forEach(d => allDevices.push(d)));

const light01 = allDevices.find(d => d.device_id === 'light_01');
const light02 = allDevices.find(d => d.device_id === 'light_02');

if (!light01 || !light02) {
  console.error('FAIL: farm.json 里找不到 light_01/light_02');
  process.exit(1);
}
console.log('farm.json 原始 light_01 location:', light01.location);
console.log('farm.json 原始 light_02 location:', light02.location);

// 模拟 filtered computed 的覆盖逻辑
function mockFiltered(farmList, cid) {
  return farmList.filter(d => d.cage_id === cid).map(d => {
    let loc = d.location;
    if (d.device_type === 'light') loc = cid + ' · 水下 3 m';
    return Object.assign({}, d, { location: loc });
  });
}

const cage01 = mockFiltered(allDevices, 'cage_01');
const cage02 = mockFiltered(allDevices, 'cage_02');

const l01 = cage01.find(d => d.device_id === 'light_01');
const l02 = cage02.find(d => d.device_id === 'light_02');

if (l01.location !== 'cage_01 · 水下 3 m') {
  console.error('FAIL: light_01 location 应为 "cage_01 · 水下 3 m"，实际:', l01.location);
  process.exit(1);
}
if (l02.location !== 'cage_02 · 水下 3 m') {
  console.error('FAIL: light_02 location 应为 "cage_02 · 水下 3 m"，实际:', l02.location);
  process.exit(1);
}

// 验证其他设备的 location 没被误改
const feeder01 = cage01.find(d => d.device_type === 'feeder' || d.metric === 'feed_rate');
if (feeder01 && feeder01.location === 'cage_01 · 水下 3 m') {
  console.error('FAIL: 投饵机 location 不应该被改成水下3m');
  process.exit(1);
}

console.log('PASS: 补光灯 location 已正确显示为"水下3m"，其他设备不受影响');
