/* 测试：设备尺寸对照表
   运行：node scripts/test_size_table.js
*/
const fs = require('fs');
const path = require('path');
const aiJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'pages', 'ai.js'), 'utf8');

// 1. 尺寸对照表标题存在
if (!aiJs.includes('设备尺寸对照')) {
  console.error('FAIL: 没有设备尺寸对照表标题');
  process.exit(1);
}

// 2. 7行设备都在
const devices = ['水温传感器', '溶解氧传感器', '倾角传感器', '锚链张力传感器', '自动投饵机', '补光灯具', '网衣绞车'];
for (const d of devices) {
  if (!aiJs.includes(d)) {
    console.error('FAIL: 缺少设备', d);
    process.exit(1);
  }
}

// 3. 厂商信息
const vendors = ['青岛海仪', '深圳瑞芬', '广东恒兴', '深圳洲明'];
for (const v of vendors) {
  if (!aiJs.includes(v)) {
    console.error('FAIL: 缺少厂商', v);
    process.exit(1);
  }
}

// 4. 核实状态标注
if (!aiJs.includes('已核实')) {
  console.error('FAIL: 没有已核实标注');
  process.exit(1);
}
if (!aiJs.includes('待确认')) {
  console.error('FAIL: 没有待确认标注');
  process.exit(1);
}

// 5. 水温传感器尺寸是青岛海仪公开资料
if (!aiJs.includes('230xØ40')) {
  console.error('FAIL: 水温传感器尺寸不对');
  process.exit(1);
}

console.log('PASS: 设备尺寸对照表完整');
