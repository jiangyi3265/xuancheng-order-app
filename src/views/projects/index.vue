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

      <div v-else-if="loadError && !orders.length" class="state error-state">
        <strong>项目暂时没有加载出来</strong>
        <span>{{ loadError }}</span>
        <el-button type="primary" :icon="Refresh" @click="load(true)">重新加载</el-button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Histogram, Loading, ChatDotRound, Refresh } from '@element-plus/icons-vue'
import AppTabBar from '@/components/AppTabBar.vue'
import { listMyOrders, customerName, customerLogout } from '@/mock/store'
import { statusMap } from '@/constants/options'

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const loadError = ref('')
let poller = null

function chatItems(o) {
  return (o.timeline || []).filter((t) => t.type === 'message' || t.type === 'reply')
}

function lastLine(o) {
  if (o.lastMessage) {
    const last = o.lastMessage
    const who = last.type === 'message' ? '我' : last.user
    const body = last.content || (last.hasAttachments || (last.attachments && last.attachments.length) ? '[附件]' : '')
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

async function load(initial = false) {
  if (initial || !orders.value.length) loading.value = true
  loadError.value = ''
  try {
    orders.value = (await listMyOrders()) || []
  } catch (e) {
    loadError.value = e.message || '网络连接失败，请稍后重试'
    if (orders.value.length) ElMessage.warning(loadError.value)
  } finally {
    loading.value = false
  }
}

function refreshWhenVisible() {
  if (document.visibilityState === 'visible') load(false)
}

onMounted(() => {
  load(true)
  poller = setInterval(refreshWhenVisible, 15000)
  window.addEventListener('focus', refreshWhenVisible)
  document.addEventListener('visibilitychange', refreshWhenVisible)
})

onBeforeUnmount(() => {
  if (poller) clearInterval(poller)
  window.removeEventListener('focus', refreshWhenVisible)
  document.removeEventListener('visibilitychange', refreshWhenVisible)
})
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
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.error-state strong {
  color: #303133;
  font-size: 16px;
}
.error-state span {
  color: #909399;
  font-size: 13px;
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
