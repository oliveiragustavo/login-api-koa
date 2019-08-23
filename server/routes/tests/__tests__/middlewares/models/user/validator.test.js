const { Joi } = require('server/utils')

const userValidator = require('server/validators/user')
const { userValidatorSchema, userValidatorSchemaSignIn } = require('server/routes/tests/schemas/user')

// ========================= payloads =========================
const payloadCreate = {
  request: {
    body: {
      name: 'gustavo',
      email: 'gof@cin.ufpe.br',
      password: '123',
      cep: '57041-100'
    },
    phones: [{
        number: '123455678',
        ddd: '81'
      }, {
        number: '1234556780',
        ddd: '82'
      }
    ]
  }
}

const payloadSignIn = {
  request: {
      body: {
        email: payloadCreate.request.body.email,
        password: payloadCreate.request.body.password
      }
    }
}

// ========================= auxiliary functions =========================
const next = (value) => {
  return value
}

const create = async (payload) => {
  return await userValidator.create(payload, next)
}

const signIn = async (payload) => {
  return await userValidator.signIn(payload, next)
}

// ========================= start test =========================
describe('user', () => {
  describe('validator', () => {
    describe('Success', () => {
      test('create', async () => {
        const checkPayload = await create(payloadCreate)

        const { error, value } = Joi.validate(checkPayload, userValidatorSchema)

        expect(error).toBeNull();
      })

      test('signIn', async () => {
        const checkPayload = await signIn(payloadSignIn)

        const { error, value } = Joi.validate(checkPayload, userValidatorSchemaSignIn)

        expect(error).toBeNull();
      })
    })

    describe('Error', () => {
      test('userValidator.create', async () => {
        payloadCreate.request.body.password = 123 // to be false
        const checkPayload = await create(payloadCreate)

        const { error, value } = Joi.validate(checkPayload, userValidatorSchema)

        expect(error).not.toBeNull();
      })

    test('signIn', async () => {
        payloadSignIn.request.body.email = 'casa@casa'
        const checkPayload = await signIn(payloadSignIn)

        const { error, value } = Joi.validate(checkPayload, userValidatorSchemaSignIn)

        expect(error).not.toBeNull();
      })
    })
  })
})
