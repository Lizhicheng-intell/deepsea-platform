/* 测试：补光页显示"安装位置：水下3m"
   运行：node scripts/test_light_desc.js
*/
const fs = require('fs');
const path = require('path');

const aiJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'pages', 'ai.js'), 'utf8');

// 验证补光页模板里有"安装位置"和"水下 3 m"
const hasInstallLoc = aiJs.includes('<span>安装位置</span><span>水下 3 m</span>');
if (!hasInstallLoc) {
  console.error('FAIL: 补光页模板里没找到"安装位置：水下3m"');
  process.exit(1);
}

// 验证设备状态页里 light 类型 location 覆盖逻辑还在
const hasLocOverride = aiJs.includes("if (d.device_type === 'light') loc = cid + ' · 水下 3 m';");
if (!hasLocOverride) {
  console.error('FAIL: 设备状态页 light location 覆盖逻辑丢了');
  process.exit(1);
}

console.log('PASS: 补光页显示安装位置水下3m，设备台账location同步');
