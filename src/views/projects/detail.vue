<template>
  <div class="detail-page">
    <header class="topbar">
      <el-icon class="back" :size="20" @click="$router.push('/projects')"><ArrowLeft /></el-icon>
      <div class="tt">
        <strong>{{ order?.title || '项目详情' }}</strong>
        <span v-if="order">{{ order.orderNo }}</span>
      </div>
      <el-tag v-if="order" size="small" :type="statusMap[order.status]?.type">
        {{ statusMap[order.status]?.label || order.status }}
      </el-tag>
    </header>

    <main ref="scroller" class="scroll">
      <div v-if="loading" class="state"><el-icon class="loading"><Loading /></el-icon> 加载中…</div>

      <template v-else-if="order">
        <!-- 项目信息卡 -->
        <section class="info">
          <div class="info-row"><label>负责团队</label><span>{{ TEAM_NAME }}</span></div>
          <div class="info-row"><label>报价</label><span>¥{{ order.amount || 0 }}</span></div>
          <div class="info-row"><label>优先级</label><span>{{ priorityMap[order.priority]?.label || '-' }}</span></div>
          <div class="info-row"><label>截止日期</label><span>{{ order.deadline || '-' }}</span></div>
          <div class="info-row col"><label>需求描述</label><p>{{ order.requirement || '-' }}</p></div>
          <div v-if="order.attachments && order.attachments.length" class="info-row col">
            <label>需求材料</label>
            <div class="mats">
              <MediaThumb v-for="(m, i) in order.attachments" :key="i" :item="m" :size="76" />
            </div>
          </div>
        </section>

        <div class="chat-title"><span>沟通记录</span><em>老板和员工都会同步看到你的消息</em></div>

        <!-- 聊天消息 -->
        <div class="chat">
          <ChatMessage
            v-for="(t, i) in order.timeline"
            :key="i"
            :item="t"
            :mine="t.type === 'message'"
          />
          <div v-if="!order.timeline || !order.timeline.length" class="empty-chat">
            还没有沟通记录，发条消息和团队聊聊吧 👇
          </div>
        </div>
      </template>
    </main>

    <MessageComposer v-if="order" ref="composer" :sending="sending" @send="onSend" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import MediaThumb from '@/components/MediaThumb.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageComposer from '@/components/MessageComposer.vue'
import { getMyOrder, sendMessage } from '@/mock/store'
import { statusMap, priorityMap, TEAM_NAME } from '@/constants/options'

const route = useRoute()
const id = route.params.id
const order = ref(null)
const loading = ref(true)
const sending = ref(false)
const scroller = ref(null)
const composer = ref(null)
let poller = null

function scrollBottom(smooth = false) {
  nextTick(() => {
    const el = scroller.value
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  })
}

async function load(scroll = true) {
  try {
    const vo = await getMyOrder(id)
    order.value = vo
    if (scroll) scrollBottom()
  } catch (e) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function onSend({ content, attachments }) {
  sending.value = true
  try {
    const vo = await sendMessage(id, content, attachments)
    order.value = vo
    composer.value && composer.value.reset()
    scrollBottom(true)
  } catch (e) {
    ElMessage.error(e.message || '发送失败')
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await load()
  // 轮询团队的新回复（12s），保持近实时
  poller = setInterval(async () => {
    const before = order.value?.timeline?.length || 0
    await load(false)
    const after = order.value?.timeline?.length || 0
    if (after > before) scrollBottom(true)
  }, 12000)
})

onBeforeUnmount(() => {
  if (poller) clearInterval(poller)
})
</script>

<style scoped>
.detail-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}
.topbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 12px 14px;
  border-bottom: 1px solid #ebeef5;
}
.back {
  cursor: pointer;
  color: #606266;
}
.tt {
  flex: 1;
  min-width: 0;
}
.tt strong {
  display: block;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tt span {
  font-size: 12px;
  color: #c0c4cc;
}
.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
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
.info {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
}
.info-row {
  display: flex;
  gap: 10px;
  padding: 6px 0;
  font-size: 14px;
}
.info-row label {
  flex: 0 0 68px;
  color: #909399;
}
.info-row span {
  color: #303133;
}
.info-row.col {
  flex-direction: column;
  gap: 6px;
}
.info-row.col p {
  margin: 0;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
}
.mats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chat-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 18px 4px 4px;
}
.chat-title span {
  font-weight: 600;
  color: #303133;
}
.chat-title em {
  font-style: normal;
  font-size: 12px;
  color: #a8abb2;
}
.chat {
  padding: 4px 2px;
}
.empty-chat {
  text-align: center;
  color: #a8abb2;
  font-size: 13px;
  padding: 30px 0;
}
</style>
