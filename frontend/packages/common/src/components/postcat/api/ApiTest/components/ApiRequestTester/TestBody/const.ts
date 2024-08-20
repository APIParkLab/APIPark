export type ContentType = "text/plain" | "application/json" | "application/xml" | "text/html" | "application/javascript" | 'application/x-www-form-urlencoded' | 'multipart/form-data'

export type MimeTypeKey = 'Text' | 'JSON' | 'XML' | 'HTML' | 'JavaScript'

export type FormContentTypeKey = 'x-www-form-urlencoded' | 'multipart/form-data'

export const MimeTypes: {
  title: MimeTypeKey,
  value: ContentType
}[] = [
    {
      title:'Text',
      value: 'text/plain'
    },
    {
      title:'JSON',
      value: 'application/json'
    },
    {
      title:'XML',
      value: 'application/xml'
    },
    {
      title:'HTML',
      value: 'text/html'
    },
    {
      title:'JavaScript',
      value: 'application/javascript'
    }
  ]

export const FormContentTypes: {
  title: FormContentTypeKey,
  value: ContentType
}[] = [
    {
      title:'x-www-form-urlencoded',
      value: 'application/x-www-form-urlencoded'
    },
    {
      title:'multipart/form-data',
      value: 'multipart/form-data'
    }
  ]