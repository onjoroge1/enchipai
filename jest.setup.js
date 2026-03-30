// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next-auth and @auth/core before any imports
jest.mock('next-auth', () => ({
  default: jest.fn(),
  getServerSession: jest.fn(),
}))

jest.mock('next-auth/providers/credentials', () => ({
  default: jest.fn(),
  Credentials: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
  })),
  CredentialsProvider: jest.fn(),
}))

jest.mock('@auth/core', () => ({
  Auth: jest.fn(),
  customFetch: jest.fn(),
}))

jest.mock('@auth/core/providers/credentials', () => ({
  default: jest.fn(),
}))

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
  encode: jest.fn(),
  decode: jest.fn(),
}))

// Polyfill for Next.js Request/Response
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js Request/Response
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Headers(init.headers)
      this.body = init.body
    }
  }
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Headers(init.headers)
    }
    json() {
      return Promise.resolve(JSON.parse(this.body))
    }
    text() {
      return Promise.resolve(this.body)
    }
  }
}

// Mock Next.js NextRequest
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextRequest: class NextRequest extends Request {
      constructor(input, init = {}) {
        super(input, init)
        this.nextUrl = {
          pathname: new URL(input).pathname,
          searchParams: new URL(input).searchParams,
        }
        this.cookies = {
          get: jest.fn(),
          set: jest.fn(),
        }
      }
    },
    NextResponse: {
      json: (body, init) => {
        return new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        })
      },
    },
  }
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

