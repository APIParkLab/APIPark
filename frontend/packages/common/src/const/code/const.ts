const CODE_LANG =  [
  {
    label: 'Java(OK HTTP)',
    value: 20
  },
  {
    label: 'PHP',
    value: 9,
    children: [
      {
        label: 'pecl_http',
        value: 10
      },
      {
        label: 'cURL',
        value: 11
      }
    ]
  },
  {
    label: 'Python',
    value: 12,
    children: [
      {
        label: 'http.client(Python 3)',
        value: 13
      },
      {
        label: 'Requests',
        value: 14
      }
    ]
  },
  {
    label: 'HTTP',
    value: 1
  },
  {
    label: 'cURL',
    value: 2
  },
  {
    label: 'JavaScript',
    value: 3,
    children: [
      {
        label: 'Jquery AJAX',
        value: 4
      },
      {
        label: 'XHR',
        value: 5
      }
    ]
  },
  {
    label: 'NodeJS',
    value: 6,
    children: [
      {
        label: 'Native',
        value: 7
      },
      {
        label: 'Request',
        value: 8
      }
    ]
  },
  {
    label: '微信小程序',
    value: 21
  },
  // {
  //   label: 'Ruby(Net:Http)',
  //   value: 15
  // },
  {
    label: 'Shell',
    value: 16,
    children: [
      {
        label: 'Httpie',
        value: 17
      },
      {
        label: 'cUrl',
        value: 18
      }
    ]
  },
  {
    label: 'Go',
    value: 19
  }
]

export default CODE_LANG