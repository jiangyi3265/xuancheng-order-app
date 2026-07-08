<template>
  <div class="composer" @paste="onPaste">
    <!-- 待发送附件预览 -->
    <div v-if="pending.length" class="pending">
      <template v-for="(a, i) in pending" :key="i">
        <div v-if="a.type === 'audio'" class="audio-chip">
          <el-icon><Microphone /></el-icon>
          <span>语音 {{ a.duration || 0 }}"</span>
          <el-icon class="rm" @click="remove(i)"><Close /></el-icon>
        </div>
        <MediaThumb v-else :item="a" :size="66" removable @remove="remove(i)" />
      </template>
    </div>

    <div class="row">
      <el-button circle :icon="Picture" title="图片 / 视频" @click="pickMedia" />
      <VoiceRecorder @recorded="onRecorded" />
      <el-input
        v-model="text"
        class="text"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 4 }"
        resize="none"
        placeholder="输入消息，回车发送…"
        @keydown.enter.exact.prevent="doSend"
      />
      <el-button type="primary" :icon="Promotion" :loading="sending" :disabled="!canSend" @click="doSend">
        发送
      </el-button>
    </div>

    <input ref="fileEl" type="file" accept="image/*,video/*" multiple class="hidden-input" @change="onFiles" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Picture, Promotion, Microphone, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MediaThumb from './MediaThumb.vue'
import VoiceRecorder from './VoiceRecorder.vue'
import { attType, extOf } from '@/utils/file'

const props = defineProps({ sending: { type: Boolean, default: false } })
const emit = defineEmits(['send'])

const text = ref('')
const pending = ref([])
const fileEl = ref(null)

const canSend = computed(() => !props.sending && (text.value.trim() || pending.value.length))

function pickMedia() {
  fileEl.value && fileEl.value.click()
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

async function addFiles(files) {
  for (const f of files) {
    if (pending.value.length >= 9) {
      ElMessage.warning('单条消息最多 9 个附件')
      break
    }
    if (f.size > 50 * 1024 * 1024) {
      ElMessage.warning(`「${f.name}」超过 50MB，上传和预览可能较慢`)
    }
    const url = await fileToDataUrl(f)
    pending.value.push({ name: f.name || '附件', url, type: attType(f.type, f.name), size: f.size, ext: extOf(f.name) })
  }
}

async function onFiles(e) {
  await addFiles(Array.from(e.target.files || []))
  e.target.value = ''
}

function onPaste(e) {
  const items = (e.clipboardData && e.clipboardData.items) || []
  const images = []
  for (const item of items) {
    if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) images.push(file)
    }
  }
  if (images.length) {
    e.preventDefault()
    addFiles(images)
  }
}

function onRecorded(item) {
  pending.value.push(item)
}

function remove(i) {
  pending.value.splice(i, 1)
}

function doSend() {
  if (!canSend.value) return
  emit('send', { content: text.value.trim(), attachments: [...pending.value] })
}

// 由父组件在成功后调用清空
function reset() {
  text.value = ''
  pending.value = []
}
defineExpose({ reset })
</script>

<style scoped>
.composer {
  background: #fff;
  border-top: 1px solid #ebeef5;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0));
}
.pending {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.audio-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 66px;
  padding: 0 12px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  color: #409eff;
  font-size: 13px;
}
.audio-chip .rm {
  cursor: pointer;
  color: #909399;
}
.audio-chip .rm:hover {
  color: #f56c6c;
}
.row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.text {
  flex: 1;
}
.hidden-input {
  display: none;
}
</style>
