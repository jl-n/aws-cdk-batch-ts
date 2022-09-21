import { LambdaPayload } from '../../shared/types'
import { post } from './api'

export const elements = () => ({
  form: byId<HTMLFormElement>('form'),
  iframe: byId<HTMLIFrameElement>('airtable-embed'),
  refresh: byId('refresh-button'),
})

export const setup = (elems: ReturnType<typeof elements>) => {
  const { form, iframe, refresh } = elems

  const refreshIframe = () => (iframe.src = iframe.src)
  refresh.onclick = (e: Event) => (e.preventDefault(), refreshIframe())

  form.onsubmit = (e: Event) => {
    e.preventDefault()

    const data = Object.fromEntries(new FormData(form).entries())
    const parsed = LambdaPayload.safeParse(data)

    if (!parsed.success) {
      alert('Request payload was invalid, check the console.')
      parsed.error.issues.forEach((x) => console.error(x))
      return
    }

    post(parsed.data).then((x) => {
      alert(x)
      console.log(x)
      setTimeout(refreshIframe, 1000)
    })
  }
}

const byId = <T extends HTMLElement>(id: string) => {
  let elem = document.getElementById(id)
  if (!elem) {
    console.error(`No element with id #${id} found.`, `Using a fixture...`)
    elem = document.createElement('div')
  }
  return elem as T
}
