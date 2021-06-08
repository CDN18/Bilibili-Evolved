const getOption = () => {
  const option = settings.aria2RpcOption
  const host = option.host.match(/^http[s]?:\/\//) ? option.host : 'http://' + option.host
  const methodName = 'aria2.addUri'
  return {
    option,
    host,
    methodName
  }
}
interface RpcParam {
  id: string
  params: any[]
}
const rpc = async (getResponse: () => Promise<any>, batch = false) => {
  try {
    let response = await getResponse()
    if (typeof response === 'string') {
      response = JSON.parse(response)
    }
    if (response.error !== undefined) {
      if (response.error.code === 1) {
        logError(`请求遭到拒绝, 请检查您的密钥相关设置.`)
      } else {
        logError(`请求发生错误, code = ${response.error.code}, message = ${response.error.message}`)
      }
      return false
    }
    if (!batch) {
      Toast.success(`成功发送了请求, GID = ${response.result}`, 'aria2 RPC', 5000)
    }
    return true
  } catch (error) { // Host or port is invalid
    logError(`无法连接到RPC主机.`)
    return false
  }
}
const getRpc = async (rpcParam: RpcParam, batch = false) => {
  const { option, host, methodName } = getOption()
  return await rpc(async () => {
    const base64Params = window.btoa(unescape(encodeURIComponent(JSON.stringify(rpcParam.params))))
    const url = `${host}:${option.port}/jsonrpc?method=${methodName}&id=${rpcParam.id}&params=${base64Params}`
    console.log(`RPC request:`, url)
    if (url.startsWith('http:')) {
      return await new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'GET',
          url,
          responseType: 'json',
          onload: r => resolve(r.response),
          onerror: r => reject(r),
        })
      })
    } else {
      return await Ajax.getJson(url)
    }
  }, batch)
}
const postRpc = async (rpcParam: RpcParam, batch = false) => {
  const { option, host, methodName } = getOption()
  return await rpc(async () => {
    const url = `${host}:${option.port}/jsonrpc`
    const data = {
      method: methodName,
      id: rpcParam.id,
      params: rpcParam.params,
    }
    if (url.startsWith('http:')) {
      return await new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: 'POST',
          url,
          responseType: 'json',
          data: JSON.stringify(data),
          onload: r => resolve(r.response),
          onerror: r => reject(r),
        })
      })
    } else {
      return await Ajax.postJson(url, data)
    }
  }, batch)
}
export const sendRpc = async (params: RpcParam[], batch = false) => {
  const option = settings.aria2RpcOption
  for (const param of params) {
    let result: boolean
    if (option.method === 'get') {
      result = await getRpc(param, batch)
    } else {
      result = await postRpc(param, batch)
    }
    if (batch === true && result === false) {
      logError(`${decodeURIComponent(param.id)} 导出失败`)
    }
  }
}
export const parseRpcOptions = (option: string): Record<string, string> => {
  if (!option) {
    return {}
  }
  const pairs = option
    .split('\n')
    .map(line => {
      // 实际上就是按第一个 = 号分割出 key / value, 其他后面的 = 还是算进 value 里
      const [key, ...values] = line
        .trim()
        .split('=')
      return [key.trim(), values.join('=').trim()]
    })
    .filter(it => Boolean(it[1])) // 过滤掉没有 = 的行 (value 为空)
  return Object.fromEntries(pairs)
}
export default {
  export: {
    sendRpc,
    parseRpcOptions,
  },
}
