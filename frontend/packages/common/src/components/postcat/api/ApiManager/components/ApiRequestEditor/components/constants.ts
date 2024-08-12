interface RequestHeader {
  key: string
  forbidden: boolean
}

export const RequestHeaders: RequestHeader[] = [
  { key: 'Authorization', forbidden: false },
  { key: 'Accept', forbidden: false },
  { key: 'Accept-Language', forbidden: false },
  { key: 'Access-Control-Request-Headers', forbidden: true },
  { key: 'Access-Control-Request-Method', forbidden: true },
  { key: 'Accept-Charset', forbidden: true },
  { key: 'Accept-Encoding', forbidden: true },
  { key: 'Cache-Control', forbidden: false },
  { key: 'Content-MD5', forbidden: false },
  { key: 'Content-Type', forbidden: false },
  { key: 'Cookie', forbidden: false },
  { key: 'Content-Length', forbidden: true },
  { key: 'Content-Transfer-Encoding', forbidden: true },
  { key: 'Date', forbidden: true },
  { key: 'Expect', forbidden: true },
  { key: 'From', forbidden: false },
  { key: 'Host', forbidden: true },
  { key: 'If-Match', forbidden: false },
  { key: 'If-Modified-Since', forbidden: false },
  { key: 'If-None-Match', forbidden: false },
  { key: 'If-Range', forbidden: false },
  { key: 'If-Unmodified-Since', forbidden: false },
  { key: 'Keep-Alive', forbidden: true },
  { key: 'Max-Forwards', forbidden: false },
  { key: 'Origin', forbidden: true },
  { key: 'Pragma', forbidden: false },
  { key: 'Proxy-Authorization', forbidden: false },
  { key: 'Range', forbidden: false },
  { key: 'Referer', forbidden: true },
  { key: 'TE', forbidden: true },
  { key: 'Trailer', forbidden: true },
  { key: 'Transfer-Encoding', forbidden: true },
  { key: 'Upgrade', forbidden: true },
  { key: 'User-Agent', forbidden: true },
  { key: 'Via', forbidden: true },
  { key: 'Warning', forbidden: false },
  { key: 'X-Requested-With', forbidden: false },
  { key: 'X-Do-Not-Track', forbidden: false },
  { key: 'DNT', forbidden: false },
  { key: 'x-api-key', forbidden: false },
  { key: 'Connection', forbidden: true }
]

/**
 * https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
 */
export const ForbiddenHeaderName = [
  'age',
  'via',
  'accept-ranges',
  'nginx-hit',
  'referrer-policy',
  'location',
  'content-security-policy',
  'strict-transport-security',
  'server',
  'vary',
  ...RequestHeaders.filter((header) => header.forbidden).map((val) => val.key.toLowerCase())
]
