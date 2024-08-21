import bcrypt from 'bcrypt'

const hashPassword = async (password) => {
  const salt = process.env.saltRounds
  let pass = await bcrypt.hash(password, parseInt(salt)).then((hash) => {
    return hash
  })
  return pass
}

const comparePassword = async (plain, hash) => {
  let compPass = await bcrypt.compare(plain, hash).then((result) => {
    return result
  })
  return compPass
}

export default {
  hashPassword,
  comparePassword
}
