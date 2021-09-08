require('dotenv').config()
const { json } = require('express')
const express = require('express')
const auth = require('./middleware/auth')
const app = express()
const pool = require('./config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const port = 5000

app.use(express.json({
    limit: "50mb"
}))

app.post('/register', async(req, res) => {
    try{
        const {firstName, lastName, email, password} = req.body

        if(!(email && password && firstName && lastName)) {
            res.status(400).json({
                status: false,
                message: 'All input is required'
            })
        }

        var encryptedUserPassword = await bcrypt.hash(password, 10)

        pool.query(`SELECT * FROM customer WHERE email = '${email}'`, (error, result) => {
            if(error) {
                res.status(400).json({
                    status: false,
                    message: 'User already registered'
                })
            }

            var isExist = result.rowCount
            console.log(isExist, '<<<<')
            
            if(isExist == 1) {
                res.status(400).json({
                    status: false,
                    message: 'User already registered'
                })
            } else {

                pool.query('INSERT INTO customer (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [firstName, lastName, email, encryptedUserPassword], (error) => {
                if(error){
                    res.status(400).json({
                        status: false,
                        message: 'Failed register user'
                    })
                }
                })

                res.status(200).json({
                    status: true,
                    message: 'Success'
                })
            }
        })

    }catch (err) {
        res.status(400).json({
            status: false,
            message: err
        })
    }
})

app.post('/login', async(req,res) => {
    try{
        const {email, password} = req.body

        if(!(email && password)) {
            res.status(400).json({
                status: false,
                message: 'All input is required'
            })
        }

        pool.query(`SELECT * FROM customer WHERE email = '${email}'`, (error, result) => {
            if(error) {
                res.status(400).json({
                    status: false,
                    message: 'User not found'
                })
            }

            var passUser = result.rows[0].password

            if ((bcrypt.compare(password, passUser))){
                const token = jwt.sign(
                    {
                        id: result.rows[0].id,
                        email
                    },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "1h"
                    }
                )
    
                result.rows[0].token = token
    
                return res.status(200).json(result.rows[0])
            }
            return res.status(400).send('Invalid credentials!')

        })

    }catch (err) {
        console.log(err)
    }
})

app.get('/get-all-user', auth, async(req, res) => {

    pool.query('select first_name, last_name, email from customer',(error, result) => {
        if(error) {
            res.status(400).json({
                status: false,
                message: 'Show Failed'
            })
        }
        return  res.status(200).send(result.rows);
    })
})



app.listen(port, () => {
    console.log(`server is up and running at port ${port}`)
})


