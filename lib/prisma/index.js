import { PrismaClient } from '@prisma/client'

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

prisma.$use(async (params, next) => {
  const result = await next(params)
  // if (params.model === 'answers' && params.action === 'createMany') {
  //   const stopId = params.args.data[0].stopId
  // }
  return result
})

export default prisma
