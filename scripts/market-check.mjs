import {validateMarket} from './market-common.mjs';
try {
  const {errors,warnings,files}=await validateMarket(process.cwd());
  console.log(`市场本地检查：${files.length} 个公开文件；${errors.length} 项问题。`);
  for (const warning of warnings) console.log(`待发布：${warning}`);
  for (const error of errors) console.error(error);
  process.exitCode=errors.length?1:0;
} catch(error) {console.error(`市场检查未完成：${error.message}`);process.exitCode=1;}
