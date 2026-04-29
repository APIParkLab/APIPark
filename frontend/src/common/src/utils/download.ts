export const decodeBase64ToUnicode = (base64Str: string): string => {
  // Decode base64 to a string using atob and convert it to a unicode string.
  return decodeURIComponent(
    atob(base64Str)
      .split('')
      ?.map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  )
}

interface DownloadOptions {
  body: string
  contentType: 'formdata' | 'raw' | 'binary'
  responseType: 'text' | 'longText' | 'stream'
  filename: string
  uri: string
}

const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const buffer = new ArrayBuffer(str.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i) & 0xff
  }
  return buffer
}

export const createBlobUrl = (data: string, fileType: string): string => {
  // Create a Blob URL from the given data and file type.
  const blob = new Blob([stringToArrayBuffer(data)], { type: fileType })
  return URL.createObjectURL(blob)
}

export const downloadFile = ({ body, contentType, responseType, filename, uri }: DownloadOptions): void => {
  let content = body

  // Decode the body if needed.
  if (responseType === 'longText' || responseType === 'stream') {
    content = decodeBase64ToUnicode(content)
  } else if (responseType === 'text') {
    try {
      content = JSON.stringify(JSON.parse(content), null, 4)
    } catch {
      // Fallback to raw content on parsing error.
    }
  }

  // Create a Blob URL for downloading.
  const blobUrl = contentType.startsWith('image') ? uri : createBlobUrl(content, contentType)
  const downloadFilename = decodeURI(filename || 'default_name')

  // Create a temporary anchor element for downloading.
  const anchor = document.createElement('a')
  anchor.style.display = 'none'
  anchor.href = blobUrl
  anchor.download = downloadFilename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  // Revoke the Blob URL to free resources.
  URL.revokeObjectURL(blobUrl)
}

export const downloadFileFromText = (fileName: string, text: string) => {
  const file = new Blob([text], { type: 'data:text/plain;charset=utf-8' })

  const element = document.createElement('a')
  const url = URL.createObjectURL(file)
  element.href = url
  element.download = fileName
  document.body.appendChild(element)
  element.click()
  Promise.resolve().then(() => {
    document.body.removeChild(element)
    window.URL.revokeObjectURL(url)
  })
}
