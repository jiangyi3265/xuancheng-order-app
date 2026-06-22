import { ref } from 'vue'

export const customerToken = ref(localStorage.getItem('customerToken') || '')
export const customerName = ref(localStorage.getItem('customerName') || '')

export async function customerLogin(username, password) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
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
