<template>
  <div class="projects-page">
    <header class="topbar">
      <div class="brand">
        <el-icon :size="24" color="#409eff"><Histogram /></el-icon>
        <strong>我的项目</strong>
      </div>
      <div class="account">
        <span>{{ customerName || '客户' }}</span>
        <el-button text type="primary" @click="doLogout">退出</el-button>
      </div>
    </header>

    <main class="list">
      <div v-if="loading" class="state">
        <el-icon class="loading"><Loading /></el-icon> 加载中...
      </div>

      <el-empty v-else-if="!orders.length" description="还没有项目">
        <el-button type="primary" @click="$router.push('/intake')">提交第一个需求</el-button>
      </el-empty>

      <template v-else>
        <div v-for="o in orders" :key="o.id" class="card" @click="open(o.id)">
          <div class="line1">
            <span class="title">{{ o.title }}</span>
            <el-tag size="small" :type="statusMap[o.status]?.type">{{ statusMap[o.status]?.label || o.status }}</el-tag>
          </div>
          <div class="line2">
            <span class="no">{{ o.orderNo }}</span>
            <span v-if="o.deadline" class="dl">截止 {{ o.deadline }}</span>
            <span v-if="o.amount" class="amount">¥{{ o.amount }}</span>
          </div>
          <div class="line3">
            <span class="last">{{ lastLine(o) }}</span>
            <span class="chat"><el-icon><ChatDotRound /></el-icon>{{ msgCount(o) }}</span>
          </div>
        </div>
      </template>
    </main>

    <AppTabBar active="projects" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Histogram, Loading, ChatDotRound } from '@element-plus/icons-vue'
import AppTabBar from '@/components/AppTabBar.vue'
import { listMyOrders, customerName, customerLogout } from '@/mock/store'
import { statusMap } from '@/constants/options'

const router = useRouter()
const orders = ref([])
const loading = ref(true)

function chatItems(o) {
  return (o.timeline || []).filter((t) => t.type === 'message' || t.type === 'reply')
}

function lastLine(o) {
  if (o.lastMessage) {
    const last = o.lastMessage
    const who = last.type === 'message' ? '我' : last.user
    const body = last.content || (last.attachments && last.attachments.length ? '[附件]' : '')
    return `${who}: ${body}`.slice(0, 46)
  }
  const tl = chatItems(o)
  if (!tl.length) return o.requirement ? o.requirement.slice(0, 40) : '暂无沟通'
  const last = tl[tl.length - 1]
  const who = last.type === 'message' ? '我' : last.user
  const body = last.content || (last.attachments && last.attachments.length ? '[附件]' : '')
  return `${who}: ${body}`.slice(0, 46)
}

function msgCount(o) {
  if (o.messageCount !== undefined && o.messageCount !== null) return o.messageCount
  return chatItems(o).length
}

function open(id) {
  router.push('/projects/' + id)
}

function doLogout() {
  customerLogout()
  router.push('/customer-login')
}

async function load() {
  loading.value = true
  try {
    orders.value = (await listMyOrders()) || []
  } catch (e) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.projects-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding-bottom: 64px;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fdfefe;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand strong {
  font-size: 17px;
  color: #303133;
}
.account {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}
.list {
  padding: 12px;
  max-width: 760px;
  margin: 0 auto;
}
.state {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}
.loading {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.card {
  background: #fdfefe;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.card:active {
  transform: scale(0.995);
}
.card:hover {
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
}
.line1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.line2 {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
.line2 .amount {
  color: #e6a23c;
  font-weight: 600;
}
.line3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
  font-size: 13px;
}
.last {
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #c0c4cc;
  flex: 0 0 auto;
}
</style>
