const UserModel = require('db/models').User
const PhoneModel = require('db/models').Phone
const { message, errors, jwtGenerate, hash, constant } = require('server/utils')

const create = async (ctx, token) => {
  try {
    const user = await UserModel.findOrCreate({
      where: {
        email: ctx.payload.user.email
      }, defaults: {
        ...ctx.payload.user,
        token: hash.generate(token)
      }
    })

    return user
  } catch (err) {
    throw err
  }
}

const update = async (id, guid) => {
  const token = jwtGenerate(guid)
  const payload = {
    token: hash.generate(token),
    lastLogin: new Date()
  }

  await UserModel.update({
    ...payload
  }, {
    where: {
      id
    }
  })

  return  {
    token,
    lastLogin: payload.lastLogin
  }
}

const findAll = async ctx => {
  try {
    return await UserModel.findAll()
  } catch (err) {
    throw new Error()
  }
}

const findByEmail = async ctx => {
  try {
    return await UserModel.findOne({
      where: {
        email: ctx.payload.email
      },
      include: [{
        model: PhoneModel,
        as: 'phones'
      }]
    })
  } catch (err) {
    throw err
  }
}

const findByGuid = async ctx => {
  try {
    return await UserModel.findOne({
      where: {
        guid: ctx.params.guid
      },
      include: [{
        model: PhoneModel,
        as: 'phones'
      }]
    })
  } catch (err) {
    throw err
  }
}

const search = async ctx => {
  try {
    const user = await UserModel.findOne({
      where: {
        guid: ctx.params.guid
      }, attributes: {
        exclude: ['password']
      },
      include: [{
        model: PhoneModel,
        as: 'phones'
      }]
    })
    delete user.dataValues.id

    if (user && hash.compare(ctx.headers.authentication, user.token)) {
      if ((Date.now() - user.dataValues.createdAt.valueOf())/constant.msInMinute < constant.limLastLogin) {
        formatFieldDate(user.dataValues)
        
        ctx.status = 200
        ctx.body = user
      } else {
        return errors.unauthorized(ctx, message.invalidSession)
      }
    } else {
      return errors.unauthorized(ctx, message.unauthorized)
    }
  } catch (err) {
    return errors.InternalServerError(ctx, err)
  }
}

module.exports = {
  create,
  update,
  search,
  findByGuid,
  findByEmail,
  findAll
}
