import { ref } from 'vue'

export const customerToken = ref(localStorage.getItem('customerToken') || '')
export const customerName = ref(localStorage.getItem('customerName') || '')

export async function getCaptcha() {
  const res = await fetch('/captchaImage')
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.msg || 'captcha failed')
  return json
}

export async function customerLogin(username, password, captcha = {}) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, code: captcha.code || '', uuid: captcha.uuid || '' })
  })
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.msg || '登录失败')
  customerToken.value = json.token
  customerName.value = username
  localStorage.setItem('customerToken', json.token)
  localStorage.setItem('customerName', username)
}

export function customerLogout() {
  customerToken.value = ''
  customerName.value = ''
  localStorage.removeItem('customerToken')
  localStorage.removeItem('customerName')
}

export async function listMyOrders() {
  return await customerHttp('/jiedan/portal/orders')
}

export async function getMyOrder(id) {
  return await customerHttp('/jiedan/portal/orders/' + id)
}

export async function removeMyOrder(id) {
  return await customerHttp('/jiedan/portal/orders/' + id, { method: 'DELETE' })
}

export async function createBug(orderId, content, attachments = []) {
  return await customerHttp('/jiedan/portal/bug', {
    method: 'POST',
    body: JSON.stringify({ orderId, content, attachments })
  })
}

export async function deleteBug(id) {
  return await customerHttp('/jiedan/portal/bug/' + id, { method: 'DELETE' })
}

export async function sendMessage(orderId, content, attachments = []) {
  return await customerHttp('/jiedan/portal/message', {
    method: 'POST',
    body: JSON.stringify({ orderId, content, attachments })
  })
}

export async function customerHttp(url, opts = {}) {
  const { headers: h, ...rest } = opts
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(customerToken.value ? { Authorization: 'Bearer ' + customerToken.value } : {}),
      ...(h || {})
    },
    ...rest
  })
  const json = await res.json()
  if (json.code === 401) {
    customerLogout()
    if (location.hash !== '#/customer-login') location.hash = '#/customer-login'
    throw new Error('客户登录已过期，请重新登录')
  }
  if (json.code !== 200) throw new Error(json.msg || '请求失败')
  return json.data
}
