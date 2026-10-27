/* 测试：设备尺寸对照表已加入配置依据页
   运行：node scripts/test_size_table.js
*/
const fs = require('fs');
const path = require('path');

const aiJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'pages', 'ai.js'), 'utf8');

// 验证有"设备尺寸对照"标题
if (!aiJs.includes('设备尺寸对照')) {
  console.error('FAIL: 没找到设备尺寸对照表');
  process.exit(1);
}

// 验证有厂商名称
['青岛海仪', '深圳瑞芬', '广东恒兴', '深圳洲明'].forEach(v => {
  if (!aiJs.includes(v)) {
    console.error('FAIL: 没找到厂商', v);
    process.exit(1);
  }
});

// 验证有"待确认"标记
if (!aiJs.includes('待确认')) {
  console.error('FAIL: 没找到待确认标记');
  process.exit(1);
}

// 验证水温传感器有真实尺寸（青岛海仪公开资料）
if (!aiJs.includes('230')) {
  console.error('FAIL: 没找到水温传感器尺寸230mm');
  process.exit(1);
}

console.log('PASS: 设备尺寸对照表已加入，厂商核实状态标注完整');
