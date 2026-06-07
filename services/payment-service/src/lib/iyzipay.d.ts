declare module 'iyzipay' {
  interface IyzipayOptions {
    apiKey: string
    secretKey: string
    uri: string
  }

  class Iyzipay {
    constructor(options: IyzipayOptions)
    payment: {
      create(request: object, callback: (err: any, result: any) => void): void
    }
  }

  export = Iyzipay
}
