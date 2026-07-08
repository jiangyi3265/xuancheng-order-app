<template>
  <nav class="tabbar">
    <div class="tab" :class="{ active: active === 'projects' }" @click="go('/projects')">
      <el-icon :size="20"><List /></el-icon>
      <span>我的项目</span>
    </div>
    <div class="tab" :class="{ active: active === 'intake' }" @click="go('/intake')">
      <el-icon :size="20"><Plus /></el-icon>
      <span>提交需求</span>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { List, Plus } from '@element-plus/icons-vue'

defineProps({ active: { type: String, default: 'projects' } })
const router = useRouter()
function go(path) {
  router.push(path)
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  background: #fff;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 0 9px;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s;
}
.tab.active {
  color: #409eff;
}
</style>
