import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const { Schema } = mongoose

const UserSchema = new Schema({
  email: String,
  hash: String,
  salt: String
})

UserSchema.methods.setPassword = password => {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
}

UserSchema.methods.validatePassword = password => {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
  return this.hash == hash
}

const expireAfterDay = 1
UserSchema.methods.generateJWT = () => {
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + expireAfterDay)

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10)
    },
    'secret'
  )
}

UserSchema.methods.toAuthJson = () => {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT()
  }
}

mongoose.model('User', UserSchema)
