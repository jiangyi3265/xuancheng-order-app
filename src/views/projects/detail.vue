<template>
  <div class="detail-page">
    <header class="topbar">
      <el-icon class="back" :size="20" @click="router.push('/projects')"><ArrowLeft /></el-icon>
      <div class="tt">
        <strong>{{ order?.title || '项目详情' }}</strong>
        <span v-if="order">{{ order.orderNo }}</span>
      </div>
      <el-tag v-if="order" size="small" :type="statusMap[order.status]?.type">
        {{ statusMap[order.status]?.label || order.status }}
      </el-tag>
      <el-button
        v-if="order && syncState === 'reconnecting'"
        text
        type="warning"
        :icon="Refresh"
        :loading="syncing"
        @click="syncNow"
      >重新连接</el-button>
      <el-button v-if="order" text type="danger" @click="removeOrder">删除</el-button>
    </header>

    <main ref="scroller" class="scroll">
      <div v-if="loading" class="state"><el-icon class="loading"><Loading /></el-icon> 加载中...</div>

      <div v-else-if="loadError && !order" class="state error-state">
        <strong>项目暂时没有打开</strong>
        <span>{{ loadError }}</span>
        <div>
          <el-button :icon="ArrowLeft" @click="router.push('/projects')">返回项目</el-button>
          <el-button type="primary" :icon="Refresh" @click="load(true)">重新加载</el-button>
        </div>
      </div>

      <template v-else-if="order">
        <section class="bug-section" :class="{ 'is-open': bugPanelOpen }">
          <div class="bug-head">
            <button type="button" class="bug-summary" @click="toggleBugPanel">
              <strong>Bug 清单</strong>
              <span>{{ bugItems.length }} 条</span>
            </button>
            <div class="bug-head-actions">
              <el-button size="small" type="primary" plain :icon="CirclePlus" @click="openBugCreate">
                快速创建 Bug
              </el-button>
              <el-button
                size="small"
                text
                type="primary"
                :icon="bugPanelOpen ? ArrowUp : ArrowDown"
                @click="toggleBugPanel"
              >
                {{ bugPanelOpen ? '收起' : '展开' }}
              </el-button>
            </div>
          </div>

          <transition name="bug-panel">
            <div v-if="bugPanelOpen" class="bug-panel thin-scroll">
              <div v-if="bugCreateOpen" class="bug-form">
                <el-input
                  v-model="bugText"
                  type="textarea"
                  :rows="3"
                  resize="none"
                  placeholder="写 Bug 说明，可以直接粘贴截图"
                />
                <AttachmentUploader v-model="bugFiles" :limit="6" class="bug-upload" />
                <el-button type="primary" :loading="bugSubmitting" @click="submitBug">创建 Bug</el-button>
              </div>

              <div class="bug-list">
                <div v-for="bug in bugItems" :key="bug.id" class="bug-item" :class="{ 'is-resolved': isBugResolved(bug) }">
                  <div class="bug-body">
                    <p>{{ bug.content || '只有附件' }}</p>
                    <AttachmentView v-if="bug.attachments && bug.attachments.length" :items="bug.attachments" :size="72" />
                    <div class="bug-meta">{{ bug.createdBy || '客户' }} · {{ bug.time }}</div>

                    <div v-if="bug.updates && bug.updates.length" class="bug-updates">
                      <div v-for="u in bug.updates" :key="u.id" class="bug-update">
                        <div class="update-meta">追加 QA · {{ u.createdBy || '客户' }} · {{ u.time }}</div>
                        <p>{{ u.content || '只有附件' }}</p>
                        <AttachmentView v-if="u.attachments && u.attachments.length" :items="u.attachments" :size="64" />
                      </div>
                    </div>

                    <div v-if="activeUpdateBugId === bug.id" class="bug-update-form">
                      <el-input
                        v-model="updateText"
                        type="textarea"
                        :rows="2"
                        resize="none"
                        placeholder="补充新的 QA / 变更说明，可以粘贴截图"
                      />
                      <AttachmentUploader v-model="updateFiles" :limit="6" class="bug-upload" />
                      <el-button type="primary" :loading="updateSubmittingId === bug.id" @click="submitBugUpdate(bug)">
                        提交追加
                      </el-button>
                    </div>
                  </div>
                  <div class="bug-actions">
                    <el-radio-group
                      :model-value="bugStatus(bug)"
                      size="small"
                      class="bug-status"
                      :disabled="statusUpdatingBugId === bug.id"
                      @change="(val) => changeBugStatus(bug, val)"
                    >
                      <el-radio-button value="open">未解决</el-radio-button>
                      <el-radio-button value="resolved">已解决</el-radio-button>
                    </el-radio-group>
                    <el-button text type="primary" :icon="CirclePlus" @click="toggleBugUpdate(bug)">
                      {{ activeUpdateBugId === bug.id ? '收起' : '追加 QA' }}
                    </el-button>
                    <el-button
                      text
                      type="danger"
                      :icon="DeleteIcon"
                      :loading="deletingBugId === bug.id"
                      @click="removeBug(bug)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                <div v-if="!bugItems.length" class="empty-bugs">暂无 Bug</div>
              </div>
            </div>
          </transition>
        </section>

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

        <div class="chat-title">
          <span>沟通</span>
        </div>

        <div class="chat">
          <ChatMessage
            v-for="(t, i) in chatItems"
            :key="i"
            :item="t"
            :mine="t.type === 'message'"
          />
          <div v-if="!chatItems.length" class="empty-chat">
            还没有沟通消息，发一条给团队
          </div>
        </div>
      </template>
    </main>

    <MessageComposer v-if="order" ref="composer" :sending="sending" @send="onSend" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Loading, CirclePlus, Delete as DeleteIcon, ArrowDown, ArrowUp, Refresh } from '@element-plus/icons-vue'
import MediaThumb from '@/components/MediaThumb.vue'
import AttachmentUploader from '@/components/AttachmentUploader.vue'
import AttachmentView from '@/components/AttachmentView.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import MessageComposer from '@/components/MessageComposer.vue'
import { getMyOrder, getMyOrderVersion, removeMyOrder, createBug, deleteBug, appendBugUpdate, updateBugStatus, sendMessage } from '@/mock/store'
import { statusMap, priorityMap, TEAM_NAME } from '@/constants/options'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const order = ref(null)
const loading = ref(true)
const loadError = ref('')
const syncState = ref('online')
const syncing = ref(false)
const sending = ref(false)
const bugPanelOpen = ref(false)
const bugCreateOpen = ref(false)
const bugText = ref('')
const bugFiles = ref([])
const bugSubmitting = ref(false)
const deletingBugId = ref(null)
const statusUpdatingBugId = ref(null)
const activeUpdateBugId = ref(null)
const updateText = ref('')
const updateFiles = ref([])
const updateSubmittingId = ref(null)
const scroller = ref(null)
const composer = ref(null)
let poller = null

const chatItems = computed(() => (order.value?.timeline || []).filter((t) => t.type === 'message' || t.type === 'reply'))
const bugItems = computed(() => order.value?.bugs || [])

function bugStatus(bug) {
  return bug?.status === 'resolved' ? 'resolved' : 'open'
}

function isBugResolved(bug) {
  return bugStatus(bug) === 'resolved'
}

function scrollBottom(smooth = false, retry = 2) {
  nextTick(() => {
    const el = scroller.value
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    if (retry > 0) {
      window.requestAnimationFrame(() => scrollBottom(false, retry - 1))
    }
  })
}

function toggleBugPanel() {
  bugPanelOpen.value = !bugPanelOpen.value
}

function openBugCreate() {
  bugPanelOpen.value = true
  bugCreateOpen.value = true
}

async function load(scroll = true, silent = false) {
  if (!silent && !order.value) loading.value = true
  try {
    const vo = await getMyOrder(id)
    order.value = vo
    loadError.value = ''
    syncState.value = 'online'
    if (scroll) scrollBottom()
  } catch (e) {
    if (silent) {
      syncState.value = 'reconnecting'
    } else {
      loadError.value = e.message || '网络连接失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

async function syncNow() {
  if (!order.value || syncing.value || document.visibilityState !== 'visible') return
  if (sending.value || bugSubmitting.value || deletingBugId.value || statusUpdatingBugId.value || updateSubmittingId.value) return
  syncing.value = true
  try {
    const version = await getMyOrderVersion(id)
    if (Number(version?.version || 0) !== Number(order.value.version || 0)) {
      const before = chatItems.value.length
      await load(false, true)
      if (chatItems.value.length > before) scrollBottom(true)
    } else {
      syncState.value = 'online'
    }
  } catch (e) {
    syncState.value = 'reconnecting'
  } finally {
    syncing.value = false
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

async function submitBug() {
  if (!bugText.value.trim() && !bugFiles.value.length) {
    ElMessage.warning('先写说明或粘贴截图')
    return
  }
  bugSubmitting.value = true
  try {
    const vo = await createBug(id, bugText.value.trim(), [...bugFiles.value])
    order.value = vo
    bugText.value = ''
    bugFiles.value = []
    bugPanelOpen.value = true
    bugCreateOpen.value = false
    ElMessage.success('Bug 已创建')
  } catch (e) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    bugSubmitting.value = false
  }
}

async function removeBug(bug) {
  try {
    await ElMessageBox.confirm('删除后双方都看不到这条 Bug，确定删除吗？', '删除 Bug', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    deletingBugId.value = bug.id
    const vo = await deleteBug(bug.id)
    order.value = vo
    ElMessage.success('Bug 已删除')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  } finally {
    deletingBugId.value = null
  }
}

async function changeBugStatus(bug, status) {
  if (!bug || bugStatus(bug) === status) return
  statusUpdatingBugId.value = bug.id
  try {
    const vo = await updateBugStatus(bug.id, status)
    order.value = vo
    ElMessage.success(status === 'resolved' ? '已标记已解决' : '已标记未解决')
  } catch (e) {
    ElMessage.error(e.message || '状态更新失败')
  } finally {
    statusUpdatingBugId.value = null
  }
}

function toggleBugUpdate(bug) {
  if (activeUpdateBugId.value === bug.id) {
    activeUpdateBugId.value = null
    updateText.value = ''
    updateFiles.value = []
    return
  }
  activeUpdateBugId.value = bug.id
  updateText.value = ''
  updateFiles.value = []
}

async function submitBugUpdate(bug) {
  if (!updateText.value.trim() && !updateFiles.value.length) {
    ElMessage.warning('先写追加说明或粘贴截图')
    return
  }
  updateSubmittingId.value = bug.id
  try {
    const vo = await appendBugUpdate(bug.id, updateText.value.trim(), [...updateFiles.value])
    order.value = vo
    updateText.value = ''
    updateFiles.value = []
    activeUpdateBugId.value = null
    ElMessage.success('已追加 QA')
  } catch (e) {
    ElMessage.error(e.message || '追加失败')
  } finally {
    updateSubmittingId.value = null
  }
}

async function removeOrder() {
  try {
    await ElMessageBox.confirm('删除后客户和后台都看不到这个问题，确定删除吗？', '删除问题', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await removeMyOrder(id)
    ElMessage.success('已删除')
    router.push('/projects')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

onMounted(async () => {
  await load(true)
  poller = setInterval(syncNow, 2000)
  window.addEventListener('focus', syncNow)
  document.addEventListener('visibilitychange', syncNow)
})

onBeforeUnmount(() => {
  if (poller) clearInterval(poller)
  window.removeEventListener('focus', syncNow)
  document.removeEventListener('visibilitychange', syncNow)
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
  background: #fdfefe;
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
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.error-state strong {
  color: #303133;
  font-size: 17px;
}
.error-state span {
  max-width: 32rem;
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
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
  background: #fdfefe;
  border-radius: 8px;
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
.bug-section {
  position: sticky;
  top: 0;
  z-index: 20;
  margin-bottom: 10px;
}
.bug-section.is-open {
  z-index: 50;
}
.bug-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 10px 9px 12px;
  background: #fdfefe;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.06);
}
.bug-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.bug-summary strong {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}
.bug-summary span {
  flex: 0 0 auto;
  color: #a8abb2;
  font-size: 12px;
}
.bug-head-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}
.bug-head-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.bug-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  max-height: min(62vh, 520px);
  overflow-y: auto;
  padding: 12px;
  background: #fdfefe;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 18px 40px rgba(31, 45, 61, 0.18);
}
.bug-panel-enter-active,
.bug-panel-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.bug-panel-enter-from,
.bug-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.bug-form {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.bug-upload {
  margin: 10px 0;
}
.bug-form .el-button {
  width: 100%;
}
.bug-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bug-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #f7f9fc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.bug-item.is-resolved {
  background: #f6fbf7;
  border-color: #c8e6c9;
}
.bug-item.is-resolved .bug-body p {
  color: #606266;
}
.bug-body {
  flex: 1;
  min-width: 0;
}
.bug-body p {
  margin: 0 0 8px;
  color: #303133;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.bug-meta {
  margin-top: 8px;
  color: #a8abb2;
  font-size: 12px;
}
.bug-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex: 0 0 auto;
}
.bug-status {
  margin-bottom: 2px;
}
.bug-status :deep(.el-radio-button__inner) {
  padding: 5px 9px;
  font-size: 12px;
}
.bug-updates {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}
.bug-update {
  padding: 9px 10px;
  background: #fdfefe;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.bug-update p {
  margin: 4px 0 8px;
  color: #303133;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.update-meta {
  color: #909399;
  font-size: 12px;
}
.bug-update-form {
  margin-top: 10px;
  padding: 10px;
  background: #fdfefe;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
}
.bug-update-form .el-button {
  width: 100%;
}
.empty-bugs {
  text-align: center;
  color: #a8abb2;
  font-size: 13px;
  padding: 18px 0;
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
